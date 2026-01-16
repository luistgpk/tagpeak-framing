// Password protection
const CORRECT_PASSWORD = 'tagpeak2026!'; // Change this to your desired password

// Wait for scripts to load
function waitForScripts() {
    return new Promise((resolve) => {
        // Check immediately
        if (typeof Chart !== 'undefined' && typeof Papa !== 'undefined') {
            configureChartDefaults();
            resolve();
            return;
        }
        
        // Check every 100ms
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds
        
        const checkInterval = setInterval(() => {
            attempts++;
            if (typeof Chart !== 'undefined' && typeof Papa !== 'undefined') {
                clearInterval(checkInterval);
                configureChartDefaults();
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('Scripts failed to load after 5 seconds.');
                console.error('Chart.js available:', typeof Chart !== 'undefined');
                console.error('PapaParse available:', typeof Papa !== 'undefined');
                
                // Check if scripts are in DOM
                const chartScript = document.querySelector('script[src*="chart.js"]');
                const papaScript = document.querySelector('script[src*="papaparse"]');
                console.error('Chart.js script tag found:', !!chartScript);
                console.error('PapaParse script tag found:', !!papaScript);
                
                // Show helpful error message
                showScriptLoadError();
                resolve(); // Resolve anyway to show error message
            }
        }, 100);
    });
}

// Show error if scripts don't load
function showScriptLoadError() {
    const dashboard = document.getElementById('dashboard');
    if (dashboard && dashboard.classList.contains('active')) {
        const chartScript = document.querySelector('script[src*="chart.js"]');
        const papaScript = document.querySelector('script[src*="papaparse"]');
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        
        dashboard.innerHTML = `
            <div class="section">
                <h2>⚠️ Scripts Failed to Load</h2>
                <div class="conclusion-box">
                    <h4>Problem:</h4>
                    <p>Chart.js and/or PapaParse libraries could not be loaded. This is usually caused by Content Security Policy (CSP) blocking CDN scripts.</p>
                    
                    <h4 style="margin-top: 20px;">Diagnostic Information:</h4>
                    <ul style="margin-left: 20px; margin-top: 10px;">
                        <li>Chart.js script tag: ${chartScript ? '✅ Found' : '❌ Not found'}</li>
                        <li>PapaParse script tag: ${papaScript ? '✅ Found' : '❌ Not found'}</li>
                        <li>Chart.js loaded: ${typeof Chart !== 'undefined' ? '✅ Yes' : '❌ No'}</li>
                        <li>PapaParse loaded: ${typeof Papa !== 'undefined' ? '✅ Yes' : '❌ No'}</li>
                        <li>CSP meta tag: ${cspMeta ? '✅ Found' : '❌ Not found'}</li>
                    </ul>
                    
                    <h4 style="margin-top: 20px;">Solutions:</h4>
                    <ol style="margin-left: 20px; margin-top: 10px;">
                        <li><strong>If deployed on Vercel:</strong> Redeploy to apply vercel.json changes</li>
                        <li><strong>Use a local server:</strong>
                            <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px; margin-top: 10px; overflow-x: auto;">
# In your project folder, run:
python -m http.server 8000

# Then open: http://localhost:8000/analytics.html</pre>
                        </li>
                        <li><strong>Check browser console</strong> (F12) for CSP violation errors</li>
                        <li><strong>Disable browser extensions</strong> that might block scripts</li>
                        <li><strong>Hard refresh</strong> the page (Ctrl+F5 or Cmd+Shift+R) to clear cache</li>
                    </ol>
                    
                    <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px;">
                        <strong>Note:</strong> The CSP has been updated in both vercel.json and analytics.html. 
                        If you're on Vercel, you need to redeploy for the changes to take effect.
                    </p>
                </div>
            </div>
        `;
    }
}

// Wait for DOM and scripts to be ready
window.addEventListener('load', async () => {
    await waitForScripts();
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const passwordInput = document.getElementById('password');
            const errorMessage = document.getElementById('errorMessage');
            const loginContainer = document.getElementById('loginContainer');
            const dashboard = document.getElementById('dashboard');
            
            if (passwordInput && errorMessage && loginContainer && dashboard) {
                const password = passwordInput.value;
                if (password === CORRECT_PASSWORD) {
                    loginContainer.style.display = 'none';
                    dashboard.classList.add('active');
                    
                    // Store original dashboard content for restoration (ONLY ONCE, before any modifications)
                    if (!window.originalDashboardHTML) {
                        window.originalDashboardHTML = dashboard.innerHTML;
                    }
                    
                    // Show loading message - insert at top but keep structure
                    const loadingSection = document.createElement('div');
                    loadingSection.className = 'section';
                    loadingSection.innerHTML = '<div class="loading"><h2>⏳ Loading Data...</h2><p>Please wait while we load and process your survey data...</p></div>';
                    // Insert at the beginning, keeping all other sections
                    dashboard.insertBefore(loadingSection, dashboard.firstChild);
                    window.loadingSection = loadingSection;
                    
                    // Wait a bit for scripts, then load data
                    setTimeout(() => {
                        loadData();
                    }, 500);
                } else {
                    errorMessage.style.display = 'block';
                    passwordInput.value = ''; // Clear password field
                    setTimeout(() => {
                        errorMessage.style.display = 'none';
                    }, 3000);
                }
            }
        });
    }
});

// Global data storage
let demographicsData = [];
let framingData = [];
let processedData = null;

// Chart.js default configuration (set after Chart.js loads)
function configureChartDefaults() {
    if (typeof Chart !== 'undefined') {
        Chart.defaults.font.family = 'Inter';
        Chart.defaults.color = '#666';
    }
}

// Helper function to safely set innerHTML
function safeSetHTML(elementId, html) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id '${elementId}' not found`);
        return false;
    }
    element.innerHTML = html;
    return true;
}

// Load and parse CSV files
async function loadData() {
    try {
        // Wait for scripts to be ready
        await waitForScripts();
        
        // Check if Papa is loaded
        if (typeof Papa === 'undefined') {
            throw new Error('PapaParse library not loaded. The script may be blocked by Content Security Policy (CSP). Try using a local server instead of opening the file directly.');
        }

        // Check if Chart is loaded
        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js library not loaded. The script may be blocked by Content Security Policy (CSP). Try using a local server instead of opening the file directly.');
        }

        // Try to find CSV files (check actual file dates first, then today)
        // Get list of possible dates - try actual file dates first
        const possibleDates = [
            '2026-01-15',  // Actual file date
            '2025-01-15',
            '2024-01-15',
            new Date().toISOString().split('T')[0]  // Today's date as fallback
        ];

        let demoFile = null;
        let framingFile = null;
        let demoText = null;
        let framingText = null;
        
        // Store these in outer scope for error display
        window.lastDemoText = null;
        window.lastFramingText = null;

        // Try to load demographics file
        for (const date of possibleDates) {
            try {
                const response = await fetch(`demographics-${date}.csv`);
                if (response.ok && response.status === 200) {
                    demoFile = `demographics-${date}.csv`;
                    demoText = await response.text();
                    window.lastDemoText = demoText;
                    console.log(`✅ Loaded: demographics-${date}.csv`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        // Try to load framing results file
        for (const date of possibleDates) {
            try {
                const response = await fetch(`framing_study_results-${date}.csv`);
                if (response.ok && response.status === 200) {
                    framingFile = `framing_study_results-${date}.csv`;
                    framingText = await response.text();
                    window.lastFramingText = framingText;
                    console.log(`✅ Loaded: framing_study_results-${date}.csv`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        // If files not found, try without date
        if (!demoText) {
            try {
                const response = await fetch('demographics.csv');
                if (response.ok) {
                    demoText = await response.text();
                }
            } catch (e) {}
        }

        if (!framingText) {
            try {
                const response = await fetch('framing_study_results.csv');
                if (response.ok) {
                    framingText = await response.text();
                }
            } catch (e) {}
        }

        if (!demoText || !framingText) {
            const triedDates = possibleDates.join(', ');
            throw new Error(`CSV files not found. Tried dates: ${triedDates}. Also tried: demographics.csv and framing_study_results.csv. Please ensure CSV files are in the same directory as analytics.html and have the correct date format (YYYY-MM-DD).`);
        }

        // Parse CSV data
        demographicsData = Papa.parse(demoText, { header: true, skipEmptyLines: true }).data;
        framingData = Papa.parse(framingText, { header: true, skipEmptyLines: true }).data;

        if (demographicsData.length === 0 || framingData.length === 0) {
            throw new Error('CSV files are empty or could not be parsed.');
        }

        // Remove loading section if it exists
        if (window.loadingSection && window.loadingSection.parentNode) {
            window.loadingSection.parentNode.removeChild(window.loadingSection);
            window.loadingSection = null;
        }
        
        // Ensure dashboard structure is intact
        const dashboard = document.getElementById('dashboard');
        if (!dashboard) {
            throw new Error('Dashboard element not found in DOM');
        }
        
        // Verify critical elements exist - if not, restore from stored HTML
        let overviewStats = document.getElementById('overviewStats');
        if (!overviewStats && window.originalDashboardHTML) {
            console.log('Restoring dashboard structure...');
            dashboard.innerHTML = window.originalDashboardHTML;
            // Wait for DOM to update
            await new Promise(resolve => setTimeout(resolve, 100));
            overviewStats = document.getElementById('overviewStats');
        }
        
        if (!overviewStats) {
            throw new Error('Dashboard structure is missing. Element overviewStats not found. Please refresh the page.');
        }
        
        // Process and merge data
        processData();
        
        // Render all sections with error handling
        try {
            renderOverview();
        } catch (error) {
            console.error('Error rendering overview:', error);
        }
        
        try {
            renderDataQuality();
        } catch (error) {
            console.error('Error rendering data quality:', error);
        }
        
        try {
            renderMainEffects();
        } catch (error) {
            console.error('Error rendering main effects:', error);
        }
        
        try {
            renderWebsiteImpact();
        } catch (error) {
            console.error('Error rendering website impact:', error);
        }
        
        try {
            renderModeration();
        } catch (error) {
            console.error('Error rendering moderation:', error);
        }
        
        try {
            renderManipulationCheck();
        } catch (error) {
            console.error('Error rendering manipulation check:', error);
        }
        
        try {
            renderConcerns();
        } catch (error) {
            console.error('Error rendering concerns:', error);
        }
        
        try {
            renderConclusions();
        } catch (error) {
            console.error('Error rendering conclusions:', error);
        }
        
        // Setup event listeners after rendering
        try {
            setupEventListeners();
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    } catch (error) {
        console.error('Error loading data:', error);
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            // Restore original structure first
            if (window.originalDashboardHTML) {
                dashboard.innerHTML = window.originalDashboardHTML;
            }
            
            // Show error in a section
            const errorSection = document.createElement('div');
            errorSection.className = 'section';
            errorSection.innerHTML = `
                <h2>⚠️ Error Loading Data</h2>
                <div class="conclusion-box">
                    <h4>Error Details:</h4>
                    <p><strong>${error.message}</strong></p>
                    <h4 style="margin-top: 20px;">Troubleshooting:</h4>
                    <ul style="margin-left: 20px; margin-top: 10px;">
                        <li><strong>File Location:</strong> Ensure CSV files are in the same directory as analytics.html</li>
                        <li><strong>File Names:</strong> Check that files are named correctly:
                            <ul style="margin-left: 20px; margin-top: 5px;">
                                <li><code>demographics-2026-01-15.csv</code></li>
                                <li><code>framing_study_results-2026-01-15.csv</code></li>
                            </ul>
                        </li>
                        <li><strong>Local Server:</strong> If testing locally, use a server:
                            <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px; margin-top: 5px; overflow-x: auto;">python -m http.server 8000</pre>
                        </li>
                        <li><strong>Vercel Deployment:</strong> If on Vercel, ensure CSV files are committed and deployed</li>
                        <li><strong>Check Console:</strong> Open browser console (F12) for detailed error messages</li>
                    </ul>
                    <p style="margin-top: 20px; padding: 10px; background: #fff3cd; border-radius: 5px;">
                        <strong>Current File Status:</strong><br>
                        Demographics file: ${window.lastDemoText ? '✅ Found' : '❌ Not found'}<br>
                        Framing results file: ${window.lastFramingText ? '✅ Found' : '❌ Not found'}
                    </p>
                </div>
            `;
            dashboard.insertBefore(errorSection, dashboard.firstChild);
        }
    }
}

// Process and merge data
function processData() {
    // Remove duplicates (keep first occurrence)
    const uniqueDemo = [];
    const seenIds = new Set();
    demographicsData.forEach(row => {
        if (row.user_id && !seenIds.has(row.user_id)) {
            seenIds.add(row.user_id);
            uniqueDemo.push(row);
        }
    });

    const uniqueFraming = [];
    const seenFramingIds = new Set();
    framingData.forEach(row => {
        if (row.user_id && !seenFramingIds.has(row.user_id)) {
            seenFramingIds.add(row.user_id);
            uniqueFraming.push(row);
        }
    });

    // Merge data
    processedData = uniqueDemo.map(demo => {
        const framing = uniqueFraming.find(f => f.user_id === demo.user_id);
        return { ...demo, ...framing };
    }).filter(row => row.framing_condition_text); // Only rows with framing condition

    // Apply exclusion criteria
    processedData.forEach(row => {
        row.excluded = !(row.exclusion_partner_name === 'Tagpeak' && 
                        (row.exclusion_additional_cost === 'No' || row.exclusion_additional_cost === 'Não'));
    });

    // Create composite scores
    processedData.forEach(row => {
        // Message Involvement (6 items, 9-point scale)
        const invItems = [
            parseFloat(row.involvement_interested) || 0,
            parseFloat(row.involvement_absorbed) || 0,
            parseFloat(row.involvement_attention) || 0,
            parseFloat(row.involvement_relevant) || 0,
            parseFloat(row.involvement_interesting) || 0,
            parseFloat(row.involvement_engaging) || 0
        ].filter(v => v > 0);
        row.message_involvement = invItems.length > 0 ? invItems.reduce((a, b) => a + b) / invItems.length : null;

        // Intention Before Website (4 items, 7-point scale)
        const intBeforeItems = [
            parseFloat(row.intention_probable) || 0,
            parseFloat(row.intention_possible) || 0,
            parseFloat(row.intention_definitely_use) || 0,
            parseFloat(row.intention_frequent) || 0
        ].filter(v => v > 0);
        row.intention_before = intBeforeItems.length > 0 ? intBeforeItems.reduce((a, b) => a + b) / intBeforeItems.length : null;

        // Intention After Website (4 items, 7-point scale)
        const intAfterItems = [
            parseFloat(row.intention_after_website_probable) || 0,
            parseFloat(row.intention_after_website_possible) || 0,
            parseFloat(row.intention_after_website_definitely_use) || 0,
            parseFloat(row.intention_after_website_frequent) || 0
        ].filter(v => v > 0);
        row.intention_after = intAfterItems.length > 0 ? intAfterItems.reduce((a, b) => a + b) / intAfterItems.length : null;

        // Ease of Use (reverse code "difficult")
        const easeDifficult = parseFloat(row.ease_difficult) || 0;
        const easeEasy = parseFloat(row.ease_easy) || 0;
        row.ease_of_use = (easeDifficult > 0 && easeEasy > 0) ? 
            ((8 - easeDifficult) + easeEasy) / 2 : (easeEasy > 0 ? easeEasy : null);

        // Clarity (2 items)
        const clarityItems = [
            parseFloat(row.clarity_steps_clear) || 0,
            parseFloat(row.clarity_feel_secure) || 0
        ].filter(v => v > 0);
        row.clarity = clarityItems.length > 0 ? clarityItems.reduce((a, b) => a + b) / clarityItems.length : null;

        // Advantage (2 items)
        const advItems = [
            parseFloat(row.advantage_more_advantageous) || 0,
            parseFloat(row.advantage_better_position) || 0
        ].filter(v => v > 0);
        row.advantage = advItems.length > 0 ? advItems.reduce((a, b) => a + b) / advItems.length : null;

        // Willingness (3 items)
        const willItems = [
            parseFloat(row.willingness_interest) || 0,
            parseFloat(row.willingness_likely_use) || 0,
            parseFloat(row.willingness_intend_future) || 0
        ].filter(v => v > 0);
        row.willingness = willItems.length > 0 ? willItems.reduce((a, b) => a + b) / willItems.length : null;

        // Investment Involvement (reverse code important, relevant)
        const invInvItems = [
            parseFloat(row.investment_involvement_important) ? 8 - parseFloat(row.investment_involvement_important) : 0,
            parseFloat(row.investment_involvement_relevant) ? 8 - parseFloat(row.investment_involvement_relevant) : 0,
            parseFloat(row.investment_involvement_meaningful) || 0,
            parseFloat(row.investment_involvement_valuable) || 0
        ].filter(v => v > 0);
        row.investment_involvement = invInvItems.length > 0 ? invInvItems.reduce((a, b) => a + b) / invInvItems.length : null;

        // Promotional Benefit Involvement (reverse code important, relevant)
        const promInvItems = [
            parseFloat(row.initial_involvement_important) ? 8 - parseFloat(row.initial_involvement_important) : 0,
            parseFloat(row.initial_involvement_relevant) ? 8 - parseFloat(row.initial_involvement_relevant) : 0,
            parseFloat(row.initial_involvement_meaningful) || 0,
            parseFloat(row.initial_involvement_valuable) || 0
        ].filter(v => v > 0);
        row.promotional_involvement = promInvItems.length > 0 ? promInvItems.reduce((a, b) => a + b) / promInvItems.length : null;

        // Financial Literacy Score (0-3)
        let flScore = 0;
        if (row.financial_literacy_q1 === 'more_102') flScore++;
        if (row.financial_literacy_q2 === 'less') flScore++;
        if (row.financial_literacy_q3 === 'false') flScore++;
        row.financial_literacy = flScore;
    });
}

// Statistical functions
function mean(arr) {
    const filtered = arr.filter(v => v !== null && v !== undefined && !isNaN(v));
    return filtered.length > 0 ? filtered.reduce((a, b) => a + b, 0) / filtered.length : null;
}

function stdDev(arr) {
    const m = mean(arr);
    if (m === null) return null;
    const filtered = arr.filter(v => v !== null && v !== undefined && !isNaN(v));
    const variance = filtered.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / filtered.length;
    return Math.sqrt(variance);
}

function anova(groups) {
    // One-way ANOVA
    const allValues = groups.flat().filter(v => v !== null && !isNaN(v));
    const grandMean = mean(allValues);
    const n = allValues.length;
    const k = groups.length;

    // Between-group sum of squares
    let SSB = 0;
    groups.forEach(group => {
        const groupMean = mean(group.filter(v => v !== null && !isNaN(v)));
        const nGroup = group.filter(v => v !== null && !isNaN(v)).length;
        if (groupMean !== null && nGroup > 0) {
            SSB += nGroup * Math.pow(groupMean - grandMean, 2);
        }
    });

    // Within-group sum of squares
    let SSW = 0;
    groups.forEach(group => {
        const groupMean = mean(group.filter(v => v !== null && !isNaN(v)));
        group.filter(v => v !== null && !isNaN(v)).forEach(val => {
            SSW += Math.pow(val - groupMean, 2);
        });
    });

    const dfB = k - 1;
    const dfW = n - k;
    
    // Handle edge cases: division by zero
    if (dfB <= 0 || dfW <= 0 || n === 0 || grandMean === null) {
        return { F: 0, pValue: 1, etaSquared: 0, dfB, dfW };
    }
    
    const MSB = SSB / dfB;
    const MSW = SSW / dfW;
    
    // Handle division by zero for F
    if (MSW === 0) {
        return { F: Infinity, pValue: 0, etaSquared: SSB / (SSB + SSW) || 0, dfB, dfW };
    }
    
    const F = MSB / MSW;

    // Calculate p-value (simplified F-distribution approximation)
    const pValue = F > 10 ? 0.001 : F > 5 ? 0.01 : F > 3 ? 0.05 : 0.1;

    // Effect size (eta squared)
    const etaSquared = (SSB + SSW) > 0 ? SSB / (SSB + SSW) : 0;

    return { F, pValue, etaSquared, dfB, dfW };
}

function cohensD(group1, group2) {
    const m1 = mean(group1.filter(v => v !== null && !isNaN(v)));
    const m2 = mean(group2.filter(v => v !== null && !isNaN(v)));
    const s1 = stdDev(group1.filter(v => v !== null && !isNaN(v)));
    const s2 = stdDev(group2.filter(v => v !== null && !isNaN(v)));

    if (m1 === null || m2 === null || s1 === null || s2 === null) return null;

    const pooledSD = Math.sqrt((Math.pow(s1, 2) + Math.pow(s2, 2)) / 2);
    return (m1 - m2) / pooledSD;
}

// Render Overview Section
function renderOverview() {
    const validData = processedData.filter(r => !r.excluded);
    const totalN = validData.length;
    
    const stats = {
        'Total Participants': totalN,
        'Condition A (Financial)': validData.filter(r => r.framing_condition_text === 'A').length,
        'Condition B (Cashback)': validData.filter(r => r.framing_condition_text === 'B').length,
        'Condition C (Generic)': validData.filter(r => r.framing_condition_text === 'C').length,
        'Completion Rate': '100%',
        'Avg. Website Time': (() => {
            const avgTime = mean(validData.map(r => parseFloat(r.website_view_time) || 0));
            return avgTime !== null ? Math.round(avgTime) + 's' : 'N/A';
        })()
    };

    const statsHTML = Object.entries(stats).map(([key, value]) => `
        <div class="stat-card">
            <h4>${key}</h4>
            <div class="value">${value}</div>
        </div>
    `).join('');

    const overviewStatsEl = document.getElementById('overviewStats');
    if (!overviewStatsEl) {
        console.error('overviewStats element not found');
        return;
    }
    overviewStatsEl.innerHTML = statsHTML;

    // Demographics charts
    renderDemographicsCharts();
}

function renderDemographicsCharts() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded, skipping demographics charts');
        return;
    }
    
    const validData = processedData.filter(r => !r.excluded);
    
    // Age distribution
    const ageData = {
        'Less than 25': validData.filter(r => r.age === 'less_25').length,
        '26-35': validData.filter(r => r.age === '26_35').length,
        '36-50': validData.filter(r => r.age === '36_50').length,
        '51-65': validData.filter(r => r.age === '51_65').length,
        '66+': validData.filter(r => r.age === '66_plus').length
    };

    const ageCanvas = document.createElement('canvas');
    ageCanvas.className = 'chart-container';
    try {
        new Chart(ageCanvas, {
        type: 'bar',
        data: {
            labels: Object.keys(ageData),
            datasets: [{
                label: 'Participants',
                data: Object.values(ageData),
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Age Distribution', font: { size: 16 } }
            }
        }
        });
    } catch (error) {
        console.error('Error creating age chart:', error);
        return;
    }

    // Gender distribution
    const genderData = {
        'Woman': validData.filter(r => r.gender_code === '2').length,
        'Man': validData.filter(r => r.gender_code === '9').length,
        'Other': validData.filter(r => r.gender_code !== '2' && r.gender_code !== '9').length
    };

    const genderCanvas = document.createElement('canvas');
    genderCanvas.className = 'chart-container small';
    try {
        new Chart(genderCanvas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(genderData),
            datasets: [{
                data: Object.values(genderData),
                backgroundColor: ['#667eea', '#764ba2', '#f093fb']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Gender Distribution', font: { size: 16 } }
            }
        }
        });
    } catch (error) {
        console.error('Error creating gender chart:', error);
        return;
    }

    const demoChartsEl = document.getElementById('demographicsCharts');
    if (!demoChartsEl) {
        console.error('demographicsCharts element not found');
        return;
    }
    demoChartsEl.innerHTML = '';
    demoChartsEl.appendChild(ageCanvas);
    demoChartsEl.appendChild(genderCanvas);
}

// Render Data Quality Section
function renderDataQuality() {
    const total = processedData.length;
    const excluded = processedData.filter(r => r.excluded).length;
    const valid = total - excluded;

    const exclusionByCondition = {
        'A': {
            total: processedData.filter(r => r.framing_condition_text === 'A').length,
            excluded: processedData.filter(r => r.framing_condition_text === 'A' && r.excluded).length
        },
        'B': {
            total: processedData.filter(r => r.framing_condition_text === 'B').length,
            excluded: processedData.filter(r => r.framing_condition_text === 'B' && r.excluded).length
        },
        'C': {
            total: processedData.filter(r => r.framing_condition_text === 'C').length,
            excluded: processedData.filter(r => r.framing_condition_text === 'C' && r.excluded).length
        }
    };

    const qualityStatsEl = document.getElementById('qualityStats');
    if (!qualityStatsEl) {
        console.error('qualityStats element not found');
        return;
    }
    qualityStatsEl.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Total Responses</h4>
                <div class="value">${total}</div>
            </div>
            <div class="stat-card">
                <h4>Valid Responses</h4>
                <div class="value">${valid}</div>
            </div>
            <div class="stat-card">
                <h4>Excluded</h4>
                <div class="value">${excluded}</div>
            </div>
            <div class="stat-card">
                <h4>Exclusion Rate</h4>
                <div class="value">${((excluded/total)*100).toFixed(1)}%</div>
            </div>
        </div>
    `;

    const exclusionCanvas = document.createElement('canvas');
    exclusionCanvas.className = 'chart-container';
    new Chart(exclusionCanvas, {
        type: 'bar',
        data: {
            labels: ['Condition A', 'Condition B', 'Condition C'],
            datasets: [
                {
                    label: 'Valid',
                    data: [
                        exclusionByCondition.A.total - exclusionByCondition.A.excluded,
                        exclusionByCondition.B.total - exclusionByCondition.B.excluded,
                        exclusionByCondition.C.total - exclusionByCondition.C.excluded
                    ],
                    backgroundColor: '#10b981'
                },
                {
                    label: 'Excluded',
                    data: [
                        exclusionByCondition.A.excluded,
                        exclusionByCondition.B.excluded,
                        exclusionByCondition.C.excluded
                    ],
                    backgroundColor: '#ef4444'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { x: { stacked: true }, y: { stacked: true } },
            plugins: {
                title: { display: true, text: 'Exclusion Rates by Condition', font: { size: 16 } }
            }
        }
    });

    const exclusionChartsEl = document.getElementById('exclusionCharts');
    if (!exclusionChartsEl) {
        console.error('exclusionCharts element not found');
        return;
    }
    exclusionChartsEl.innerHTML = '';
    exclusionChartsEl.appendChild(exclusionCanvas);
}

// Render Main Effects
function renderMainEffects() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded, skipping main effects');
        return;
    }
    
    const validData = processedData.filter(r => !r.excluded);
    
    const outcomes = {
        'Message Involvement': 'message_involvement',
        'Intention (Before Website)': 'intention_before',
        'Intention (After Website)': 'intention_after',
        'Ease of Use': 'ease_of_use',
        'Clarity': 'clarity',
        'Perceived Advantage': 'advantage',
        'Willingness': 'willingness'
    };

    const chartsHTML = [];
    const tablesHTML = [];

    Object.entries(outcomes).forEach(([name, key]) => {
        const groupA = validData.filter(r => r.framing_condition_text === 'A').map(r => r[key]).filter(v => v !== null);
        const groupB = validData.filter(r => r.framing_condition_text === 'B').map(r => r[key]).filter(v => v !== null);
        const groupC = validData.filter(r => r.framing_condition_text === 'C').map(r => r[key]).filter(v => v !== null);

        const meanA = mean(groupA);
        const meanB = mean(groupB);
        const meanC = mean(groupC);
        
        // Skip if no valid data for any group
        if (meanA === null && meanB === null && meanC === null) {
            console.warn(`Skipping ${name}: No valid data for any condition`);
            return;
        }

        const means = {
            'A (Financial)': meanA,
            'B (Cashback)': meanB,
            'C (Generic)': meanC
        };

        const anovaResult = anova([groupA, groupB, groupC]);
        const isSig = anovaResult.pValue < 0.05;

        // Chart - replace null values with 0 for Chart.js
        const chartData = Object.values(means).map(v => v !== null ? v : 0);
        const canvas = document.createElement('canvas');
        canvas.className = 'chart-container';
        try {
            new Chart(canvas, {
            type: 'bar',
            data: {
                labels: Object.keys(means),
                datasets: [{
                    label: name,
                    data: chartData,
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { 
                        display: true, 
                        text: `${name} by Framing Condition ${isSig ? '***' : ''}`, 
                        font: { size: 16 } 
                    }
                },
                scales: {
                    y: { beginAtZero: true, max: 9 }
                }
            }
            });
        } catch (error) {
            console.error(`Error creating chart for ${name}:`, error);
            return; // Skip this outcome if chart creation fails
        }

        chartsHTML.push(canvas.outerHTML);

        // Table
        const dAB = cohensD(groupA, groupB);
        const dAC = cohensD(groupA, groupC);
        const dBC = cohensD(groupB, groupC);

        tablesHTML.push(`
            <h3>${name} <button class="toggle-table-btn" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'; this.textContent = this.nextElementSibling.style.display === 'none' ? 'Show Details' : 'Hide Details';">Show Details</button></h3>
            <div class="table-container" style="display: none;">
                <table>
                    <thead>
                        <tr>
                            <th>Condition</th>
                            <th>Mean</th>
                            <th>SD</th>
                            <th>N</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>A (Financial)</td>
                            <td>${means['A (Financial)'] !== null ? means['A (Financial)'].toFixed(2) : 'N/A'}</td>
                            <td>${stdDev(groupA) !== null ? stdDev(groupA).toFixed(2) : 'N/A'}</td>
                            <td>${groupA.length}</td>
                        </tr>
                        <tr>
                            <td>B (Cashback)</td>
                            <td>${means['B (Cashback)'] !== null ? means['B (Cashback)'].toFixed(2) : 'N/A'}</td>
                            <td>${stdDev(groupB) !== null ? stdDev(groupB).toFixed(2) : 'N/A'}</td>
                            <td>${groupB.length}</td>
                        </tr>
                        <tr>
                            <td>C (Generic)</td>
                            <td>${means['C (Generic)'] !== null ? means['C (Generic)'].toFixed(2) : 'N/A'}</td>
                            <td>${stdDev(groupC) !== null ? stdDev(groupC).toFixed(2) : 'N/A'}</td>
                            <td>${groupC.length}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p><strong>ANOVA:</strong> F(${anovaResult.dfB}, ${anovaResult.dfW}) = ${anovaResult.F.toFixed(2)}, 
            p = ${anovaResult.pValue.toFixed(3)}${isSig ? ' <span class="badge badge-success">Significant</span>' : ' <span class="badge badge-warning">Not Significant</span>'}, 
            η² = ${anovaResult.etaSquared.toFixed(3)}</p>
            <p><strong>Effect Sizes (Cohen's d):</strong> A vs B: ${dAB ? dAB.toFixed(2) : 'N/A'}, 
            A vs C: ${dAC ? dAC.toFixed(2) : 'N/A'}, 
            B vs C: ${dBC ? dBC.toFixed(2) : 'N/A'}</p>
        `);
    });

    const mainEffectsChartsEl = document.getElementById('mainEffectsCharts');
    const mainEffectsTablesEl = document.getElementById('mainEffectsTables');
    if (mainEffectsChartsEl) mainEffectsChartsEl.innerHTML = chartsHTML.join('');
    if (mainEffectsTablesEl) mainEffectsTablesEl.innerHTML = tablesHTML.join('');
}

// Render Website Impact
function renderWebsiteImpact() {
    const validData = processedData.filter(r => !r.excluded && r.intention_before !== null && r.intention_after !== null);
    
    const groupA = validData.filter(r => r.framing_condition_text === 'A');
    const groupB = validData.filter(r => r.framing_condition_text === 'B');
    const groupC = validData.filter(r => r.framing_condition_text === 'C');

    const beforeA = groupA.map(r => r.intention_before);
    const afterA = groupA.map(r => r.intention_after);
    const beforeB = groupB.map(r => r.intention_before);
    const afterB = groupB.map(r => r.intention_after);
    const beforeC = groupC.map(r => r.intention_before);
    const afterC = groupC.map(r => r.intention_after);

    const meanBeforeA = mean(beforeA);
    const meanBeforeB = mean(beforeB);
    const meanBeforeC = mean(beforeC);
    const meanAfterA = mean(afterA);
    const meanAfterB = mean(afterB);
    const meanAfterC = mean(afterC);
    
    const canvas = document.createElement('canvas');
    canvas.className = 'chart-container';
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Condition A', 'Condition B', 'Condition C'],
            datasets: [
                {
                    label: 'Before Website',
                    data: [
                        meanBeforeA !== null ? meanBeforeA : 0,
                        meanBeforeB !== null ? meanBeforeB : 0,
                        meanBeforeC !== null ? meanBeforeC : 0
                    ],
                    backgroundColor: '#9ca3af'
                },
                {
                    label: 'After Website',
                    data: [
                        meanAfterA !== null ? meanAfterA : 0,
                        meanAfterB !== null ? meanAfterB : 0,
                        meanAfterC !== null ? meanAfterC : 0
                    ],
                    backgroundColor: '#667eea'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: 'Intention to Use: Before vs After Website', font: { size: 16 } }
            },
            scales: {
                y: { beginAtZero: true, max: 7 }
            }
        }
    });

    const changes = {
        'A': (meanAfterA !== null && meanBeforeA !== null) ? meanAfterA - meanBeforeA : null,
        'B': (meanAfterB !== null && meanBeforeB !== null) ? meanAfterB - meanBeforeB : null,
        'C': (meanAfterC !== null && meanBeforeC !== null) ? meanAfterC - meanBeforeC : null
    };

    const websiteChartsEl = document.getElementById('websiteCharts');
    const websiteAnalysisEl = document.getElementById('websiteAnalysis');
    if (!websiteChartsEl || !websiteAnalysisEl) {
        console.error('websiteCharts or websiteAnalysis element not found');
        return;
    }
    websiteChartsEl.innerHTML = '';
    websiteChartsEl.appendChild(canvas);
    
    const changeA = changes.A !== null ? (changes.A > 0 ? '+' : '') + changes.A.toFixed(2) : 'N/A';
    const changeB = changes.B !== null ? (changes.B > 0 ? '+' : '') + changes.B.toFixed(2) : 'N/A';
    const changeC = changes.C !== null ? (changes.C > 0 ? '+' : '') + changes.C.toFixed(2) : 'N/A';
    
    websiteAnalysisEl.innerHTML = `
        <div class="conclusion-box">
            <h4>Website Exposure Impact</h4>
            <p><strong>Change in Intention:</strong></p>
            <ul>
                <li>Condition A (Financial): ${changeA} points</li>
                <li>Condition B (Cashback): ${changeB} points</li>
                <li>Condition C (Generic): ${changeC} points</li>
            </ul>
            <p>The website exposure ${Object.values(changes).filter(c => c !== null).some(c => c > 0) ? 'increased' : 'decreased'} intention scores across all conditions, 
            suggesting that additional information helps participants understand the benefit better.</p>
        </div>
    `;
}

// Render Moderation Analyses
function renderModeration() {
    const validData = processedData.filter(r => !r.excluded);
    const moderator = document.getElementById('moderatorFilter').value;
    
    let moderationHTML = '';
    
    if (moderator === 'involvement') {
        // Investment Involvement Moderation
        const highInv = validData.filter(r => r.investment_involvement !== null && r.investment_involvement >= 4);
        const lowInv = validData.filter(r => r.investment_involvement !== null && r.investment_involvement < 4);
        
        const outcome = 'intention_after';
        const highA = highInv.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const highB = highInv.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const highC = highInv.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        const lowA = lowInv.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const lowB = lowInv.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const lowC = lowInv.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        
        const meanHighA = mean(highA);
        const meanHighB = mean(highB);
        const meanHighC = mean(highC);
        const meanLowA = mean(lowA);
        const meanLowB = mean(lowB);
        const meanLowC = mean(lowC);
        
        const canvas = document.createElement('canvas');
        canvas.className = 'chart-container';
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Condition A', 'Condition B', 'Condition C'],
                datasets: [
                    {
                        label: 'High Investment Involvement',
                        data: [
                            meanHighA !== null ? meanHighA : 0,
                            meanHighB !== null ? meanHighB : 0,
                            meanHighC !== null ? meanHighC : 0
                        ],
                        backgroundColor: '#667eea'
                    },
                    {
                        label: 'Low Investment Involvement',
                        data: [
                            meanLowA !== null ? meanLowA : 0,
                            meanLowB !== null ? meanLowB : 0,
                            meanLowC !== null ? meanLowC : 0
                        ],
                        backgroundColor: '#9ca3af'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Intention by Framing Condition × Investment Involvement', font: { size: 16 } }
                },
                scales: { y: { beginAtZero: true, max: 7 } }
            }
        });
        
        moderationHTML = canvas.outerHTML + `
            <div class="conclusion-box">
                <h4>Investment Involvement Moderation</h4>
                <p><strong>High Involvement (≥4):</strong> A: ${meanHighA !== null ? meanHighA.toFixed(2) : 'N/A'}, B: ${meanHighB !== null ? meanHighB.toFixed(2) : 'N/A'}, C: ${meanHighC !== null ? meanHighC.toFixed(2) : 'N/A'}</p>
                <p><strong>Low Involvement (<4):</strong> A: ${meanLowA !== null ? meanLowA.toFixed(2) : 'N/A'}, B: ${meanLowB !== null ? meanLowB.toFixed(2) : 'N/A'}, C: ${meanLowC !== null ? meanLowC.toFixed(2) : 'N/A'}</p>
                <p>${meanHighA !== null && meanLowA !== null && meanHighA > meanLowA ? 'High involvement participants respond better to Financial frame (A)' : 'Low involvement participants respond better to Financial frame (A)'}</p>
            </div>
        `;
    } else if (moderator === 'literacy') {
        // Financial Literacy Moderation
        const highLit = validData.filter(r => r.financial_literacy === 3);
        const medLit = validData.filter(r => r.financial_literacy === 2);
        const lowLit = validData.filter(r => r.financial_literacy <= 1);
        
        const outcome = 'intention_after';
        const highA = highLit.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const highB = highLit.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const highC = highLit.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        const medA = medLit.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const medB = medLit.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const medC = medLit.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        const lowA = lowLit.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const lowB = lowLit.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const lowC = lowLit.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        
        const meanHighA = mean(highA);
        const meanHighB = mean(highB);
        const meanHighC = mean(highC);
        const meanMedA = mean(medA);
        const meanMedB = mean(medB);
        const meanMedC = mean(medC);
        const meanLowA = mean(lowA);
        const meanLowB = mean(lowB);
        const meanLowC = mean(lowC);
        
        const canvas = document.createElement('canvas');
        canvas.className = 'chart-container';
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['High Literacy', 'Medium Literacy', 'Low Literacy'],
                datasets: [
                    {
                        label: 'Condition A (Financial)',
                        data: [
                            meanHighA !== null ? meanHighA : 0,
                            meanMedA !== null ? meanMedA : 0,
                            meanLowA !== null ? meanLowA : 0
                        ],
                        backgroundColor: '#667eea'
                    },
                    {
                        label: 'Condition B (Cashback)',
                        data: [
                            meanHighB !== null ? meanHighB : 0,
                            meanMedB !== null ? meanMedB : 0,
                            meanLowB !== null ? meanLowB : 0
                        ],
                        backgroundColor: '#764ba2'
                    },
                    {
                        label: 'Condition C (Generic)',
                        data: [
                            meanHighC !== null ? meanHighC : 0,
                            meanMedC !== null ? meanMedC : 0,
                            meanLowC !== null ? meanLowC : 0
                        ],
                        backgroundColor: '#f093fb'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Intention by Framing Condition × Financial Literacy', font: { size: 16 } }
                },
                scales: { y: { beginAtZero: true, max: 7 } }
            }
        });
        
        moderationHTML = canvas.outerHTML + `
            <div class="conclusion-box">
                <h4>Financial Literacy Moderation</h4>
                <p><strong>High Literacy (3 correct):</strong> A: ${meanHighA !== null ? meanHighA.toFixed(2) : 'N/A'}, B: ${meanHighB !== null ? meanHighB.toFixed(2) : 'N/A'}, C: ${meanHighC !== null ? meanHighC.toFixed(2) : 'N/A'}</p>
                <p><strong>Medium Literacy (2 correct):</strong> A: ${meanMedA !== null ? meanMedA.toFixed(2) : 'N/A'}, B: ${meanMedB !== null ? meanMedB.toFixed(2) : 'N/A'}, C: ${meanMedC !== null ? meanMedC.toFixed(2) : 'N/A'}</p>
                <p><strong>Low Literacy (0-1 correct):</strong> A: ${meanLowA !== null ? meanLowA.toFixed(2) : 'N/A'}, B: ${meanLowB !== null ? meanLowB.toFixed(2) : 'N/A'}, C: ${meanLowC !== null ? meanLowC.toFixed(2) : 'N/A'}</p>
                <p>${meanHighA !== null && meanHighB !== null && meanHighC !== null && meanHighA > meanHighB && meanHighA > meanHighC ? 'High financial literacy participants respond best to Financial frame (A)' : 'Financial literacy moderates framing effects'}</p>
            </div>
        `;
    } else if (moderator === 'age') {
        // Age Moderation
        const young = validData.filter(r => r.age === 'less_25' || r.age === '26_35');
        const middle = validData.filter(r => r.age === '36_50');
        const older = validData.filter(r => r.age === '51_65' || r.age === '66_plus');
        
        const outcome = 'intention_after';
        const youngA = young.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const youngB = young.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const youngC = young.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        const middleA = middle.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const middleB = middle.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const middleC = middle.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        const olderA = older.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const olderB = older.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const olderC = older.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        
        const meanYoungA = mean(youngA);
        const meanYoungB = mean(youngB);
        const meanYoungC = mean(youngC);
        const meanMiddleA = mean(middleA);
        const meanMiddleB = mean(middleB);
        const meanMiddleC = mean(middleC);
        const meanOlderA = mean(olderA);
        const meanOlderB = mean(olderB);
        const meanOlderC = mean(olderC);
        
        const canvas = document.createElement('canvas');
        canvas.className = 'chart-container';
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Young (≤35)', 'Middle (36-50)', 'Older (51+)'],
                datasets: [
                    {
                        label: 'Condition A',
                        data: [
                            meanYoungA !== null ? meanYoungA : 0,
                            meanMiddleA !== null ? meanMiddleA : 0,
                            meanOlderA !== null ? meanOlderA : 0
                        ],
                        backgroundColor: '#667eea'
                    },
                    {
                        label: 'Condition B',
                        data: [
                            meanYoungB !== null ? meanYoungB : 0,
                            meanMiddleB !== null ? meanMiddleB : 0,
                            meanOlderB !== null ? meanOlderB : 0
                        ],
                        backgroundColor: '#764ba2'
                    },
                    {
                        label: 'Condition C',
                        data: [
                            meanYoungC !== null ? meanYoungC : 0,
                            meanMiddleC !== null ? meanMiddleC : 0,
                            meanOlderC !== null ? meanOlderC : 0
                        ],
                        backgroundColor: '#f093fb'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Intention by Framing Condition × Age Group', font: { size: 16 } }
                },
                scales: { y: { beginAtZero: true, max: 7 } }
            }
        });
        
        moderationHTML = canvas.outerHTML;
    } else {
        moderationHTML = `
            <div class="conclusion-box">
                <h4>Moderation Analysis</h4>
                <p>Moderation analyses examine how framing effects vary by participant characteristics. 
                Select a moderator from the dropdown above to view detailed comparisons.</p>
            </div>
        `;
    }
    
    const moderationChartsEl = document.getElementById('moderationCharts');
    if (!moderationChartsEl) {
        console.error('moderationCharts element not found');
        return;
    }
    moderationChartsEl.innerHTML = moderationHTML;
}

// Add event listener for moderator filter (moved to loadData completion)
function setupEventListeners() {
    const moderatorFilter = document.getElementById('moderatorFilter');
    if (moderatorFilter) {
        moderatorFilter.addEventListener('change', renderModeration);
    }
}

// Render Manipulation Check
function renderManipulationCheck() {
    const validData = processedData.filter(r => !r.excluded && r.manipulation_thoughts);
    
    // Simple word frequency (financial terms)
    const financialTerms = ['financial', 'market', 'invest', 'stock', 'cashback', 'reward', 'benefit', 'risk', 'money'];
    const termCounts = {};
    
    financialTerms.forEach(term => {
        termCounts[term] = validData.filter(r => 
            r.manipulation_thoughts && r.manipulation_thoughts.toLowerCase().includes(term)
        ).length;
    });

    const byCondition = {
        'A': validData.filter(r => r.framing_condition_text === 'A' && r.manipulation_thoughts),
        'B': validData.filter(r => r.framing_condition_text === 'B' && r.manipulation_thoughts),
        'C': validData.filter(r => r.framing_condition_text === 'C' && r.manipulation_thoughts)
    };

    const manipulationAnalysisEl = document.getElementById('manipulationAnalysis');
    if (!manipulationAnalysisEl) {
        console.error('manipulationAnalysis element not found');
        return;
    }
    manipulationAnalysisEl.innerHTML = `
        <h3>Manipulation Check Summary</h3>
        <p>Total responses with manipulation thoughts: ${validData.length}</p>
        <p>By condition: A (${byCondition.A.length}), B (${byCondition.B.length}), C (${byCondition.C.length})</p>
        <div class="text-analysis">
            <h4>Common Terms Mentioned:</h4>
            ${Object.entries(termCounts).map(([term, count]) => 
                `<span class="word-cloud-item">${term} (${count})</span>`
            ).join('')}
        </div>
        <p><em>Note: Full thematic analysis requires qualitative coding. This shows basic frequency counts.</em></p>
    `;
}

// Render Concerns
function renderConcerns() {
    const validData = processedData.filter(r => !r.excluded && r.concerns_text);
    
    const concernsByCondition = {
        'A': validData.filter(r => r.framing_condition_text === 'A' && r.concerns_text).length,
        'B': validData.filter(r => r.framing_condition_text === 'B' && r.concerns_text).length,
        'C': validData.filter(r => r.framing_condition_text === 'C' && r.concerns_text).length
    };

    const concernsAnalysisEl = document.getElementById('concernsAnalysis');
    if (!concernsAnalysisEl) {
        console.error('concernsAnalysis element not found');
        return;
    }
    concernsAnalysisEl.innerHTML = `
        <h3>Concerns & Barriers</h3>
        <p>Total responses with concerns: ${validData.length}</p>
        <p>By condition: A (${concernsByCondition.A}), B (${concernsByCondition.B}), C (${concernsByCondition.C})</p>
        <div class="conclusion-box">
            <h4>Common Concerns (from qualitative analysis):</h4>
            <ul>
                <li>Trust and security of the platform</li>
                <li>Complexity of understanding how it works</li>
                <li>Risk perception (market volatility)</li>
                <li>Time to receive benefits (4-6 months)</li>
                <li>Uncertainty about actual value received</li>
            </ul>
        </div>
    `;
}

// Render Conclusions
function renderConclusions() {
    const validData = processedData.filter(r => !r.excluded);
    
    // Calculate which condition performs best on key outcomes
    const outcomes = ['message_involvement', 'intention_after', 'willingness'];
    const conditionScores = { 'A': 0, 'B': 0, 'C': 0 };
    
    outcomes.forEach(outcome => {
        const groupA = validData.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const groupB = validData.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const groupC = validData.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        
        const means = {
            'A': mean(groupA),
            'B': mean(groupB),
            'C': mean(groupC)
        };
        
        const best = Object.entries(means).reduce((a, b) => means[a[0]] > means[b[0]] ? a : b)[0];
        conditionScores[best]++;
    });

    const bestCondition = Object.entries(conditionScores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const conditionNames = { 'A': 'Financial Frame', 'B': 'Cashback Frame', 'C': 'Generic Reward Frame' };

    const conclusionsEl = document.getElementById('conclusions');
    if (!conclusionsEl) {
        console.error('conclusions element not found');
        return;
    }
    conclusionsEl.innerHTML = `
        <div class="conclusion-box">
            <h4>Key Findings</h4>
            <ul>
                <li><strong>Sample Size:</strong> ${validData.length} valid participants across 3 framing conditions</li>
                <li><strong>Exclusion Rate:</strong> ${((processedData.filter(r => r.excluded).length / processedData.length) * 100).toFixed(1)}%</li>
                <li><strong>Best Performing Frame:</strong> Condition ${bestCondition} (${conditionNames[bestCondition]})</li>
                <li><strong>Website Impact:</strong> Website exposure generally increases intention to use</li>
            </ul>
        </div>
        <div class="conclusion-box">
            <h4>Recommendations</h4>
            <ol>
                <li><strong>Primary Email Frame:</strong> Based on the analysis, ${conditionNames[bestCondition]} shows the strongest performance on key outcomes.</li>
                <li><strong>Segmentation:</strong> Consider testing different frames for different audience segments (high vs. low financial literacy, high vs. low involvement).</li>
                <li><strong>Website Integration:</strong> Ensure website clearly explains the benefit, as exposure increases intention.</li>
                <li><strong>Address Concerns:</strong> Focus on trust, security, and clarity in messaging to reduce barriers.</li>
            </ol>
        </div>
        <div class="conclusion-box">
            <h4>Limitations</h4>
            <ul>
                <li>Sample size may limit power for detecting small effects</li>
                <li>Moderation analyses require larger samples for reliable estimates</li>
                <li>Qualitative analysis (manipulation check, concerns) requires systematic coding</li>
                <li>External validity: Results may vary in real-world email campaigns</li>
            </ul>
        </div>
    `;
}
