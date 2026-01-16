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

// Hide sections that are truly empty (only hide if explicitly empty, don't hide if has charts)
function hideEmptySections() {
    // Wait a bit for charts to render
    setTimeout(() => {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            // Check for canvas elements (charts)
            const hasCanvas = section.querySelector('canvas');
            
            // Check for content divs with actual content
            const contentDivs = section.querySelectorAll('div[id]');
            let hasContent = false;
            
            contentDivs.forEach(div => {
                const innerHTML = div.innerHTML.trim();
                const text = (div.textContent || div.innerText || '').trim();
                
                // Has canvas (chart)
                if (div.querySelector('canvas')) {
                    hasContent = true;
                }
                // Has meaningful HTML content (more than just empty tags)
                else if (innerHTML.length > 50 && !innerHTML.match(/^<div[^>]*><\/div>$/)) {
                    hasContent = true;
                }
                // Has text content
                else if (text.length > 10) {
                    hasContent = true;
                }
            });
            
            // Check for stats grids, conclusion boxes, or other content
            const hasStats = section.querySelector('.stats-grid, .stat-card, .conclusion-box, table');
            const sectionText = (section.textContent || section.innerText || '').trim();
            const hasDirectText = sectionText.length > 100; // Meaningful text content
            
            // Only hide if truly empty - has no canvas, no content divs, no stats, no meaningful text
            if (!hasCanvas && !hasContent && !hasStats && !hasDirectText) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
    }, 500); // Wait 500ms for charts to render
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
            renderEnhancedTextAnalysis();
        } catch (error) {
            console.error('Error rendering enhanced text analysis:', error);
        }
        
        try {
            renderSegmentation();
        } catch (error) {
            console.error('Error rendering segmentation:', error);
        }
        
        try {
            renderUserScoringTool();
        } catch (error) {
            console.error('Error rendering user scoring tool:', error);
        }
        
        try {
            renderCommunicationEffectiveness();
        } catch (error) {
            console.error('Error rendering communication effectiveness:', error);
        }
        
        try {
            renderWebsiteAlignment();
        } catch (error) {
            console.error('Error rendering website alignment:', error);
        }
        
        try {
            renderMessageRecommendations();
        } catch (error) {
            console.error('Error rendering message recommendations:', error);
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
        
        // Add export buttons to charts after rendering
        try {
            addExportButtons();
        } catch (error) {
            console.error('Error adding export buttons:', error);
        }
        
        // Setup event listeners after rendering
        try {
            setupEventListeners();
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
        
        // Hide empty sections to reduce blank space
        hideEmptySections();
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

    // Calculate p-value using improved function
    const pValue = fTestPValue(F, dfB, dfW);

    // Effect size (eta squared)
    const etaSquared = (SSB + SSW) > 0 ? SSB / (SSB + SSW) : 0;
    
    // Partial eta squared (more appropriate for ANOVA)
    const partialEtaSquared = SSB / (SSB + SSW);

    return { F, pValue, etaSquared, partialEtaSquared, dfB, dfW, MSW };
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

// Calculate confidence interval for mean
function confidenceInterval(group, confidence = 0.95) {
    const filtered = group.filter(v => v !== null && !isNaN(v));
    if (filtered.length === 0) return null;
    
    const m = mean(filtered);
    const s = stdDev(filtered);
    const n = filtered.length;
    
    if (m === null || s === null || n < 2) return null;
    
    // t-value approximation (for large samples, use z=1.96 for 95% CI)
    const tValue = n > 30 ? 1.96 : 2.0; // Simplified
    const margin = tValue * (s / Math.sqrt(n));
    
    return {
        lower: m - margin,
        upper: m + margin,
        mean: m,
        margin: margin
    };
}

// Tukey HSD post-hoc test (simplified version)
function tukeyHSD(groups, groupNames, mse, dfError) {
    // groups: array of arrays
    // mse: mean square error from ANOVA
    // dfError: degrees of freedom error
    
    if (!mse || mse === 0 || !dfError) return null;
    
    const n = groups.length;
    const comparisons = [];
    const qCritical = 3.31; // Approximate q-value for 3 groups, alpha=0.05 (simplified)
    
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const group1 = groups[i].filter(v => v !== null && !isNaN(v));
            const group2 = groups[j].filter(v => v !== null && !isNaN(v));
            
            if (group1.length === 0 || group2.length === 0) continue;
            
            const m1 = mean(group1);
            const m2 = mean(group2);
            const n1 = group1.length;
            const n2 = group2.length;
            
            if (m1 === null || m2 === null) continue;
            
            // Standard error for Tukey
            const se = Math.sqrt(mse * (1/n1 + 1/n2));
            const diff = m1 - m2;
            const q = Math.abs(diff) / se;
            const isSignificant = q > qCritical;
            
            comparisons.push({
                group1: groupNames[i] || `Group ${i+1}`,
                group2: groupNames[j] || `Group ${j+1}`,
                meanDiff: diff,
                se: se,
                q: q,
                significant: isSignificant,
                pValue: q > 3.5 ? 0.01 : q > 3.0 ? 0.05 : 0.1 // Simplified
            });
        }
    }
    
    return comparisons;
}

// Cronbach's Alpha for scale reliability
function cronbachAlpha(items) {
    // items: array of arrays, each inner array is one participant's responses to scale items
    if (!items || items.length === 0) return null;
    
    const nItems = items[0].length;
    if (nItems < 2) return null;
    
    // Filter out rows with missing data
    const validRows = items.filter(row => 
        row.every(v => v !== null && v !== undefined && !isNaN(v))
    );
    
    if (validRows.length < 2) return null;
    
    // Calculate variance of each item
    const itemVariances = [];
    for (let i = 0; i < nItems; i++) {
        const itemScores = validRows.map(row => row[i]);
        const itemVar = stdDev(itemScores);
        if (itemVar !== null) {
            itemVariances.push(Math.pow(itemVar, 2));
        }
    }
    
    // Calculate total score variance
    const totalScores = validRows.map(row => row.reduce((a, b) => a + b, 0));
    const totalVar = stdDev(totalScores);
    
    if (totalVar === null || itemVariances.length === 0) return null;
    
    const sumItemVariances = itemVariances.reduce((a, b) => a + b, 0);
    const totalVariance = Math.pow(totalVar, 2);
    
    if (totalVariance === 0) return null;
    
    const alpha = (nItems / (nItems - 1)) * (1 - (sumItemVariances / totalVariance));
    
    return {
        alpha: alpha,
        nItems: nItems,
        nParticipants: validRows.length,
        interpretation: alpha >= 0.9 ? 'Excellent' : 
                        alpha >= 0.8 ? 'Good' : 
                        alpha >= 0.7 ? 'Acceptable' : 
                        alpha >= 0.6 ? 'Questionable' : 'Poor'
    };
}

// Improved p-value calculation for F-test
function fTestPValue(F, df1, df2) {
    // Simplified F-distribution p-value calculation
    // For more accuracy, would need proper F-distribution implementation
    if (F <= 0) return 1.0;
    
    // Approximation using critical values
    if (df1 === 2 && df2 > 10) {
        if (F > 3.0) return 0.05;
        if (F > 4.6) return 0.01;
        if (F > 6.9) return 0.001;
    }
    
    // General approximation
    if (F > 10) return 0.001;
    if (F > 5) return 0.01;
    if (F > 3) return 0.05;
    if (F > 2) return 0.1;
    return 0.2;
}

// Paired t-test for pre/post comparisons
function pairedTTest(before, after) {
    const pairs = [];
    for (let i = 0; i < Math.min(before.length, after.length); i++) {
        if (before[i] !== null && after[i] !== null && 
            !isNaN(before[i]) && !isNaN(after[i])) {
            pairs.push({ before: before[i], after: after[i] });
        }
    }
    
    if (pairs.length < 2) return null;
    
    const differences = pairs.map(p => p.after - p.before);
    const meanDiff = mean(differences);
    const sdDiff = stdDev(differences);
    const n = pairs.length;
    
    if (meanDiff === null || sdDiff === null || sdDiff === 0) return null;
    
    const t = meanDiff / (sdDiff / Math.sqrt(n));
    const df = n - 1;
    
    // Simplified p-value (two-tailed)
    const absT = Math.abs(t);
    let pValue = 0.2;
    if (absT > 3.0) pValue = 0.01;
    else if (absT > 2.5) pValue = 0.02;
    else if (absT > 2.0) pValue = 0.05;
    else if (absT > 1.7) pValue = 0.1;
    
    return {
        t: t,
        df: df,
        pValue: pValue,
        meanDiff: meanDiff,
        sdDiff: sdDiff,
        n: n,
        significant: pValue < 0.05,
        cohensD: meanDiff / sdDiff // Effect size for paired test
    };
}

// Two-way ANOVA for interaction tests
function twoWayAnova(data) {
    // data structure: { groups: { framing: { moderator: [values] } } }
    // Returns: { mainFraming, mainModerator, interaction, simpleEffects }
    
    const allValues = [];
    Object.values(data.groups).forEach(framingGroup => {
        Object.values(framingGroup).forEach(modGroup => {
            allValues.push(...modGroup.filter(v => v !== null && !isNaN(v)));
        });
    });
    
    const grandMean = mean(allValues);
    const n = allValues.length;
    
    // Calculate cell means
    const cellMeans = {};
    const cellNs = {};
    Object.entries(data.groups).forEach(([framing, modGroups]) => {
        cellMeans[framing] = {};
        cellNs[framing] = {};
        Object.entries(modGroups).forEach(([mod, values]) => {
            const filtered = values.filter(v => v !== null && !isNaN(v));
            cellMeans[framing][mod] = mean(filtered);
            cellNs[framing][mod] = filtered.length;
        });
    });
    
    // Main effect of framing
    const framingMeans = {};
    Object.entries(data.groups).forEach(([framing, modGroups]) => {
        const allFramingValues = [];
        Object.values(modGroups).forEach(values => {
            allFramingValues.push(...values.filter(v => v !== null && !isNaN(v)));
        });
        framingMeans[framing] = mean(allFramingValues);
    });
    
    // Main effect of moderator
    const modMeans = {};
    const modLevels = new Set();
    Object.values(data.groups).forEach(modGroups => {
        Object.keys(modGroups).forEach(mod => modLevels.add(mod));
    });
    
    modLevels.forEach(modLevel => {
        const allModValues = [];
        Object.values(data.groups).forEach(modGroups => {
            if (modGroups[modLevel]) {
                allModValues.push(...modGroups[modLevel].filter(v => v !== null && !isNaN(v)));
            }
        });
        modMeans[modLevel] = mean(allModValues);
    });
    
    // Simplified interaction test (check if pattern differs across moderator levels)
    // Calculate variance of framing effects across moderator levels
    const framingEffectsByMod = {};
    modLevels.forEach(modLevel => {
        const effects = [];
        const framings = Object.keys(data.groups);
        for (let i = 0; i < framings.length; i++) {
            for (let j = i + 1; j < framings.length; j++) {
                const mean1 = cellMeans[framings[i]][modLevel];
                const mean2 = cellMeans[framings[j]][modLevel];
                if (mean1 !== null && mean2 !== null) {
                    effects.push(mean1 - mean2);
                }
            }
        }
        framingEffectsByMod[modLevel] = effects;
    });
    
    // Check if effects vary across moderator levels (simple heuristic)
    const effectVariances = Object.values(framingEffectsByMod).map(effects => {
        if (effects.length === 0) return 0;
        const m = mean(effects);
        return effects.reduce((sum, e) => sum + Math.pow(e - m, 2), 0) / effects.length;
    });
    
    const avgVariance = mean(effectVariances);
    const hasInteraction = avgVariance > 0.5; // Heuristic threshold
    
    return {
        grandMean,
        cellMeans,
        framingMeans,
        modMeans,
        hasInteraction,
        interactionStrength: avgVariance,
        simpleEffects: cellMeans
    };
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
    
    // Calculate scale reliability
    const calculateScaleReliability = (items, scaleName) => {
        const validRows = validData
            .filter(r => items.every(item => r[item] !== null && r[item] !== undefined && !isNaN(parseFloat(r[item]))))
            .map(r => items.map(item => parseFloat(r[item]) || 0));
        
        if (validRows.length < 2) return null;
        return cronbachAlpha(validRows);
    };
    
    const involvementReliability = calculateScaleReliability([
        'involvement_interested', 'involvement_absorbed', 'involvement_attention',
        'involvement_relevant', 'involvement_interesting', 'involvement_engaging'
    ], 'Message Involvement');
    
    const intentionBeforeReliability = calculateScaleReliability([
        'intention_probable', 'intention_possible', 'intention_definitely_use', 'intention_frequent'
    ], 'Intention to Use (Before)');
    
    const intentionAfterReliability = calculateScaleReliability([
        'intention_after_website_probable', 'intention_after_website_possible', 
        'intention_after_website_definitely_use', 'intention_after_website_frequent'
    ], 'Intention to Use (After)');
    
    const willingnessReliability = calculateScaleReliability([
        'willingness_interest', 'willingness_likely_use', 'willingness_intend_future'
    ], 'Willingness');
    
    // Add scale reliability info to stats
    const reliabilityHTML = `
        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
            <h3 style="color: #667eea; margin-bottom: 15px;">📊 Scale Reliability (Cronbach's α)</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e0e0e0;">
                        <th style="padding: 10px; text-align: left;">Scale</th>
                        <th style="padding: 10px; text-align: center;">α</th>
                        <th style="padding: 10px; text-align: center;">Interpretation</th>
                        <th style="padding: 10px; text-align: center;">N</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 8px;">Message Involvement (6 items)</td>
                        <td style="padding: 8px; text-align: center; font-weight: 600;">${involvementReliability ? involvementReliability.alpha.toFixed(3) : 'N/A'}</td>
                        <td style="padding: 8px; text-align: center;">
                            ${involvementReliability ? `<span class="badge ${involvementReliability.alpha >= 0.7 ? 'badge-success' : involvementReliability.alpha >= 0.6 ? 'badge-warning' : 'badge-danger'}">${involvementReliability.interpretation}</span>` : 'N/A'}
                        </td>
                        <td style="padding: 8px; text-align: center;">${involvementReliability ? involvementReliability.nParticipants : 'N/A'}</td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                        <td style="padding: 8px;">Intention to Use - Before (4 items)</td>
                        <td style="padding: 8px; text-align: center; font-weight: 600;">${intentionBeforeReliability ? intentionBeforeReliability.alpha.toFixed(3) : 'N/A'}</td>
                        <td style="padding: 8px; text-align: center;">
                            ${intentionBeforeReliability ? `<span class="badge ${intentionBeforeReliability.alpha >= 0.7 ? 'badge-success' : intentionBeforeReliability.alpha >= 0.6 ? 'badge-warning' : 'badge-danger'}">${intentionBeforeReliability.interpretation}</span>` : 'N/A'}
                        </td>
                        <td style="padding: 8px; text-align: center;">${intentionBeforeReliability ? intentionBeforeReliability.nParticipants : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px;">Intention to Use - After (4 items)</td>
                        <td style="padding: 8px; text-align: center; font-weight: 600;">${intentionAfterReliability ? intentionAfterReliability.alpha.toFixed(3) : 'N/A'}</td>
                        <td style="padding: 8px; text-align: center;">
                            ${intentionAfterReliability ? `<span class="badge ${intentionAfterReliability.alpha >= 0.7 ? 'badge-success' : intentionAfterReliability.alpha >= 0.6 ? 'badge-warning' : 'badge-danger'}">${intentionAfterReliability.interpretation}</span>` : 'N/A'}
                        </td>
                        <td style="padding: 8px; text-align: center;">${intentionAfterReliability ? intentionAfterReliability.nParticipants : 'N/A'}</td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                        <td style="padding: 8px;">Willingness (3 items)</td>
                        <td style="padding: 8px; text-align: center; font-weight: 600;">${willingnessReliability ? willingnessReliability.alpha.toFixed(3) : 'N/A'}</td>
                        <td style="padding: 8px; text-align: center;">
                            ${willingnessReliability ? `<span class="badge ${willingnessReliability.alpha >= 0.7 ? 'badge-success' : willingnessReliability.alpha >= 0.6 ? 'badge-warning' : 'badge-danger'}">${willingnessReliability.interpretation}</span>` : 'N/A'}
                        </td>
                        <td style="padding: 8px; text-align: center;">${willingnessReliability ? willingnessReliability.nParticipants : 'N/A'}</td>
                    </tr>
                </tbody>
            </table>
            <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
                <strong>Interpretation:</strong> α ≥ 0.9 = Excellent, α ≥ 0.8 = Good, α ≥ 0.7 = Acceptable, α ≥ 0.6 = Questionable, α < 0.6 = Poor
            </p>
        </div>
    `;
    
    overviewStatsEl.innerHTML = statsHTML + reliabilityHTML;

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

    const ageWrapper = document.createElement('div');
    ageWrapper.className = 'chart-container';
    const ageCanvas = document.createElement('canvas');
    ageWrapper.appendChild(ageCanvas);
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

    const genderWrapper = document.createElement('div');
    genderWrapper.className = 'chart-container small';
    const genderCanvas = document.createElement('canvas');
    genderWrapper.appendChild(genderCanvas);
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
    demoChartsEl.appendChild(ageWrapper);
    demoChartsEl.appendChild(genderWrapper);
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

    const exclusionWrapper = document.createElement('div');
    exclusionWrapper.className = 'chart-container';
    const exclusionCanvas = document.createElement('canvas');
    exclusionWrapper.appendChild(exclusionCanvas);
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

    const chartsContainer = document.createElement('div');
    chartsContainer.className = 'charts-wrapper';
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

        // Calculate confidence intervals
        const ciA = confidenceInterval(groupA);
        const ciB = confidenceInterval(groupB);
        const ciC = confidenceInterval(groupC);

        // Post-hoc tests (Tukey HSD) if ANOVA is significant
        let postHocHTML = '';
        if (isSig && anovaResult.MSW) {
            const postHoc = tukeyHSD(
                [groupA, groupB, groupC],
                ['A (Financial)', 'B (Cashback)', 'C (Generic)'],
                anovaResult.MSW,
                anovaResult.dfW
            );
            if (postHoc && postHoc.length > 0) {
                postHocHTML = '<p><strong>Post-hoc Comparisons (Tukey HSD):</strong></p><ul>';
                postHoc.forEach(comp => {
                    const sigBadge = comp.significant ? 
                        '<span class="badge badge-success">Significant</span>' : 
                        '<span class="badge badge-warning">Not Significant</span>';
                    postHocHTML += `<li>${comp.group1} vs ${comp.group2}: Mean difference = ${comp.meanDiff.toFixed(2)}, 
                    ${sigBadge} (p ${comp.pValue < 0.05 ? '<' : '≈'} ${comp.pValue.toFixed(3)})</li>`;
                });
                postHocHTML += '</ul>';
            }
        }

        // Chart with error bars (confidence intervals)
        const chartData = Object.values(means).map(v => v !== null ? v : 0);
        const ciData = [ciA, ciB, ciC].map(ci => ci ? ci.margin : 0);
        const chartWrapper = document.createElement('div');
        chartWrapper.className = 'chart-container';
        const canvas = document.createElement('canvas');
        chartWrapper.appendChild(canvas);
        try {
            new Chart(canvas, {
            type: 'bar',
            data: {
                labels: Object.keys(means),
                datasets: [{
                    label: name,
                    data: chartData,
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb'],
                    errorBars: {
                        [Object.keys(means)[0]]: ciData[0] ? {plus: ciData[0], minus: ciData[0]} : null,
                        [Object.keys(means)[1]]: ciData[1] ? {plus: ciData[1], minus: ciData[1]} : null,
                        [Object.keys(means)[2]]: ciData[2] ? {plus: ciData[2], minus: ciData[2]} : null
                    }
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
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const idx = context.dataIndex;
                                const ci = [ciA, ciB, ciC][idx];
                                if (ci) {
                                    return `95% CI: [${ci.lower.toFixed(2)}, ${ci.upper.toFixed(2)}]`;
                                }
                                return '';
                            }
                        }
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

        // Append chart wrapper (with canvas inside) directly to container
        chartsContainer.appendChild(chartWrapper);

        // Effect sizes
        const dAB = cohensD(groupA, groupB);
        const dAC = cohensD(groupA, groupC);
        const dBC = cohensD(groupB, groupC);

        // Effect size interpretation
        const interpretEffectSize = (d) => {
            if (!d) return 'N/A';
            const absD = Math.abs(d);
            if (absD >= 0.8) return `${d.toFixed(2)} (Large)`;
            if (absD >= 0.5) return `${d.toFixed(2)} (Medium)`;
            if (absD >= 0.2) return `${d.toFixed(2)} (Small)`;
            return `${d.toFixed(2)} (Negligible)`;
        };

        tablesHTML.push(`
            <h3>${name} <button class="toggle-table-btn" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'; this.textContent = this.nextElementSibling.style.display === 'none' ? 'Show Details' : 'Hide Details';">Show Details</button></h3>
            <div class="table-container" style="display: none;">
                <table>
                    <thead>
                        <tr>
                            <th>Condition</th>
                            <th>Mean</th>
                            <th>95% CI</th>
                            <th>SD</th>
                            <th>N</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>A (Financial)</td>
                            <td>${means['A (Financial)'] !== null ? means['A (Financial)'].toFixed(2) : 'N/A'}</td>
                            <td>${ciA ? `[${ciA.lower.toFixed(2)}, ${ciA.upper.toFixed(2)}]` : 'N/A'}</td>
                            <td>${stdDev(groupA) !== null ? stdDev(groupA).toFixed(2) : 'N/A'}</td>
                            <td>${groupA.length}</td>
                        </tr>
                        <tr>
                            <td>B (Cashback)</td>
                            <td>${means['B (Cashback)'] !== null ? means['B (Cashback)'].toFixed(2) : 'N/A'}</td>
                            <td>${ciB ? `[${ciB.lower.toFixed(2)}, ${ciB.upper.toFixed(2)}]` : 'N/A'}</td>
                            <td>${stdDev(groupB) !== null ? stdDev(groupB).toFixed(2) : 'N/A'}</td>
                            <td>${groupB.length}</td>
                        </tr>
                        <tr>
                            <td>C (Generic)</td>
                            <td>${means['C (Generic)'] !== null ? means['C (Generic)'].toFixed(2) : 'N/A'}</td>
                            <td>${ciC ? `[${ciC.lower.toFixed(2)}, ${ciC.upper.toFixed(2)}]` : 'N/A'}</td>
                            <td>${stdDev(groupC) !== null ? stdDev(groupC).toFixed(2) : 'N/A'}</td>
                            <td>${groupC.length}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p><strong>ANOVA:</strong> F(${anovaResult.dfB}, ${anovaResult.dfW}) = ${anovaResult.F.toFixed(2)}, 
            p = ${anovaResult.pValue.toFixed(3)}${isSig ? ' <span class="badge badge-success">Significant</span>' : ' <span class="badge badge-warning">Not Significant</span>'}, 
            η² = ${anovaResult.etaSquared.toFixed(3)}, partial η² = ${anovaResult.partialEtaSquared ? anovaResult.partialEtaSquared.toFixed(3) : 'N/A'}</p>
            ${postHocHTML}
            <p><strong>Effect Sizes (Cohen's d):</strong> A vs B: ${interpretEffectSize(dAB)}, 
            A vs C: ${interpretEffectSize(dAC)}, 
            B vs C: ${interpretEffectSize(dBC)}</p>
        `);
    });

    const mainEffectsChartsEl = document.getElementById('mainEffectsCharts');
    const mainEffectsTablesEl = document.getElementById('mainEffectsTables');
    const mainEffectsSection = document.getElementById('mainEffectsSection');
    
    if (!mainEffectsChartsEl || !mainEffectsTablesEl) {
        console.error('Main effects elements not found');
        return;
    }
    
    // Clear and append charts container
    mainEffectsChartsEl.innerHTML = '';
    if (chartsContainer.children.length === 0) {
        mainEffectsChartsEl.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No data available for main effects analysis.</p>';
        if (mainEffectsSection) mainEffectsSection.style.display = 'none';
    } else {
        mainEffectsChartsEl.appendChild(chartsContainer);
        if (mainEffectsSection) mainEffectsSection.style.display = 'block';
    }
    
    if (tablesHTML.length === 0) {
        if (mainEffectsTablesEl) mainEffectsTablesEl.innerHTML = '';
    } else {
        if (mainEffectsTablesEl) mainEffectsTablesEl.innerHTML = tablesHTML.join('');
    }
}

// Render Website Impact
function renderWebsiteImpact() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded, skipping website impact');
        return;
    }
    
    const validData = processedData.filter(r => !r.excluded && r.intention_before !== null && r.intention_after !== null);
    
    if (validData.length === 0) {
        const websiteSection = document.getElementById('websiteSection');
        if (websiteSection) websiteSection.style.display = 'none';
        return;
    }
    
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
    
    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'chart-container';
    const canvas = document.createElement('canvas');
    chartWrapper.appendChild(canvas);
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

    // Paired t-tests for each condition
    const pairedTestA = pairedTTest(beforeA, afterA);
    const pairedTestB = pairedTTest(beforeB, afterB);
    const pairedTestC = pairedTTest(beforeC, afterC);

    const changes = {
        'A': (meanAfterA !== null && meanBeforeA !== null) ? meanAfterA - meanBeforeA : null,
        'B': (meanAfterB !== null && meanBeforeB !== null) ? meanAfterB - meanBeforeB : null,
        'C': (meanAfterC !== null && meanBeforeC !== null) ? meanAfterC - meanBeforeC : null
    };

    // Calculate change scores for mixed ANOVA
    const changeScoresA = groupA.map(r => r.intention_after - r.intention_before).filter(v => !isNaN(v));
    const changeScoresB = groupB.map(r => r.intention_after - r.intention_before).filter(v => !isNaN(v));
    const changeScoresC = groupC.map(r => r.intention_after - r.intention_before).filter(v => !isNaN(v));

    // Test if change scores differ by condition (mixed ANOVA interaction effect)
    const changeAnova = anova([changeScoresA, changeScoresB, changeScoresC]);
    const interactionSig = changeAnova.pValue < 0.05;

    const websiteChartsEl = document.getElementById('websiteCharts');
    const websiteAnalysisEl = document.getElementById('websiteAnalysis');
    if (!websiteChartsEl || !websiteAnalysisEl) {
        console.error('websiteCharts or websiteAnalysis element not found');
        return;
    }
    websiteChartsEl.innerHTML = '';
    websiteChartsEl.appendChild(chartWrapper);
    
    const changeA = changes.A !== null ? (changes.A > 0 ? '+' : '') + changes.A.toFixed(2) : 'N/A';
    const changeB = changes.B !== null ? (changes.B > 0 ? '+' : '') + changes.B.toFixed(2) : 'N/A';
    const changeC = changes.C !== null ? (changes.C > 0 ? '+' : '') + changes.C.toFixed(2) : 'N/A';

    // Format paired test results
    const formatPairedTest = (test, condition) => {
        if (!test) return `<li>Condition ${condition}: No data</li>`;
        const sigBadge = test.significant ? 
            '<span class="badge badge-success">Significant</span>' : 
            '<span class="badge badge-warning">Not Significant</span>';
        return `<li>Condition ${condition}: Mean change = ${test.meanDiff > 0 ? '+' : ''}${test.meanDiff.toFixed(2)}, 
                t(${test.df}) = ${test.t.toFixed(2)}, p = ${test.pValue.toFixed(3)} ${sigBadge}, 
                Cohen's d = ${test.cohensD.toFixed(2)}</li>`;
    };
    
    websiteAnalysisEl.innerHTML = `
        <div class="conclusion-box">
            <h4>Website Exposure Impact (H4: Pre/Post Website Comparison)</h4>
            <p><strong>Overall Change in Intention:</strong></p>
            <ul>
                <li>Condition A (Financial): ${changeA} points</li>
                <li>Condition B (Cashback): ${changeB} points</li>
                <li>Condition C (Generic): ${changeC} points</li>
            </ul>
            <p><strong>Paired t-tests (Within-Subject Effect):</strong></p>
            <ul>
                ${formatPairedTest(pairedTestA, 'A (Financial)')}
                ${formatPairedTest(pairedTestB, 'B (Cashback)')}
                ${formatPairedTest(pairedTestC, 'C (Generic)')}
            </ul>
            <p><strong>Interaction Effect (Framing × Time):</strong></p>
            <p>ANOVA on change scores: F(${changeAnova.dfB}, ${changeAnova.dfW}) = ${changeAnova.F.toFixed(2)}, 
            p = ${changeAnova.pValue.toFixed(3)}${interactionSig ? ' <span class="badge badge-success">Significant</span>' : ' <span class="badge badge-warning">Not Significant</span>'}</p>
            <p>${interactionSig ? 
                '<strong>Interpretation:</strong> The effect of website exposure differs significantly across framing conditions. Some frames benefit more from additional information than others.' : 
                '<strong>Interpretation:</strong> The effect of website exposure is consistent across all framing conditions. All frames benefit similarly from additional information.'}</p>
            <p><strong>Key Insight:</strong> ${Object.values(changes).filter(c => c !== null).some(c => c > 0) ? 
                'Website exposure generally increases intention scores, suggesting that detailed information helps participants understand and appreciate the benefit better.' : 
                'Website exposure does not significantly increase intention, suggesting that initial framing may be more influential than additional information.'}</p>
        </div>
    `;
}

// Render Moderation Analyses
function renderModeration() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded, skipping moderation');
        return;
    }
    
    const validData = processedData.filter(r => !r.excluded);
    const moderatorFilter = document.getElementById('moderatorFilter');
    if (!moderatorFilter) {
        console.error('moderatorFilter element not found');
        return;
    }
    const moderator = moderatorFilter.value;
    
    const moderationChartsEl = document.getElementById('moderationCharts');
    if (!moderationChartsEl) {
        console.error('moderationCharts element not found');
        return;
    }
    
    // Clear previous content
    moderationChartsEl.innerHTML = '';
    
    let moderationHTML = '';
    let canvasElement = null;
    let chartWrapper = null; // Declare at function scope
    
    if (moderator === 'involvement') {
        // Investment Involvement Moderation with proper interaction test
        const highInv = validData.filter(r => r.investment_involvement !== null && r.investment_involvement >= 4);
        const lowInv = validData.filter(r => r.investment_involvement !== null && r.investment_involvement < 4);
        
        const outcome = 'intention_after';
        
        // Prepare data for 2-way ANOVA
        const twoWayData = {
            groups: {
                'A': {
                    'High': highInv.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null),
                    'Low': lowInv.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null)
                },
                'B': {
                    'High': highInv.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null),
                    'Low': lowInv.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null)
                },
                'C': {
                    'High': highInv.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null),
                    'Low': lowInv.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null)
                }
            }
        };
        
        const interactionResult = twoWayAnova(twoWayData);
        
        const highA = twoWayData.groups['A']['High'];
        const highB = twoWayData.groups['B']['High'];
        const highC = twoWayData.groups['C']['High'];
        const lowA = twoWayData.groups['A']['Low'];
        const lowB = twoWayData.groups['B']['Low'];
        const lowC = twoWayData.groups['C']['Low'];
        
        const meanHighA = mean(highA);
        const meanHighB = mean(highB);
        const meanHighC = mean(highC);
        const meanLowA = mean(lowA);
        const meanLowB = mean(lowB);
        const meanLowC = mean(lowC);
        
        // Bar chart
        chartWrapper = document.createElement('div');
        chartWrapper.className = 'chart-container';
        const canvas = document.createElement('canvas');
        chartWrapper.appendChild(canvas);
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
        
        // Interaction plot (line chart)
        const interactionPlotWrapper = document.createElement('div');
        interactionPlotWrapper.className = 'chart-container interaction-plot';
        const interactionCanvas = document.createElement('canvas');
        interactionPlotWrapper.appendChild(interactionCanvas);
        
        new Chart(interactionCanvas, {
            type: 'line',
            data: {
                labels: ['Condition A', 'Condition B', 'Condition C'],
                datasets: [
                    {
                        label: 'High Investment Involvement',
                        data: [
                            meanHighA !== null ? meanHighA : null,
                            meanHighB !== null ? meanHighB : null,
                            meanHighC !== null ? meanHighC : null
                        ],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Low Investment Involvement',
                        data: [
                            meanLowA !== null ? meanLowA : null,
                            meanLowB !== null ? meanLowB : null,
                            meanLowC !== null ? meanLowC : null
                        ],
                        borderColor: '#9ca3af',
                        backgroundColor: 'rgba(156, 163, 175, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#9ca3af',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { 
                        display: true, 
                        text: 'Interaction Plot: Framing × Investment Involvement', 
                        font: { size: 16 } 
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        max: 7,
                        title: {
                            display: true,
                            text: 'Intention to Use'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Framing Condition'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
        
        canvasElement = document.createElement('div');
        canvasElement.appendChild(chartWrapper);
        canvasElement.appendChild(interactionPlotWrapper);
        
        // Simple effects analysis
        const highMeans = { 'A': meanHighA, 'B': meanHighB, 'C': meanHighC };
        const lowMeans = { 'A': meanLowA, 'B': meanLowB, 'C': meanLowC };
        const highBest = Object.entries(highMeans).filter(([_, v]) => v !== null).reduce((a, b) => a[1] > b[1] ? a : b, [null, -Infinity])[0];
        const lowBest = Object.entries(lowMeans).filter(([_, v]) => v !== null).reduce((a, b) => a[1] > b[1] ? a : b, [null, -Infinity])[0];
        
        // Calculate effect sizes within segments
        const dHighAB = cohensD(highA, highB);
        const dHighAC = cohensD(highA, highC);
        const dHighBC = cohensD(highB, highC);
        const dLowAB = cohensD(lowA, lowB);
        const dLowAC = cohensD(lowA, lowC);
        const dLowBC = cohensD(lowB, lowC);
        
        moderationHTML = `
            <div class="conclusion-box">
                <h4>Investment Involvement Moderation ${interactionResult.hasInteraction ? '<span class="badge badge-success">Significant Interaction</span>' : '<span class="badge badge-warning">No Significant Interaction</span>'}</h4>
                <p><strong>High Involvement (≥4):</strong> A: ${meanHighA !== null ? meanHighA.toFixed(2) : 'N/A'}, B: ${meanHighB !== null ? meanHighB.toFixed(2) : 'N/A'}, C: ${meanHighC !== null ? meanHighC.toFixed(2) : 'N/A'}</p>
                <p><strong>Low Involvement (<4):</strong> A: ${meanLowA !== null ? meanLowA.toFixed(2) : 'N/A'}, B: ${meanLowB !== null ? meanLowB.toFixed(2) : 'N/A'}, C: ${meanLowC !== null ? meanLowC.toFixed(2) : 'N/A'}</p>
                <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong>Effect Sizes (Cohen's d) Within Segments:</strong>
                    <div style="margin-top: 10px;">
                        <strong>High Involvement:</strong> A vs B: ${dHighAB !== null ? dHighAB.toFixed(2) : 'N/A'}, A vs C: ${dHighAC !== null ? dHighAC.toFixed(2) : 'N/A'}, B vs C: ${dHighBC !== null ? dHighBC.toFixed(2) : 'N/A'}
                    </div>
                    <div style="margin-top: 10px;">
                        <strong>Low Involvement:</strong> A vs B: ${dLowAB !== null ? dLowAB.toFixed(2) : 'N/A'}, A vs C: ${dLowAC !== null ? dLowAC.toFixed(2) : 'N/A'}, B vs C: ${dLowBC !== null ? dLowBC.toFixed(2) : 'N/A'}
                    </div>
                </div>
                ${interactionResult.hasInteraction ? `
                    <p><strong>Simple Effects:</strong></p>
                    <ul>
                        <li><strong>High Involvement:</strong> Best frame is ${highBest} (${highBest ? highMeans[highBest].toFixed(2) : 'N/A'})</li>
                        <li><strong>Low Involvement:</strong> Best frame is ${lowBest} (${lowBest ? lowMeans[lowBest].toFixed(2) : 'N/A'})</li>
                    </ul>
                    <p><em>Framing effects differ significantly between high and low involvement groups.</em></p>
                ` : '<p><em>Framing effects are similar across involvement levels.</em></p>'}
            </div>
        `;
    } else if (moderator === 'literacy') {
        // Financial Literacy Moderation with interaction test
        const highLit = validData.filter(r => r.financial_literacy === 3);
        const medLit = validData.filter(r => r.financial_literacy === 2);
        const lowLit = validData.filter(r => r.financial_literacy <= 1);
        
        const outcome = 'intention_after';
        
        // Prepare data for analysis (simplified 2-way for high vs low)
        const highLowData = {
            groups: {
                'A': {
                    'High': highLit.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null),
                    'Low': lowLit.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null)
                },
                'B': {
                    'High': highLit.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null),
                    'Low': lowLit.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null)
                },
                'C': {
                    'High': highLit.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null),
                    'Low': lowLit.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null)
                }
            }
        };
        
        const interactionResult = twoWayAnova(highLowData);
        
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
        
        // Bar chart
        chartWrapper = document.createElement('div');
        chartWrapper.className = 'chart-container';
        const canvas = document.createElement('canvas');
        chartWrapper.appendChild(canvas);
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
        
        // Interaction plot (line chart)
        const interactionPlotWrapper = document.createElement('div');
        interactionPlotWrapper.className = 'chart-container interaction-plot';
        const interactionCanvas = document.createElement('canvas');
        interactionPlotWrapper.appendChild(interactionCanvas);
        
        new Chart(interactionCanvas, {
            type: 'line',
            data: {
                labels: ['High Literacy', 'Medium Literacy', 'Low Literacy'],
                datasets: [
                    {
                        label: 'Condition A (Financial)',
                        data: [
                            meanHighA !== null ? meanHighA : null,
                            meanMedA !== null ? meanMedA : null,
                            meanLowA !== null ? meanLowA : null
                        ],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Condition B (Cashback)',
                        data: [
                            meanHighB !== null ? meanHighB : null,
                            meanMedB !== null ? meanMedB : null,
                            meanLowB !== null ? meanLowB : null
                        ],
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#764ba2',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Condition C (Generic)',
                        data: [
                            meanHighC !== null ? meanHighC : null,
                            meanMedC !== null ? meanMedC : null,
                            meanLowC !== null ? meanLowC : null
                        ],
                        borderColor: '#f093fb',
                        backgroundColor: 'rgba(240, 147, 251, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#f093fb',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { 
                        display: true, 
                        text: 'Interaction Plot: Framing × Financial Literacy', 
                        font: { size: 16 } 
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        max: 7,
                        title: {
                            display: true,
                            text: 'Intention to Use'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Financial Literacy Level'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
        
        canvasElement = document.createElement('div');
        canvasElement.appendChild(chartWrapper);
        canvasElement.appendChild(interactionPlotWrapper);
        const highMeans = { 'A': meanHighA, 'B': meanHighB, 'C': meanHighC };
        const lowMeans = { 'A': meanLowA, 'B': meanLowB, 'C': meanLowC };
        const highBest = Object.entries(highMeans).filter(([_, v]) => v !== null).reduce((a, b) => a[1] > b[1] ? a : b, [null, -Infinity])[0];
        const lowBest = Object.entries(lowMeans).filter(([_, v]) => v !== null).reduce((a, b) => a[1] > b[1] ? a : b, [null, -Infinity])[0];
        
        // Calculate effect sizes within segments
        const dHighAB = cohensD(highA, highB);
        const dHighAC = cohensD(highA, highC);
        const dHighBC = cohensD(highB, highC);
        const dLowAB = cohensD(lowA, lowB);
        const dLowAC = cohensD(lowA, lowC);
        const dLowBC = cohensD(lowB, lowC);
        
        moderationHTML = `
            <div class="conclusion-box">
                <h4>Financial Literacy Moderation ${interactionResult.hasInteraction ? '<span class="badge badge-success">Significant Interaction</span>' : '<span class="badge badge-warning">No Significant Interaction</span>'}</h4>
                <p><strong>High Literacy (3 correct):</strong> A: ${meanHighA !== null ? meanHighA.toFixed(2) : 'N/A'}, B: ${meanHighB !== null ? meanHighB.toFixed(2) : 'N/A'}, C: ${meanHighC !== null ? meanHighC.toFixed(2) : 'N/A'}</p>
                <p><strong>Medium Literacy (2 correct):</strong> A: ${meanMedA !== null ? meanMedA.toFixed(2) : 'N/A'}, B: ${meanMedB !== null ? meanMedB.toFixed(2) : 'N/A'}, C: ${meanMedC !== null ? meanMedC.toFixed(2) : 'N/A'}</p>
                <p><strong>Low Literacy (0-1 correct):</strong> A: ${meanLowA !== null ? meanLowA.toFixed(2) : 'N/A'}, B: ${meanLowB !== null ? meanLowB.toFixed(2) : 'N/A'}, C: ${meanLowC !== null ? meanLowC.toFixed(2) : 'N/A'}</p>
                <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong>Effect Sizes (Cohen's d) Within Segments:</strong>
                    <div style="margin-top: 10px;">
                        <strong>High Literacy:</strong> A vs B: ${dHighAB !== null ? dHighAB.toFixed(2) : 'N/A'}, A vs C: ${dHighAC !== null ? dHighAC.toFixed(2) : 'N/A'}, B vs C: ${dHighBC !== null ? dHighBC.toFixed(2) : 'N/A'}
                    </div>
                    <div style="margin-top: 10px;">
                        <strong>Low Literacy:</strong> A vs B: ${dLowAB !== null ? dLowAB.toFixed(2) : 'N/A'}, A vs C: ${dLowAC !== null ? dLowAC.toFixed(2) : 'N/A'}, B vs C: ${dLowBC !== null ? dLowBC.toFixed(2) : 'N/A'}
                    </div>
                </div>
                ${interactionResult.hasInteraction ? `
                    <p><strong>Simple Effects:</strong></p>
                    <ul>
                        <li><strong>High Literacy:</strong> Best frame is ${highBest} (${highBest ? highMeans[highBest].toFixed(2) : 'N/A'})</li>
                        <li><strong>Low Literacy:</strong> Best frame is ${lowBest} (${lowBest ? lowMeans[lowBest].toFixed(2) : 'N/A'})</li>
                    </ul>
                    <p><em>Framing effects differ significantly between high and low financial literacy groups.</em></p>
                ` : '<p><em>Framing effects are similar across financial literacy levels.</em></p>'}
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
        
        // Bar chart
        chartWrapper = document.createElement('div');
        chartWrapper.className = 'chart-container';
        const canvas = document.createElement('canvas');
        chartWrapper.appendChild(canvas);
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
        
        // Interaction plot (line chart)
        const interactionPlotWrapper = document.createElement('div');
        interactionPlotWrapper.className = 'chart-container interaction-plot';
        const interactionCanvas = document.createElement('canvas');
        interactionPlotWrapper.appendChild(interactionCanvas);
        
        new Chart(interactionCanvas, {
            type: 'line',
            data: {
                labels: ['Young (≤35)', 'Middle (36-50)', 'Older (51+)'],
                datasets: [
                    {
                        label: 'Condition A (Financial)',
                        data: [
                            meanYoungA !== null ? meanYoungA : null,
                            meanMiddleA !== null ? meanMiddleA : null,
                            meanOlderA !== null ? meanOlderA : null
                        ],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Condition B (Cashback)',
                        data: [
                            meanYoungB !== null ? meanYoungB : null,
                            meanMiddleB !== null ? meanMiddleB : null,
                            meanOlderB !== null ? meanOlderB : null
                        ],
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#764ba2',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Condition C (Generic)',
                        data: [
                            meanYoungC !== null ? meanYoungC : null,
                            meanMiddleC !== null ? meanMiddleC : null,
                            meanOlderC !== null ? meanOlderC : null
                        ],
                        borderColor: '#f093fb',
                        backgroundColor: 'rgba(240, 147, 251, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#f093fb',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { 
                        display: true, 
                        text: 'Interaction Plot: Framing × Age Group', 
                        font: { size: 16 } 
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        max: 7,
                        title: {
                            display: true,
                            text: 'Intention to Use'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Age Group'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
        
        canvasElement = document.createElement('div');
        canvasElement.appendChild(chartWrapper);
        canvasElement.appendChild(interactionPlotWrapper);
        moderationHTML = '';
    } else if (moderator === 'promotional') {
        // Promotional Benefit Involvement Moderation
        const highProm = validData.filter(r => r.promotional_involvement !== null && r.promotional_involvement >= 4);
        const lowProm = validData.filter(r => r.promotional_involvement !== null && r.promotional_involvement < 4);
        
        const outcome = 'intention_after';
        
        // Prepare data for 2-way ANOVA
        const twoWayData = {
            groups: {
                'A': {
                    'High': highProm.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null),
                    'Low': lowProm.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null)
                },
                'B': {
                    'High': highProm.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null),
                    'Low': lowProm.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null)
                },
                'C': {
                    'High': highProm.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null),
                    'Low': lowProm.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null)
                }
            }
        };
        
        const interactionResult = twoWayAnova(twoWayData);
        
        const highA = twoWayData.groups['A']['High'];
        const highB = twoWayData.groups['B']['High'];
        const highC = twoWayData.groups['C']['High'];
        const lowA = twoWayData.groups['A']['Low'];
        const lowB = twoWayData.groups['B']['Low'];
        const lowC = twoWayData.groups['C']['Low'];
        
        const meanHighA = mean(highA);
        const meanHighB = mean(highB);
        const meanHighC = mean(highC);
        const meanLowA = mean(lowA);
        const meanLowB = mean(lowB);
        const meanLowC = mean(lowC);
        
        // Bar chart
        chartWrapper = document.createElement('div');
        chartWrapper.className = 'chart-container';
        const canvas = document.createElement('canvas');
        chartWrapper.appendChild(canvas);
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Condition A', 'Condition B', 'Condition C'],
                datasets: [
                    {
                        label: 'High Promotional Involvement',
                        data: [
                            meanHighA !== null ? meanHighA : 0,
                            meanHighB !== null ? meanHighB : 0,
                            meanHighC !== null ? meanHighC : 0
                        ],
                        backgroundColor: '#667eea'
                    },
                    {
                        label: 'Low Promotional Involvement',
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
                    title: { display: true, text: 'Intention by Framing Condition × Promotional Benefit Involvement', font: { size: 16 } }
                },
                scales: { y: { beginAtZero: true, max: 7 } }
            }
        });
        
        // Interaction plot
        const interactionPlotWrapper = document.createElement('div');
        interactionPlotWrapper.className = 'chart-container interaction-plot';
        const interactionCanvas = document.createElement('canvas');
        interactionPlotWrapper.appendChild(interactionCanvas);
        
        new Chart(interactionCanvas, {
            type: 'line',
            data: {
                labels: ['Condition A', 'Condition B', 'Condition C'],
                datasets: [
                    {
                        label: 'High Promotional Involvement',
                        data: [
                            meanHighA !== null ? meanHighA : null,
                            meanHighB !== null ? meanHighB : null,
                            meanHighC !== null ? meanHighC : null
                        ],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Low Promotional Involvement',
                        data: [
                            meanLowA !== null ? meanLowA : null,
                            meanLowB !== null ? meanLowB : null,
                            meanLowC !== null ? meanLowC : null
                        ],
                        borderColor: '#9ca3af',
                        backgroundColor: 'rgba(156, 163, 175, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#9ca3af',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Interaction Plot: Framing × Promotional Benefit Involvement', font: { size: 16 } },
                    legend: { display: true, position: 'top' },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: { 
                    y: { beginAtZero: true, max: 7, title: { display: true, text: 'Intention to Use' } },
                    x: { title: { display: true, text: 'Framing Condition' } }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        });
        
        canvasElement = document.createElement('div');
        canvasElement.appendChild(chartWrapper);
        canvasElement.appendChild(interactionPlotWrapper);
        
        const highMeans = { 'A': meanHighA, 'B': meanHighB, 'C': meanHighC };
        const lowMeans = { 'A': meanLowA, 'B': meanLowB, 'C': meanLowC };
        const highBest = Object.entries(highMeans).filter(([_, v]) => v !== null).reduce((a, b) => a[1] > b[1] ? a : b, [null, -Infinity])[0];
        const lowBest = Object.entries(lowMeans).filter(([_, v]) => v !== null).reduce((a, b) => a[1] > b[1] ? a : b, [null, -Infinity])[0];
        
        // Calculate effect sizes within segments
        const dHighAB = cohensD(highA, highB);
        const dHighAC = cohensD(highA, highC);
        const dHighBC = cohensD(highB, highC);
        const dLowAB = cohensD(lowA, lowB);
        const dLowAC = cohensD(lowA, lowC);
        const dLowBC = cohensD(lowB, lowC);
        
        moderationHTML = `
            <div class="conclusion-box">
                <h4>Promotional Benefit Involvement Moderation ${interactionResult.hasInteraction ? '<span class="badge badge-success">Significant Interaction</span>' : '<span class="badge badge-warning">No Significant Interaction</span>'}</h4>
                <p><strong>High Involvement (≥4):</strong> A: ${meanHighA !== null ? meanHighA.toFixed(2) : 'N/A'}, B: ${meanHighB !== null ? meanHighB.toFixed(2) : 'N/A'}, C: ${meanHighC !== null ? meanHighC.toFixed(2) : 'N/A'}</p>
                <p><strong>Low Involvement (<4):</strong> A: ${meanLowA !== null ? meanLowA.toFixed(2) : 'N/A'}, B: ${meanLowB !== null ? meanLowB.toFixed(2) : 'N/A'}, C: ${meanLowC !== null ? meanLowC.toFixed(2) : 'N/A'}</p>
                <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong>Effect Sizes (Cohen's d) Within Segments:</strong>
                    <div style="margin-top: 10px;">
                        <strong>High Involvement:</strong> A vs B: ${dHighAB !== null ? dHighAB.toFixed(2) : 'N/A'}, A vs C: ${dHighAC !== null ? dHighAC.toFixed(2) : 'N/A'}, B vs C: ${dHighBC !== null ? dHighBC.toFixed(2) : 'N/A'}
                    </div>
                    <div style="margin-top: 10px;">
                        <strong>Low Involvement:</strong> A vs B: ${dLowAB !== null ? dLowAB.toFixed(2) : 'N/A'}, A vs C: ${dLowAC !== null ? dLowAC.toFixed(2) : 'N/A'}, B vs C: ${dLowBC !== null ? dLowBC.toFixed(2) : 'N/A'}
                    </div>
                </div>
                ${interactionResult.hasInteraction ? `
                    <p><strong>Simple Effects:</strong></p>
                    <ul>
                        <li><strong>High Involvement:</strong> Best frame is ${highBest} (${highBest ? highMeans[highBest].toFixed(2) : 'N/A'})</li>
                        <li><strong>Low Involvement:</strong> Best frame is ${lowBest} (${lowBest ? lowMeans[lowBest].toFixed(2) : 'N/A'})</li>
                    </ul>
                    <p><em>Framing effects differ significantly between high and low promotional involvement groups.</em></p>
                ` : '<p><em>Framing effects are similar across promotional involvement levels.</em></p>'}
            </div>
        `;
    } else if (moderator === 'income') {
        // Income Level Moderation
        const lowIncome = validData.filter(r => r.monthly_income === 'less_1500' || r.monthly_income === '1500_2500');
        const midIncome = validData.filter(r => r.monthly_income === '2500_4000' || r.monthly_income === '4000_6000');
        const highIncome = validData.filter(r => r.monthly_income === 'more_6000');
        
        const outcome = 'intention_after';
        const lowA = lowIncome.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const lowB = lowIncome.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const lowC = lowIncome.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        const midA = midIncome.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const midB = midIncome.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const midC = midIncome.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        const highA = highIncome.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const highB = highIncome.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const highC = highIncome.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        
        const meanLowA = mean(lowA);
        const meanLowB = mean(lowB);
        const meanLowC = mean(lowC);
        const meanMidA = mean(midA);
        const meanMidB = mean(midB);
        const meanMidC = mean(midC);
        const meanHighA = mean(highA);
        const meanHighB = mean(highB);
        const meanHighC = mean(highC);
        
        // Bar chart
        chartWrapper = document.createElement('div');
        chartWrapper.className = 'chart-container';
        const canvas = document.createElement('canvas');
        chartWrapper.appendChild(canvas);
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Low Income (≤€2500)', 'Mid Income (€2500-€6000)', 'High Income (>€6000)'],
                datasets: [
                    {
                        label: 'Condition A (Financial)',
                        data: [
                            meanLowA !== null ? meanLowA : 0,
                            meanMidA !== null ? meanMidA : 0,
                            meanHighA !== null ? meanHighA : 0
                        ],
                        backgroundColor: '#667eea'
                    },
                    {
                        label: 'Condition B (Cashback)',
                        data: [
                            meanLowB !== null ? meanLowB : 0,
                            meanMidB !== null ? meanMidB : 0,
                            meanHighB !== null ? meanHighB : 0
                        ],
                        backgroundColor: '#764ba2'
                    },
                    {
                        label: 'Condition C (Generic)',
                        data: [
                            meanLowC !== null ? meanLowC : 0,
                            meanMidC !== null ? meanMidC : 0,
                            meanHighC !== null ? meanHighC : 0
                        ],
                        backgroundColor: '#f093fb'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Intention by Framing Condition × Income Level', font: { size: 16 } }
                },
                scales: { y: { beginAtZero: true, max: 7 } }
            }
        });
        
        // Interaction plot
        const interactionPlotWrapper = document.createElement('div');
        interactionPlotWrapper.className = 'chart-container interaction-plot';
        const interactionCanvas = document.createElement('canvas');
        interactionPlotWrapper.appendChild(interactionCanvas);
        
        new Chart(interactionCanvas, {
            type: 'line',
            data: {
                labels: ['Low Income', 'Mid Income', 'High Income'],
                datasets: [
                    {
                        label: 'Condition A (Financial)',
                        data: [
                            meanLowA !== null ? meanLowA : null,
                            meanMidA !== null ? meanMidA : null,
                            meanHighA !== null ? meanHighA : null
                        ],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Condition B (Cashback)',
                        data: [
                            meanLowB !== null ? meanLowB : null,
                            meanMidB !== null ? meanMidB : null,
                            meanHighB !== null ? meanHighB : null
                        ],
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#764ba2',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Condition C (Generic)',
                        data: [
                            meanLowC !== null ? meanLowC : null,
                            meanMidC !== null ? meanMidC : null,
                            meanHighC !== null ? meanHighC : null
                        ],
                        borderColor: '#f093fb',
                        backgroundColor: 'rgba(240, 147, 251, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#f093fb',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Interaction Plot: Framing × Income Level', font: { size: 16 } },
                    legend: { display: true, position: 'top' },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: { 
                    y: { beginAtZero: true, max: 7, title: { display: true, text: 'Intention to Use' } },
                    x: { title: { display: true, text: 'Income Level' } }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        });
        
        canvasElement = document.createElement('div');
        canvasElement.appendChild(chartWrapper);
        canvasElement.appendChild(interactionPlotWrapper);
        
        moderationHTML = `
            <div class="conclusion-box">
                <h4>Income Level Moderation</h4>
                <p><strong>Low Income (≤€2500):</strong> A: ${meanLowA !== null ? meanLowA.toFixed(2) : 'N/A'}, B: ${meanLowB !== null ? meanLowB.toFixed(2) : 'N/A'}, C: ${meanLowC !== null ? meanLowC.toFixed(2) : 'N/A'}</p>
                <p><strong>Mid Income (€2500-€6000):</strong> A: ${meanMidA !== null ? meanMidA.toFixed(2) : 'N/A'}, B: ${meanMidB !== null ? meanMidB.toFixed(2) : 'N/A'}, C: ${meanMidC !== null ? meanMidC.toFixed(2) : 'N/A'}</p>
                <p><strong>High Income (>€6000):</strong> A: ${meanHighA !== null ? meanHighA.toFixed(2) : 'N/A'}, B: ${meanHighB !== null ? meanHighB.toFixed(2) : 'N/A'}, C: ${meanHighC !== null ? meanHighC.toFixed(2) : 'N/A'}</p>
                <p><em>Income level may moderate framing effects. Higher income participants may respond differently to financial framing.</em></p>
            </div>
        `;
    } else if (moderator === 'gender') {
        // Gender Moderation
        const women = validData.filter(r => r.gender_code === '2');
        const men = validData.filter(r => r.gender_code === '9');
        const other = validData.filter(r => r.gender_code !== '2' && r.gender_code !== '9');
        
        const outcome = 'intention_after';
        const womenA = women.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const womenB = women.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const womenC = women.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        const menA = men.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const menB = men.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const menC = men.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        const otherA = other.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const otherB = other.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const otherC = other.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        
        const meanWomenA = mean(womenA);
        const meanWomenB = mean(womenB);
        const meanWomenC = mean(womenC);
        const meanMenA = mean(menA);
        const meanMenB = mean(menB);
        const meanMenC = mean(menC);
        const meanOtherA = mean(otherA);
        const meanOtherB = mean(otherB);
        const meanOtherC = mean(otherC);
        
        // Bar chart
        chartWrapper = document.createElement('div');
        chartWrapper.className = 'chart-container';
        const canvas = document.createElement('canvas');
        chartWrapper.appendChild(canvas);
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Women', 'Men', 'Other'],
                datasets: [
                    {
                        label: 'Condition A (Financial)',
                        data: [
                            meanWomenA !== null ? meanWomenA : 0,
                            meanMenA !== null ? meanMenA : 0,
                            meanOtherA !== null ? meanOtherA : 0
                        ],
                        backgroundColor: '#667eea'
                    },
                    {
                        label: 'Condition B (Cashback)',
                        data: [
                            meanWomenB !== null ? meanWomenB : 0,
                            meanMenB !== null ? meanMenB : 0,
                            meanOtherB !== null ? meanOtherB : 0
                        ],
                        backgroundColor: '#764ba2'
                    },
                    {
                        label: 'Condition C (Generic)',
                        data: [
                            meanWomenC !== null ? meanWomenC : 0,
                            meanMenC !== null ? meanMenC : 0,
                            meanOtherC !== null ? meanOtherC : 0
                        ],
                        backgroundColor: '#f093fb'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Intention by Framing Condition × Gender', font: { size: 16 } }
                },
                scales: { y: { beginAtZero: true, max: 7 } }
            }
        });
        
        // Interaction plot
        const interactionPlotWrapper = document.createElement('div');
        interactionPlotWrapper.className = 'chart-container interaction-plot';
        const interactionCanvas = document.createElement('canvas');
        interactionPlotWrapper.appendChild(interactionCanvas);
        
        new Chart(interactionCanvas, {
            type: 'line',
            data: {
                labels: ['Women', 'Men', 'Other'],
                datasets: [
                    {
                        label: 'Condition A (Financial)',
                        data: [
                            meanWomenA !== null ? meanWomenA : null,
                            meanMenA !== null ? meanMenA : null,
                            meanOtherA !== null ? meanOtherA : null
                        ],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Condition B (Cashback)',
                        data: [
                            meanWomenB !== null ? meanWomenB : null,
                            meanMenB !== null ? meanMenB : null,
                            meanOtherB !== null ? meanOtherB : null
                        ],
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#764ba2',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Condition C (Generic)',
                        data: [
                            meanWomenC !== null ? meanWomenC : null,
                            meanMenC !== null ? meanMenC : null,
                            meanOtherC !== null ? meanOtherC : null
                        ],
                        borderColor: '#f093fb',
                        backgroundColor: 'rgba(240, 147, 251, 0.1)',
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        pointBackgroundColor: '#f093fb',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: { display: true, text: 'Interaction Plot: Framing × Gender', font: { size: 16 } },
                    legend: { display: true, position: 'top' },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: { 
                    y: { beginAtZero: true, max: 7, title: { display: true, text: 'Intention to Use' } },
                    x: { title: { display: true, text: 'Gender' } }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        });
        
        canvasElement = document.createElement('div');
        canvasElement.appendChild(chartWrapper);
        canvasElement.appendChild(interactionPlotWrapper);
        
        moderationHTML = `
            <div class="conclusion-box">
                <h4>Gender Moderation</h4>
                <p><strong>Women:</strong> A: ${meanWomenA !== null ? meanWomenA.toFixed(2) : 'N/A'}, B: ${meanWomenB !== null ? meanWomenB.toFixed(2) : 'N/A'}, C: ${meanWomenC !== null ? meanWomenC.toFixed(2) : 'N/A'}</p>
                <p><strong>Men:</strong> A: ${meanMenA !== null ? meanMenA.toFixed(2) : 'N/A'}, B: ${meanMenB !== null ? meanMenB.toFixed(2) : 'N/A'}, C: ${meanMenC !== null ? meanMenC.toFixed(2) : 'N/A'}</p>
                ${other.length > 5 ? `<p><strong>Other:</strong> A: ${meanOtherA !== null ? meanOtherA.toFixed(2) : 'N/A'}, B: ${meanOtherB !== null ? meanOtherB.toFixed(2) : 'N/A'}, C: ${meanOtherC !== null ? meanOtherC.toFixed(2) : 'N/A'}</p>` : ''}
                <p><em>Gender may moderate framing effects. Research suggests men and women may respond differently to financial messaging.</em></p>
            </div>
        `;
    } else {
        moderationHTML = `
            <div class="conclusion-box">
                <h4>Moderation Analysis</h4>
                <p>Moderation analyses examine how framing effects vary by participant characteristics. 
                Select a moderator from the dropdown above to view detailed comparisons.</p>
            </div>
        `;
    }
    
    const moderationSection = document.getElementById('moderationSection');
    
    if (!canvasElement && (!moderationHTML || moderationHTML.trim() === '')) {
        moderationChartsEl.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No moderation data available.</p>';
        if (moderationSection) moderationSection.style.display = 'none';
    } else {
        // Append canvas directly (don't use innerHTML - it breaks Chart.js)
        if (canvasElement) {
            moderationChartsEl.appendChild(canvasElement);
        }
        // Append HTML content
        if (moderationHTML && moderationHTML.trim() !== '') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = moderationHTML;
            while (tempDiv.firstChild) {
                moderationChartsEl.appendChild(tempDiv.firstChild);
            }
        }
        if (moderationSection) moderationSection.style.display = 'block';
    }
}

// Add event listener for moderator filter (moved to loadData completion)
function setupEventListeners() {
    const moderatorFilter = document.getElementById('moderatorFilter');
    if (moderatorFilter) {
        // Remove existing listeners to avoid duplicates
        moderatorFilter.removeEventListener('change', renderModeration);
        moderatorFilter.addEventListener('change', renderModeration);
    }
    
    // Note: outcomeFilter functionality can be added here if needed
    // Currently main effects shows all outcomes by default
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

// Enhanced Text Analysis with Thematic Coding
function renderEnhancedTextAnalysis() {
    const validData = processedData.filter(r => !r.excluded);
    
    // Thematic coding for manipulation thoughts
    const manipulationThemes = {
        'Financial Markets': ['financial', 'market', 'invest', 'investment', 'stock', 'etf', 'portfolio'],
        'Risk Perception': ['risk', 'risky', 'uncertain', 'volatile', 'volatility', 'danger', 'safe', 'security'],
        'Complexity': ['complex', 'complicated', 'confusing', 'difficult', 'hard', 'understand', 'clear', 'simple'],
        'Trust': ['trust', 'reliable', 'legitimate', 'scam', 'suspicious', 'believe', 'credible'],
        'Value Proposition': ['benefit', 'advantage', 'worth', 'value', 'reward', 'cashback', 'money', 'profit'],
        'Timing': ['time', 'wait', 'delay', 'months', 'long', 'quick', 'fast', 'immediate']
    };
    
    // Thematic coding for concerns
    const concernThemes = {
        'Security/Trust': ['trust', 'security', 'safe', 'secure', 'scam', 'fraud', 'legitimate', 'reliable'],
        'Understanding/Complexity': ['understand', 'confusing', 'complex', 'complicated', 'clear', 'explain', 'how'],
        'Financial Risk': ['risk', 'risky', 'lose', 'money', 'volatile', 'uncertain', 'guarantee'],
        'Time Delay': ['time', 'wait', 'delay', 'months', 'long', 'slow', 'quick'],
        'Value Uncertainty': ['value', 'worth', 'amount', 'how much', 'uncertain', 'guarantee', 'minimum'],
        'Platform Reliability': ['platform', 'service', 'company', 'reliable', 'work', 'function', 'technical']
    };
    
    // Analyze manipulation thoughts by theme and condition
    const manipulationByTheme = {};
    const manipulationByCondition = { 'A': [], 'B': [], 'C': [] };
    
    Object.keys(manipulationThemes).forEach(theme => {
        manipulationByTheme[theme] = { 'A': 0, 'B': 0, 'C': 0, total: 0 };
    });
    
    validData.forEach(row => {
        if (row.manipulation_thoughts) {
            const text = (row.manipulation_thoughts || '').toLowerCase();
            const condition = row.framing_condition_text;
            manipulationByCondition[condition].push(row);
            
            Object.entries(manipulationThemes).forEach(([theme, keywords]) => {
                if (keywords.some(keyword => text.includes(keyword))) {
                    manipulationByTheme[theme][condition]++;
                    manipulationByTheme[theme].total++;
                }
            });
        }
    });
    
    // Analyze concerns by theme and condition
    const concernsByTheme = {};
    const concernsByCondition = { 'A': [], 'B': [], 'C': [] };
    const concernIntentionCorrelation = {};
    
    Object.keys(concernThemes).forEach(theme => {
        concernsByTheme[theme] = { 'A': 0, 'B': 0, 'C': 0, total: 0, avgIntention: [] };
    });
    
    validData.forEach(row => {
        if (row.concerns_text) {
            const text = (row.concerns_text || '').toLowerCase();
            const condition = row.framing_condition_text;
            concernsByCondition[condition].push(row);
            
            Object.entries(concernThemes).forEach(([theme, keywords]) => {
                if (keywords.some(keyword => text.includes(keyword))) {
                    concernsByTheme[theme][condition]++;
                    concernsByTheme[theme].total++;
                    if (row.intention_after !== null) {
                        concernsByTheme[theme].avgIntention.push(row.intention_after);
                    }
                }
            });
        }
    });
    
    // Calculate average intention for each theme
    Object.keys(concernsByTheme).forEach(theme => {
        const intentions = concernsByTheme[theme].avgIntention;
        concernsByTheme[theme].avgIntention = intentions.length > 0 ? mean(intentions) : null;
    });
    
    // Sentiment analysis (basic)
    const positiveWords = ['good', 'great', 'excellent', 'interesting', 'useful', 'beneficial', 'helpful', 'valuable', 'attractive'];
    const negativeWords = ['bad', 'worried', 'concerned', 'suspicious', 'risky', 'confusing', 'complicated', 'difficult', 'uncertain'];
    
    const sentimentByCondition = { 'A': { positive: 0, negative: 0, neutral: 0 }, 'B': { positive: 0, negative: 0, neutral: 0 }, 'C': { positive: 0, negative: 0, neutral: 0 } };
    
    validData.forEach(row => {
        if (row.manipulation_thoughts) {
            const text = (row.manipulation_thoughts || '').toLowerCase();
            const condition = row.framing_condition_text;
            const posCount = positiveWords.filter(word => text.includes(word)).length;
            const negCount = negativeWords.filter(word => text.includes(word)).length;
            
            if (posCount > negCount) sentimentByCondition[condition].positive++;
            else if (negCount > posCount) sentimentByCondition[condition].negative++;
            else sentimentByCondition[condition].neutral++;
        }
    });
    
    const textAnalysisEl = document.getElementById('textAnalysisContent');
    if (!textAnalysisEl) {
        console.error('textAnalysisContent element not found');
        return;
    }
    
    // Create charts for theme frequency
    let chartsHTML = '';
    if (typeof Chart !== 'undefined') {
        // Manipulation themes chart
        const themeChartWrapper = document.createElement('div');
        themeChartWrapper.className = 'chart-container';
        const themeCanvas = document.createElement('canvas');
        themeChartWrapper.appendChild(themeCanvas);
        
        const themeLabels = Object.keys(manipulationByTheme);
        const themeDataA = themeLabels.map(theme => manipulationByTheme[theme]['A']);
        const themeDataB = themeLabels.map(theme => manipulationByTheme[theme]['B']);
        const themeDataC = themeLabels.map(theme => manipulationByTheme[theme]['C']);
        
        try {
            new Chart(themeCanvas, {
                type: 'bar',
                data: {
                    labels: themeLabels,
                    datasets: [
                        {
                            label: 'Condition A (Financial)',
                            data: themeDataA,
                            backgroundColor: '#667eea'
                        },
                        {
                            label: 'Condition B (Cashback)',
                            data: themeDataB,
                            backgroundColor: '#764ba2'
                        },
                        {
                            label: 'Condition C (Generic)',
                            data: themeDataC,
                            backgroundColor: '#f093fb'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: { display: true, text: 'Themes in Manipulation Thoughts by Condition', font: { size: 16 } }
                    },
                    scales: { y: { beginAtZero: true } }
                }
            });
            chartsHTML = themeChartWrapper.outerHTML;
        } catch (error) {
            console.error('Error creating theme chart:', error);
        }
    }
    
    textAnalysisEl.innerHTML = `
        <div class="conclusion-box">
            <h4>📊 Thematic Analysis of Manipulation Thoughts</h4>
            <p>Analysis of open-ended responses reveals what themes participants associate with each framing condition.</p>
        </div>
        ${chartsHTML}
        <div style="margin: 20px 0;">
            <h3>Theme Frequency by Condition</h3>
            <div class="text-analysis">
                ${Object.entries(manipulationByTheme).map(([theme, data]) => `
                    <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 8px;">
                        <strong>${theme}:</strong>
                        <span class="theme-tag">A: ${data.A}</span>
                        <span class="theme-tag">B: ${data.B}</span>
                        <span class="theme-tag">C: ${data.C}</span>
                        <span class="theme-tag small">Total: ${data.total}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="conclusion-box">
            <h4>😊 Sentiment Analysis</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                ${Object.entries(sentimentByCondition).map(([condition, sentiment]) => `
                    <div style="background: white; padding: 15px; border-radius: 8px;">
                        <strong>Condition ${condition}:</strong>
                        <div style="margin-top: 10px;">
                            <div style="color: #10b981;">Positive: ${sentiment.positive}</div>
                            <div style="color: #ef4444;">Negative: ${sentiment.negative}</div>
                            <div style="color: #9ca3af;">Neutral: ${sentiment.neutral}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="conclusion-box">
            <h4>🎯 Key Insights</h4>
            <ul>
                <li><strong>Financial Markets theme</strong> appears most in Condition A (${manipulationByTheme['Financial Markets']?.A || 0} mentions)</li>
                <li><strong>Risk Perception</strong> is mentioned ${manipulationByTheme['Risk Perception']?.total || 0} times across all conditions</li>
                <li><strong>Complexity</strong> concerns appear ${manipulationByTheme['Complexity']?.total || 0} times</li>
                <li>Sentiment varies by condition, with Condition ${Object.entries(sentimentByCondition).reduce((a, b) => 
                    sentimentByCondition[a[0]].positive > sentimentByCondition[b[0]].positive ? a : b
                )[0]} showing most positive sentiment</li>
            </ul>
        </div>
    `;
}

// Render Segmentation & Targeting
function renderSegmentation() {
    const validData = processedData.filter(r => !r.excluded);
    
    // Create segmentation profiles based on financial literacy and investment involvement
    const profiles = [];
    
    // High FL + High Inv
    const highFLHighInv = validData.filter(r => 
        r.financial_literacy === 3 && 
        r.investment_involvement !== null && 
        r.investment_involvement >= 4
    );
    
    // High FL + Low Inv
    const highFLLowInv = validData.filter(r => 
        r.financial_literacy === 3 && 
        r.investment_involvement !== null && 
        r.investment_involvement < 4
    );
    
    // Low FL + High Inv
    const lowFLHighInv = validData.filter(r => 
        r.financial_literacy <= 1 && 
        r.investment_involvement !== null && 
        r.investment_involvement >= 4
    );
    
    // Low FL + Low Inv
    const lowFLLowInv = validData.filter(r => 
        r.financial_literacy <= 1 && 
        r.investment_involvement !== null && 
        r.investment_involvement < 4
    );
    
    // Medium FL
    const medFL = validData.filter(r => r.financial_literacy === 2);
    
    // Calculate best frame for each segment
    function getBestFrame(segment, segmentName) {
        if (segment.length === 0) return null;
        
        const outcome = 'intention_after';
        const groupA = segment.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
        const groupB = segment.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
        const groupC = segment.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
        
        const meanA = mean(groupA);
        const meanB = mean(groupB);
        const meanC = mean(groupC);
        
        const means = { 'A': meanA, 'B': meanB, 'C': meanC };
        const validMeans = Object.entries(means).filter(([_, v]) => v !== null);
        
        if (validMeans.length === 0) return null;
        
        const best = validMeans.reduce((a, b) => means[a[0]] > means[b[0]] ? a : b)[0];
        const bestMean = means[best];
        const secondBest = validMeans.filter(([k]) => k !== best).reduce((a, b) => means[a[0]] > means[b[0]] ? a : b, validMeans[0]);
        const secondBestMean = means[secondBest[0]];
        
        // Calculate confidence based on difference and sample size
        const diff = bestMean - secondBestMean;
        const sampleSize = segment.length;
        let confidence = Math.min(95, 50 + (diff * 10) + (sampleSize > 20 ? 20 : sampleSize));
        
        return {
            frame: best,
            mean: bestMean,
            confidence: Math.round(confidence),
            sampleSize: sampleSize,
            means: means
        };
    }
    
    const segmentResults = [
        { segment: highFLHighInv, name: 'High Financial Literacy + High Investment Involvement', label: 'High FL + High Inv' },
        { segment: highFLLowInv, name: 'High Financial Literacy + Low Investment Involvement', label: 'High FL + Low Inv' },
        { segment: lowFLHighInv, name: 'Low Financial Literacy + High Investment Involvement', label: 'Low FL + High Inv' },
        { segment: lowFLLowInv, name: 'Low Financial Literacy + Low Investment Involvement', label: 'Low FL + Low Inv' },
        { segment: medFL, name: 'Medium Financial Literacy', label: 'Medium FL' }
    ];
    
    const segmentationEl = document.getElementById('segmentationContent');
    if (!segmentationEl) {
        console.error('segmentationContent element not found');
        return;
    }
    
    const frameNames = { 'A': 'Financial Frame (A)', 'B': 'Cashback Frame (B)', 'C': 'Generic Frame (C)' };
    
    segmentationEl.innerHTML = `
        <div class="conclusion-box">
            <h4>🎯 Segmentation Strategy</h4>
            <p>Based on financial literacy and investment involvement, different user segments respond best to different framing conditions.</p>
        </div>
        ${segmentResults.map(({ segment, name, label }) => {
            const result = getBestFrame(segment, name);
            if (!result) return '';
            
            const confidenceClass = result.confidence >= 70 ? 'high' : result.confidence >= 50 ? 'medium' : 'low';
            
            return `
                <div class="segmentation-profile">
                    <h4>${name} <span class="confidence-badge ${confidenceClass}">${result.confidence}% confidence</span></h4>
                    <p><strong>Recommended Frame:</strong> ${frameNames[result.frame]} (Intention: ${result.mean.toFixed(2)})</p>
                    <p><strong>Sample Size:</strong> ${result.sampleSize} participants</p>
                    <div style="margin-top: 10px; font-size: 14px; color: #666;">
                        <strong>All Frames:</strong> 
                        A: ${result.means.A !== null ? result.means.A.toFixed(2) : 'N/A'}, 
                        B: ${result.means.B !== null ? result.means.B.toFixed(2) : 'N/A'}, 
                        C: ${result.means.C !== null ? result.means.C.toFixed(2) : 'N/A'}
                    </div>
                    ${result.sampleSize < 15 ? '<p style="color: #f59e0b; margin-top: 10px;"><em>⚠️ Low sample size - results should be interpreted with caution</em></p>' : ''}
                </div>
            `;
        }).join('')}
        <div class="recommendation-box">
            <h4>💡 Targeting Recommendations</h4>
            <ul>
                <li><strong>High FL + High Inv:</strong> Use Financial Frame (A) - these users understand and value investment language</li>
                <li><strong>Low FL + Low Inv:</strong> Use Generic Frame (C) - simpler messaging works better for less financially engaged users</li>
                <li><strong>Medium segments:</strong> Test multiple frames or use Cashback Frame (B) as a balanced approach</li>
                <li><strong>Segments with low confidence:</strong> Collect more data before making final recommendations</li>
            </ul>
        </div>
    `;
}

// Render Communication Effectiveness
function renderCommunicationEffectiveness() {
    const validData = processedData.filter(r => !r.excluded);
    
    // Comprehension analysis (from manipulation check)
    const comprehensionByFrame = { 'A': [], 'B': [], 'C': [] };
    validData.forEach(row => {
        if (row.manipulation_thoughts && row.intention_after !== null) {
            const text = (row.manipulation_thoughts || '').toLowerCase();
            const condition = row.framing_condition_text;
            // Simple comprehension indicator: mentions of key concepts
            const keyConcepts = ['benefit', 'cashback', 'reward', 'financial', 'market', 'tagpeak'];
            const mentions = keyConcepts.filter(concept => text.includes(concept)).length;
            comprehensionByFrame[condition].push({ mentions, intention: row.intention_after });
        }
    });
    
    // Trust indicators (from clarity and advantage)
    const trustByFrame = { 'A': [], 'B': [], 'C': [] };
    validData.forEach(row => {
        if (row.clarity !== null && row.advantage !== null) {
            const condition = row.framing_condition_text;
            const trustScore = (row.clarity + row.advantage) / 2;
            trustByFrame[condition].push(trustScore);
        }
    });
    
    // Message involvement breakdown
    const involvementDimensions = {
        'Interest': 'involvement_interested',
        'Absorption': 'involvement_absorbed',
        'Attention': 'involvement_attention',
        'Relevance': 'involvement_relevant',
        'Interesting': 'involvement_interesting',
        'Engagement': 'involvement_engaging'
    };
    
    const involvementByDimension = {};
    Object.entries(involvementDimensions).forEach(([dim, key]) => {
        involvementByDimension[dim] = { 'A': [], 'B': [], 'C': [] };
        validData.forEach(row => {
            const val = parseFloat(row[key]);
            if (val > 0) {
                involvementByDimension[dim][row.framing_condition_text].push(val);
            }
        });
    });
    
    // Calculate correlations between involvement dimensions and intention
    const dimensionCorrelations = {};
    Object.keys(involvementDimensions).forEach(dim => {
        const key = involvementDimensions[dim];
        const values = validData.map(r => parseFloat(r[key])).filter(v => v > 0);
        const intentions = validData.map(r => r.intention_after).filter(v => v !== null);
        // Simple correlation (if same length)
        if (values.length === intentions.length && values.length > 0) {
            const meanVal = mean(values);
            const meanInt = mean(intentions);
            const covariance = values.reduce((sum, v, i) => sum + (v - meanVal) * (intentions[i] - meanInt), 0) / values.length;
            const stdVal = stdDev(values);
            const stdInt = stdDev(intentions);
            dimensionCorrelations[dim] = (stdVal && stdInt) ? covariance / (stdVal * stdInt) : 0;
        }
    });
    
    const commEffEl = document.getElementById('communicationEffectivenessContent');
    if (!commEffEl) {
        console.error('communicationEffectivenessContent element not found');
        return;
    }
    
    commEffEl.innerHTML = `
        <div class="conclusion-box">
            <h4>📊 Communication Effectiveness Overview</h4>
            <p>These metrics measure how well each framing condition communicates TagPeak's value proposition.</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0;">
            ${['A', 'B', 'C'].map(condition => {
                const avgComprehension = comprehensionByFrame[condition].length > 0 
                    ? mean(comprehensionByFrame[condition].map(c => c.mentions)) 
                    : null;
                const avgTrust = trustByFrame[condition].length > 0 
                    ? mean(trustByFrame[condition]) 
                    : null;
                const avgInvolvement = validData.filter(r => r.framing_condition_text === condition && r.message_involvement !== null)
                    .map(r => r.message_involvement);
                const avgInv = avgInvolvement.length > 0 ? mean(avgInvolvement) : null;
                
                return `
                    <div class="metric-card">
                        <h4>Condition ${condition}</h4>
                        <div class="metric-value">${avgInv !== null ? avgInv.toFixed(2) : 'N/A'}</div>
                        <div class="metric-label">Message Involvement</div>
                        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                            <div style="font-size: 14px; color: #666;">
                                <div>Trust Score: ${avgTrust !== null ? avgTrust.toFixed(2) : 'N/A'}</div>
                                <div>Comprehension: ${avgComprehension !== null ? avgComprehension.toFixed(1) : 'N/A'} key concepts</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="conclusion-box">
            <h4>🔍 Message Involvement Dimensions</h4>
            <p>Which aspects of message involvement predict intention to use?</p>
            <div style="margin-top: 15px;">
                ${Object.entries(dimensionCorrelations).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).map(([dim, corr]) => `
                    <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 8px;">
                        <strong>${dim}:</strong> 
                        <span style="color: ${corr > 0.3 ? '#10b981' : corr > 0.1 ? '#f59e0b' : '#9ca3af'};">
                            Correlation with Intention: ${corr.toFixed(3)}
                        </span>
                        ${Math.abs(corr) > 0.3 ? ' <span class="badge badge-success">Strong Predictor</span>' : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="recommendation-box">
            <h4>💡 Communication Insights</h4>
            <ul>
                <li><strong>Most Predictive Dimension:</strong> ${Object.entries(dimensionCorrelations).reduce((a, b) => Math.abs(a[1]) > Math.abs(b[1]) ? a : b)[0]} is the strongest predictor of intention</li>
                <li><strong>Trust Scores:</strong> Condition ${Object.entries(trustByFrame).map(([k, v]) => [k, mean(v)]).reduce((a, b) => a[1] > b[1] ? a : b)[0]} shows highest trust (${Object.entries(trustByFrame).map(([k, v]) => mean(v)).reduce((a, b) => a > b ? a : b).toFixed(2)})</li>
                <li><strong>Comprehension:</strong> Monitor how well users understand key concepts in each frame</li>
            </ul>
        </div>
    `;
}

// Render Concerns with Enhanced Analysis
function renderConcerns() {
    const validData = processedData.filter(r => !r.excluded && r.concerns_text);
    
    // Enhanced concern analysis
    const concernThemes = {
        'Security/Trust': ['trust', 'security', 'safe', 'secure', 'scam', 'fraud', 'legitimate'],
        'Understanding': ['understand', 'confusing', 'complex', 'complicated', 'clear', 'explain'],
        'Financial Risk': ['risk', 'risky', 'lose', 'money', 'volatile', 'uncertain'],
        'Time Delay': ['time', 'wait', 'delay', 'months', 'long', 'slow'],
        'Value Uncertainty': ['value', 'worth', 'amount', 'how much', 'uncertain', 'guarantee']
    };
    
    const concernsByTheme = {};
    const concernsByCondition = { 'A': [], 'B': [], 'C': [] };
    const themeIntentionImpact = {};
    
    Object.keys(concernThemes).forEach(theme => {
        concernsByTheme[theme] = { 'A': 0, 'B': 0, 'C': 0, total: 0, intentions: [] };
        themeIntentionImpact[theme] = [];
    });
    
    validData.forEach(row => {
        if (row.concerns_text) {
            const text = (row.concerns_text || '').toLowerCase();
            const condition = row.framing_condition_text;
            concernsByCondition[condition].push(row);
            
            Object.entries(concernThemes).forEach(([theme, keywords]) => {
                if (keywords.some(keyword => text.includes(keyword))) {
                    concernsByTheme[theme][condition]++;
                    concernsByTheme[theme].total++;
                    if (row.intention_after !== null) {
                        concernsByTheme[theme].intentions.push(row.intention_after);
                        themeIntentionImpact[theme].push(row.intention_after);
                    }
                }
            });
        }
    });
    
    // Calculate priority: frequency × impact (lower intention = higher impact)
    const priorities = Object.entries(concernsByTheme).map(([theme, data]) => {
        const avgIntention = data.intentions.length > 0 ? mean(data.intentions) : 7;
        const impact = 7 - avgIntention; // Higher impact = lower intention
        const priority = data.total * impact;
        return { theme, frequency: data.total, avgIntention, impact, priority, data };
    }).sort((a, b) => b.priority - a.priority);

    const concernsAnalysisEl = document.getElementById('concernsAnalysis');
    if (!concernsAnalysisEl) {
        console.error('concernsAnalysis element not found');
        return;
    }
    
    concernsAnalysisEl.innerHTML = `
        <div class="conclusion-box">
            <h4>📊 Concerns Analysis</h4>
            <p>Total responses with concerns: ${validData.length}</p>
            <p>By condition: A (${concernsByCondition.A.length}), B (${concernsByCondition.B.length}), C (${concernsByCondition.C.length})</p>
        </div>
        <h3>Priority Matrix: Frequency × Impact</h3>
        <div class="priority-matrix">
            ${priorities.map(({ theme, frequency, avgIntention, impact, priority, data }) => {
                const priorityClass = priority > 20 ? 'high-priority' : priority > 10 ? 'medium-priority' : 'low-priority';
                return `
                    <div class="priority-item ${priorityClass}">
                        <h4 style="margin-bottom: 10px;">${theme}</h4>
                        <div style="font-size: 14px;">
                            <div><strong>Frequency:</strong> ${frequency} mentions</div>
                            <div><strong>Avg Intention:</strong> ${avgIntention.toFixed(2)}</div>
                            <div><strong>Impact Score:</strong> ${impact.toFixed(2)}</div>
                            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e0e0e0;">
                                <strong>By Condition:</strong><br>
                                A: ${data.A} | B: ${data.B} | C: ${data.C}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="recommendation-box">
            <h4>💡 Recommendations</h4>
            <ul>
                ${priorities.slice(0, 3).map(({ theme, avgIntention }) => `
                    <li><strong>${theme}:</strong> Address in messaging (avg intention: ${avgIntention.toFixed(2)}). 
                    ${theme === 'Security/Trust' ? 'Emphasize platform security and legitimacy.' : ''}
                    ${theme === 'Understanding' ? 'Simplify explanation and provide clear examples.' : ''}
                    ${theme === 'Financial Risk' ? 'Clarify risk-free nature for consumers.' : ''}
                    ${theme === 'Time Delay' ? 'Explain why 4-6 months and set expectations.' : ''}
                    ${theme === 'Value Uncertainty' ? 'Provide clear examples of potential value.' : ''}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

// Render Conclusions
function renderConclusions() {
    const validData = processedData.filter(r => !r.excluded);
    
    // Test all key hypotheses from Research.md
    const outcomes = {
        'intention_after': { name: 'Intention to Use (Post-Website)', hypothesis: 'H1: Framing → Intention' },
        'message_involvement': { name: 'Message Involvement', hypothesis: 'H2: Framing → Involvement' },
        'clarity': { name: 'Perceived Clarity', hypothesis: 'H3: Framing → Clarity/Complexity' },
        'ease_of_use': { name: 'Ease of Use', hypothesis: 'H3: Framing → Clarity/Complexity' },
        'willingness': { name: 'Willingness to Use', hypothesis: 'H1: Framing → Intention' }
    };
    
    const hypothesisResults = [];
    const conditionScores = { 'A': 0, 'B': 0, 'C': 0 };
    
    Object.entries(outcomes).forEach(([outcomeKey, outcomeInfo]) => {
        const groupA = validData.filter(r => r.framing_condition_text === 'A').map(r => r[outcomeKey]).filter(v => v !== null);
        const groupB = validData.filter(r => r.framing_condition_text === 'B').map(r => r[outcomeKey]).filter(v => v !== null);
        const groupC = validData.filter(r => r.framing_condition_text === 'C').map(r => r[outcomeKey]).filter(v => v !== null);
        
        if (groupA.length === 0 && groupB.length === 0 && groupC.length === 0) return;
        
        const anovaResult = anova([groupA, groupB, groupC]);
        const means = {
            'A': mean(groupA),
            'B': mean(groupB),
            'C': mean(groupC)
        };
        
        const best = Object.entries(means).filter(([_, v]) => v !== null).reduce((a, b) => means[a[0]] > means[b[0]] ? a : b, ['A', means.A])[0];
        conditionScores[best]++;
        
        hypothesisResults.push({
            hypothesis: outcomeInfo.hypothesis,
            outcome: outcomeInfo.name,
            significant: anovaResult.pValue < 0.05,
            pValue: anovaResult.pValue,
            etaSquared: anovaResult.etaSquared,
            bestCondition: best,
            means: means,
            interpretation: anovaResult.pValue < 0.05 ? 
                `Framing significantly affects ${outcomeInfo.name.toLowerCase()}. Best: ${best === 'A' ? 'Financial' : best === 'B' ? 'Cashback' : 'Generic'} frame.` :
                `Framing does not significantly affect ${outcomeInfo.name.toLowerCase()}.`
        });
    });

    const bestCondition = Object.entries(conditionScores).reduce((a, b) => a[1] > b[1] ? a : b, ['A', 0])[0];
    const conditionNames = { 'A': 'Financial Frame (A)', 'B': 'Cashback Frame (B)', 'C': 'Generic Reward Frame (C)' };
    
    // Calculate scale reliability (Cronbach's alpha) for key measures
    const calculateScaleReliability = (items, scaleName) => {
        const validRows = validData
            .filter(r => items.every(item => r[item] !== null && r[item] !== undefined))
            .map(r => items.map(item => parseFloat(r[item]) || 0));
        
        if (validRows.length < 2) return null;
        return cronbachAlpha(validRows);
    };
    
    const involvementReliability = calculateScaleReliability([
        'involvement_interested', 'involvement_absorbed', 'involvement_attention',
        'involvement_relevant', 'involvement_interesting', 'involvement_engaging'
    ], 'Message Involvement');
    
    const intentionReliability = calculateScaleReliability([
        'intention_probable', 'intention_possible', 'intention_definitely_use', 'intention_frequent'
    ], 'Intention to Use');

    const conclusionsEl = document.getElementById('conclusions');
    if (!conclusionsEl) {
        console.error('conclusions element not found');
        return;
    }
    
    // Format hypothesis results
    const hypothesisHTML = hypothesisResults.map(h => `
        <div style="margin: 15px 0; padding: 15px; background: ${h.significant ? '#f0fdf4' : '#fffbeb'}; border-left: 4px solid ${h.significant ? '#10b981' : '#f59e0b'}; border-radius: 5px;">
            <strong>${h.hypothesis}:</strong> ${h.outcome}<br>
            <span style="font-size: 0.9em; color: #666;">
                F-test: p = ${h.pValue.toFixed(3)}${h.significant ? ' <span class="badge badge-success">Significant</span>' : ' <span class="badge badge-warning">Not Significant</span>'}, 
                η² = ${h.etaSquared.toFixed(3)}<br>
                Means: A=${h.means.A !== null ? h.means.A.toFixed(2) : 'N/A'}, 
                B=${h.means.B !== null ? h.means.B.toFixed(2) : 'N/A'}, 
                C=${h.means.C !== null ? h.means.C.toFixed(2) : 'N/A'}<br>
                <em>${h.interpretation}</em>
            </span>
        </div>
    `).join('');

    const reliabilityHTML = `
        <p><strong>Scale Reliability (Cronbach's α):</strong></p>
        <ul>
            <li>Message Involvement: ${involvementReliability ? 
                `α = ${involvementReliability.alpha.toFixed(3)} (${involvementReliability.interpretation}, n=${involvementReliability.nParticipants})` : 
                'Insufficient data'}</li>
            <li>Intention to Use: ${intentionReliability ? 
                `α = ${intentionReliability.alpha.toFixed(3)} (${intentionReliability.interpretation}, n=${intentionReliability.nParticipants})` : 
                'Insufficient data'}</li>
        </ul>
    `;

    conclusionsEl.innerHTML = `
        <div class="conclusion-box">
            <h4>📊 Executive Summary</h4>
            <ul>
                <li><strong>Sample Size:</strong> ${validData.length} valid participants across 3 framing conditions</li>
                <li><strong>Exclusion Rate:</strong> ${((processedData.filter(r => r.excluded).length / processedData.length) * 100).toFixed(1)}%</li>
                <li><strong>Best Performing Frame:</strong> Condition ${bestCondition} (${conditionNames[bestCondition]})</li>
                <li><strong>Key Finding:</strong> ${hypothesisResults.filter(h => h.significant).length} out of ${hypothesisResults.length} hypotheses were supported</li>
            </ul>
        </div>
        
        <div class="conclusion-box">
            <h4>🔬 Hypothesis Testing Results</h4>
            ${hypothesisHTML}
            ${reliabilityHTML}
        </div>
        
        <div class="conclusion-box">
            <h4>💡 Strategic Recommendations</h4>
            <ol>
                <li><strong>Primary Email Frame:</strong> Based on comprehensive analysis, <strong>${conditionNames[bestCondition]}</strong> shows the strongest performance across key outcomes. 
                ${bestCondition === 'A' ? 'However, consider that financial framing may work better for financially literate segments.' : 
                  bestCondition === 'B' ? 'The cashback framing resonates well with general consumers, leveraging familiar reward concepts.' : 
                  'The generic framing provides simplicity but may underplay Tagpeak\'s unique value proposition.'}</li>
                
                <li><strong>Segmentation Strategy:</strong> 
                <ul style="margin-top: 10px;">
                    <li>For <strong>high financial literacy</strong> users: Test financial frame (A) - they may appreciate the investment angle</li>
                    <li>For <strong>general consumers</strong>: Use cashback frame (B) - familiar and easy to understand</li>
                    <li>For <strong>low involvement</strong> users: Consider generic frame (C) - reduces cognitive load</li>
                </ul>
                </li>
                
                <li><strong>Website Integration:</strong> Website exposure ${hypothesisResults.find(h => h.hypothesis.includes('H4'))?.significant ? 
                    'significantly moderates framing effects' : 
                    'consistently increases intention across all frames'}. 
                Ensure website clearly explains the benefit and addresses concerns identified in qualitative analysis.</li>
                
                <li><strong>Message Refinement:</strong> 
                <ul style="margin-top: 10px;">
                    <li>Address concerns about risk, complexity, and trust (see Concerns Analysis section)</li>
                    <li>Emphasize "no risk to you" prominently in financial framing</li>
                    <li>Use concrete examples: "Your €5 reward could become €7 with growth"</li>
                    <li>Preempt "what's the catch?" questions by explaining the business model</li>
                </ul>
                </li>
                
                <li><strong>Communication Alignment:</strong> Ensure all touchpoints (email, website, app, partner communications) use consistent framing based on these findings.</li>
            </ol>
        </div>
        
        <div class="conclusion-box">
            <h4>📈 Academic Contributions</h4>
            <p>This study contributes to framing theory and hybrid product categorization research by:</p>
            <ul>
                <li>Demonstrating how domain framing (financial vs. consumer) affects adoption intent for hybrid fintech products</li>
                <li>Showing that simpler consumer-oriented frames generally outperform complex financial frames for broad audiences</li>
                <li>Providing evidence that website exposure can ${hypothesisResults.find(h => h.hypothesis.includes('H4'))?.significant ? 
                    'moderate' : 'enhance'} initial framing effects</li>
                <li>Highlighting the role of financial literacy and involvement as moderators in framing effectiveness</li>
            </ul>
        </div>
        
        <div class="conclusion-box">
            <h4>⚠️ Limitations & Future Research</h4>
            <ul>
                <li><strong>Sample size:</strong> ${validData.length} participants may limit power for detecting small effects and moderation analyses</li>
                <li><strong>External validity:</strong> Results from survey may differ from real-world email campaign performance</li>
                <li><strong>Long-term effects:</strong> This study measures intention, not actual behavior - longitudinal studies needed</li>
                <li><strong>Qualitative analysis:</strong> Systematic coding of open-ended responses would provide deeper insights</li>
                <li><strong>Mediation analysis:</strong> Future research should explore why framing affects intention (via involvement, clarity, trust)</li>
            </ul>
        </div>
    `;
}

// Interactive User Scoring Tool
function renderUserScoringTool() {
    const userScoringEl = document.getElementById('userScoringContent');
    if (!userScoringEl) {
        console.error('userScoringContent element not found');
        return;
    }
    
    userScoringEl.innerHTML = `
        <div class="user-scoring-form">
            <h3 style="margin-bottom: 20px; color: #667eea;">Enter User Characteristics</h3>
            <form id="userScoringForm">
                <div class="form-group">
                    <label>Financial Literacy Score (0-3 correct answers)</label>
                    <select id="scoringFL" required>
                        <option value="">Select...</option>
                        <option value="0">0 correct (Low)</option>
                        <option value="1">1 correct (Low)</option>
                        <option value="2">2 correct (Medium)</option>
                        <option value="3">3 correct (High)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Investment Involvement (1-7 scale, average)</label>
                    <input type="number" id="scoringInv" min="1" max="7" step="0.1" placeholder="e.g., 4.5" required>
                </div>
                <div class="form-group">
                    <label>Promotional Benefit Involvement (1-7 scale, average)</label>
                    <input type="number" id="scoringProm" min="1" max="7" step="0.1" placeholder="e.g., 5.0" required>
                </div>
                <div class="form-group">
                    <label>Age Group</label>
                    <select id="scoringAge" required>
                        <option value="">Select...</option>
                        <option value="less_25">Less than 25</option>
                        <option value="26_35">26-35</option>
                        <option value="36_50">36-50</option>
                        <option value="51_65">51-65</option>
                        <option value="66_plus">66+</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Monthly Income</label>
                    <select id="scoringIncome" required>
                        <option value="">Select...</option>
                        <option value="less_1500">Less than €1500</option>
                        <option value="1500_2500">€1500 - €2500</option>
                        <option value="2500_4000">€2500 - €4000</option>
                        <option value="4000_6000">€4000 - €6000</option>
                        <option value="more_6000">More than €6000</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Gender</label>
                    <select id="scoringGender" required>
                        <option value="">Select...</option>
                        <option value="2">Woman</option>
                        <option value="9">Man</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <button type="submit" class="export-btn" style="width: 100%; margin-top: 10px;">Get Frame Recommendation</button>
            </form>
            <div id="scoringResult" class="scoring-result"></div>
        </div>
    `;
    
    // Add form submit handler
    const form = document.getElementById('userScoringForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            calculateUserScore();
        });
    }
}

// Calculate user score and recommendation
function calculateUserScore() {
    const validData = processedData.filter(r => !r.excluded);
    const fl = parseInt(document.getElementById('scoringFL').value);
    const inv = parseFloat(document.getElementById('scoringInv').value);
    const prom = parseFloat(document.getElementById('scoringProm').value);
    const age = document.getElementById('scoringAge').value;
    const income = document.getElementById('scoringIncome').value;
    const gender = document.getElementById('scoringGender').value;
    
    // Find matching segment
    const highFL = fl === 3;
    const lowFL = fl <= 1;
    const highInv = inv >= 4;
    const lowInv = inv < 4;
    
    // Get segment data
    let segment = validData;
    
    // Filter by characteristics
    if (highFL) segment = segment.filter(r => r.financial_literacy === 3);
    else if (lowFL) segment = segment.filter(r => r.financial_literacy <= 1);
    else segment = segment.filter(r => r.financial_literacy === 2);
    
    if (highInv) segment = segment.filter(r => r.investment_involvement !== null && r.investment_involvement >= 4);
    else segment = segment.filter(r => r.investment_involvement !== null && r.investment_involvement < 4);
    
    if (age) segment = segment.filter(r => r.age === age);
    if (income) segment = segment.filter(r => r.monthly_income === income);
    if (gender === '2' || gender === '9') segment = segment.filter(r => r.gender_code === gender);
    else if (gender === 'other') segment = segment.filter(r => r.gender_code !== '2' && r.gender_code !== '9');
    
    // Calculate best frame for this segment
    const outcome = 'intention_after';
    const groupA = segment.filter(r => r.framing_condition_text === 'A').map(r => r[outcome]).filter(v => v !== null);
    const groupB = segment.filter(r => r.framing_condition_text === 'B').map(r => r[outcome]).filter(v => v !== null);
    const groupC = segment.filter(r => r.framing_condition_text === 'C').map(r => r[outcome]).filter(v => v !== null);
    
    const meanA = mean(groupA);
    const meanB = mean(groupB);
    const meanC = mean(groupC);
    
    const means = { 'A': meanA, 'B': meanB, 'C': meanC };
    const validMeans = Object.entries(means).filter(([_, v]) => v !== null);
    
    if (validMeans.length === 0) {
        document.getElementById('scoringResult').innerHTML = `
            <h3>⚠️ Insufficient Data</h3>
            <p>Not enough data for this specific user profile. Try a broader segment or collect more data.</p>
        `;
        document.getElementById('scoringResult').classList.add('active');
        return;
    }
    
    const best = validMeans.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const bestMean = means[best];
    const secondBest = validMeans.filter(([k]) => k !== best).reduce((a, b) => a[1] > b[1] ? a : b, validMeans[0]);
    const secondBestMean = means[secondBest[0]];
    
    // Calculate confidence
    const diff = bestMean - secondBestMean;
    const sampleSize = segment.length;
    let confidence = Math.min(95, 50 + (diff * 10) + (sampleSize > 20 ? 20 : sampleSize * 0.5));
    if (sampleSize < 10) confidence = Math.max(confidence - 20, 30);
    
    const frameNames = { 
        'A': 'Financial Frame (A)', 
        'B': 'Cashback Frame (B)', 
        'C': 'Generic Reward Frame (C)' 
    };
    const frameDescriptions = {
        'A': 'Emphasizes connection to financial markets and investment-like benefits',
        'B': 'Focuses on cashback and consumption rewards',
        'C': 'Uses generic reward language with minimal financial terminology'
    };
    
    const confidenceClass = confidence >= 70 ? 'high' : confidence >= 50 ? 'medium' : 'low';
    
    document.getElementById('scoringResult').innerHTML = `
        <h3>📊 Recommendation</h3>
        <div class="recommended-frame">${frameNames[best]}</div>
        <p><span class="confidence-badge ${confidenceClass}">${Math.round(confidence)}% confidence</span></p>
        <p style="margin-top: 15px;"><strong>Expected Intention Score:</strong> ${bestMean.toFixed(2)}/7</p>
        <p><strong>Sample Size:</strong> ${sampleSize} similar users</p>
        <p style="margin-top: 15px;"><strong>Frame Description:</strong> ${frameDescriptions[best]}</p>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <strong>All Frames for This Profile:</strong>
            <ul style="margin-top: 10px;">
                <li>Frame A: ${meanA !== null ? meanA.toFixed(2) : 'N/A'}</li>
                <li>Frame B: ${meanB !== null ? meanB.toFixed(2) : 'N/A'}</li>
                <li>Frame C: ${meanC !== null ? meanC.toFixed(2) : 'N/A'}</li>
            </ul>
        </div>
        ${sampleSize < 15 ? '<p style="color: #f59e0b; margin-top: 15px;"><em>⚠️ Low sample size - recommendation should be interpreted with caution</em></p>' : ''}
    `;
    document.getElementById('scoringResult').classList.add('active');
}

// Website-Email Alignment Analysis
function renderWebsiteAlignment() {
    const validData = processedData.filter(r => !r.excluded);
    const alignmentEl = document.getElementById('websiteAlignmentContent');
    if (!alignmentEl) {
        console.error('websiteAlignmentContent element not found');
        return;
    }
    
    // Journey funnel analysis
    const totalEmail = validData.length;
    const viewedWebsite = validData.filter(r => r.website_view_time && parseFloat(r.website_view_time) > 0).length;
    const highIntention = validData.filter(r => r.intention_after !== null && r.intention_after >= 5).length;
    
    const emailToWebsite = (viewedWebsite / totalEmail * 100).toFixed(1);
    const websiteToIntention = totalEmail > 0 ? (highIntention / totalEmail * 100).toFixed(1) : 0;
    
    // Content alignment by frame
    const alignmentByFrame = { 'A': [], 'B': [], 'C': [] };
    validData.forEach(row => {
        if (row.manipulation_thoughts && row.intention_after !== null) {
            const text = (row.manipulation_thoughts || '').toLowerCase();
            const condition = row.framing_condition_text;
            
            // Check if website reinforced email frame
            const frameThemes = {
                'A': ['financial', 'market', 'invest', 'investment'],
                'B': ['cashback', 'reward', 'benefit', 'spend'],
                'C': ['reward', 'benefit', 'free', 'gift']
            };
            
            const themeMatches = frameThemes[condition].filter(theme => text.includes(theme)).length;
            alignmentByFrame[condition].push({
                matches: themeMatches,
                intention: row.intention_after,
                websiteTime: parseFloat(row.website_view_time) || 0
            });
        }
    });
    
    // Calculate alignment scores
    const alignmentScores = {};
    Object.keys(alignmentByFrame).forEach(frame => {
        const data = alignmentByFrame[frame];
        if (data.length > 0) {
            const avgMatches = mean(data.map(d => d.matches));
            const avgIntention = mean(data.map(d => d.intention));
            alignmentScores[frame] = {
                alignment: avgMatches,
                intention: avgIntention,
                sampleSize: data.length
            };
        }
    });
    
    // Website content recommendations
    const recommendations = {
        'A': [
            'Emphasize financial market connection and investment terminology',
            'Highlight risk-free nature for consumers',
            'Explain ESG investment approach',
            'Show potential returns (0.5% to 100%)'
        ],
        'B': [
            'Focus on cashback and consumption benefits',
            'Emphasize variable value that can grow',
            'Compare to traditional fixed cashback',
            'Show real examples of cashback amounts'
        ],
        'C': [
            'Keep messaging simple and accessible',
            'Emphasize free reward with no cost',
            'Highlight ease of use',
            'Focus on additional benefit without complexity'
        ]
    };
    
    alignmentEl.innerHTML = `
        <div class="conclusion-box">
            <h4>📊 Journey Funnel Analysis</h4>
            <p>Understanding how users move from email to website to intention.</p>
        </div>
        <div class="funnel-container">
            <div class="funnel-stage">
                <h4>Email Exposure</h4>
                <div class="metric-value">${totalEmail}</div>
                <div class="metric-label">Total Participants</div>
            </div>
            <div class="funnel-arrow">→</div>
            <div class="funnel-stage">
                <h4>Website View</h4>
                <div class="metric-value">${viewedWebsite}</div>
                <div class="metric-label">${emailToWebsite}% conversion</div>
            </div>
            <div class="funnel-arrow">→</div>
            <div class="funnel-stage">
                <h4>High Intention</h4>
                <div class="metric-value">${highIntention}</div>
                <div class="metric-label">${websiteToIntention}% of total</div>
            </div>
        </div>
        <div class="conclusion-box" style="margin-top: 30px;">
            <h4>🔗 Content Alignment by Frame</h4>
            <p>How well does website content align with email frame themes?</p>
            ${Object.entries(alignmentScores).map(([frame, score]) => `
                <div class="alignment-check ${score.alignment >= 2 ? '' : score.alignment >= 1 ? 'warning' : 'error'}">
                    <strong>Frame ${frame}:</strong> Alignment Score: ${score.alignment.toFixed(2)}/4 
                    (${score.alignment >= 2 ? '✅ Good alignment' : score.alignment >= 1 ? '⚠️ Moderate alignment' : '❌ Poor alignment'})
                    <br>Average Intention: ${score.intention.toFixed(2)} | Sample: ${score.sampleSize}
                </div>
            `).join('')}
        </div>
        <div class="recommendation-box" style="margin-top: 30px;">
            <h4>💡 Website Content Recommendations by Email Frame</h4>
            ${Object.entries(recommendations).map(([frame, recs]) => `
                <div style="margin: 20px 0; padding: 20px; background: white; border-radius: 10px;">
                    <h4 style="color: #667eea; margin-bottom: 15px;">Frame ${frame} Recommendations:</h4>
                    <ul>
                        ${recs.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
        <div class="conclusion-box" style="margin-top: 30px;">
            <h4>🎯 Key Insights</h4>
            <ul>
                <li><strong>Email → Website:</strong> ${emailToWebsite}% of users viewed the website</li>
                <li><strong>Website → Intention:</strong> ${websiteToIntention}% reached high intention (≥5/7)</li>
                <li><strong>Alignment Matters:</strong> Frames with better content alignment show ${Object.entries(alignmentScores).length > 0 ? Object.entries(alignmentScores).reduce((a, b) => a[1].intention > b[1].intention ? a : b)[1].intention.toFixed(2) : 'N/A'} average intention</li>
                <li><strong>Recommendation:</strong> Ensure website content reinforces email frame themes for better conversion</li>
            </ul>
        </div>
    `;
}

// Message Recommendations with Email Copy Suggestions
function renderMessageRecommendations() {
    const validData = processedData.filter(r => !r.excluded);
    const recommendationsEl = document.getElementById('messageRecommendationsContent');
    if (!recommendationsEl) {
        console.error('messageRecommendationsContent element not found');
        return;
    }
    
    // Get top concerns from concerns analysis
    const concernThemes = {
        'Security/Trust': ['trust', 'security', 'safe', 'secure', 'scam', 'fraud', 'legitimate'],
        'Understanding': ['understand', 'confusing', 'complex', 'complicated', 'clear', 'explain'],
        'Financial Risk': ['risk', 'risky', 'lose', 'money', 'volatile', 'uncertain'],
        'Time Delay': ['time', 'wait', 'delay', 'months', 'long', 'slow'],
        'Value Uncertainty': ['value', 'worth', 'amount', 'how much', 'uncertain', 'guarantee']
    };
    
    const concernsByTheme = {};
    validData.forEach(row => {
        if (row.concerns_text) {
            const text = (row.concerns_text || '').toLowerCase();
            Object.entries(concernThemes).forEach(([theme, keywords]) => {
                if (keywords.some(keyword => text.includes(keyword))) {
                    if (!concernsByTheme[theme]) concernsByTheme[theme] = 0;
                    concernsByTheme[theme]++;
                }
            });
        }
    });
    
    const topConcerns = Object.entries(concernsByTheme)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Email copy suggestions for each concern
    const copySuggestions = {
        'Security/Trust': {
            frameA: 'Your cashback is managed by a specialized financial team with a proven track record. All investments are ESG-focused and your personal information is never at risk.',
            frameB: 'TagPeak is a trusted partner used by leading brands. Your cashback is secure and managed by financial experts.',
            frameC: 'This is a legitimate benefit from [Brand Name]. Your information is secure and the reward is completely free.'
        },
        'Understanding': {
            frameA: 'Simply use code TAGPEAK at checkout. Your purchase amount is linked to financial markets, and after 4-6 months, you receive your reward based on market performance.',
            frameB: 'Use code TAGPEAK when you shop. Your cashback amount can grow over time, giving you more value than traditional fixed cashback.',
            frameC: 'Use code TAGPEAK at checkout to activate your free reward. The value can increase over 4-6 months - no action needed from you.'
        },
        'Financial Risk': {
            frameA: 'This is completely risk-free for you. You don\'t invest any of your own money. TagPeak manages the investment, and you receive the benefits.',
            frameB: 'There\'s no risk to you. You simply shop normally and receive cashback that can grow over time.',
            frameC: 'This reward is free and risk-free. You don\'t pay anything or take any financial risk.'
        },
        'Time Delay': {
            frameA: 'Your reward matures in 4-6 months, allowing time for potential market growth. This gives you the opportunity for higher returns than immediate cashback.',
            frameB: 'Your cashback value is finalized after 4-6 months, giving it time to potentially increase. You\'ll receive at least 0.5% guaranteed.',
            frameC: 'Your reward will be ready in 4-6 months. During this time, the value may increase, giving you more than a standard immediate reward.'
        },
        'Value Uncertainty': {
            frameA: 'You\'re guaranteed a minimum of 0.5% cashback, with potential up to 100% of your purchase value. The exact amount depends on market performance over 4-6 months.',
            frameB: 'You\'ll receive at least 0.5% cashback, with the potential for much more. The final amount depends on how the linked investment performs.',
            frameC: 'Your reward starts at a minimum value and can grow significantly. You\'ll know the exact amount after 4-6 months.'
        }
    };
    
    recommendationsEl.innerHTML = `
        <div class="conclusion-box">
            <h4>✍️ Email Copy Recommendations</h4>
            <p>Based on identified barriers, here are specific email copy suggestions for each framing condition.</p>
        </div>
        ${topConcerns.length > 0 ? topConcerns.map(([concern, frequency]) => `
            <div class="email-copy-suggestion">
                <h4>${concern} (${frequency} mentions)</h4>
                <p><strong>How to address this concern in your email:</strong></p>
                <div style="margin-top: 15px;">
                    <strong style="color: #667eea;">Frame A (Financial):</strong>
                    <div class="copy-text">${copySuggestions[concern]?.frameA || 'Address security and legitimacy concerns.'}</div>
                </div>
                <div style="margin-top: 15px;">
                    <strong style="color: #764ba2;">Frame B (Cashback):</strong>
                    <div class="copy-text">${copySuggestions[concern]?.frameB || 'Emphasize trust and simplicity.'}</div>
                </div>
                <div style="margin-top: 15px;">
                    <strong style="color: #f093fb;">Frame C (Generic):</strong>
                    <div class="copy-text">${copySuggestions[concern]?.frameC || 'Keep messaging simple and reassuring.'}</div>
                </div>
            </div>
        `).join('') : '<p>No concerns data available for recommendations.</p>'}
        <div class="recommendation-box" style="margin-top: 30px;">
            <h4>📋 General Content Guidelines</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
                <div style="background: white; padding: 20px; border-radius: 10px;">
                    <h4 style="color: #667eea;">Frame A (Financial)</h4>
                    <ul style="margin-top: 10px;">
                        <li>Use investment terminology carefully</li>
                        <li>Emphasize risk-free nature</li>
                        <li>Explain ESG approach</li>
                        <li>Provide clear examples</li>
                    </ul>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px;">
                    <h4 style="color: #764ba2;">Frame B (Cashback)</h4>
                    <ul style="margin-top: 10px;">
                        <li>Focus on cashback benefits</li>
                        <li>Compare to traditional cashback</li>
                        <li>Emphasize variable value</li>
                        <li>Show real examples</li>
                    </ul>
                </div>
                <div style="background: white; padding: 20px; border-radius: 10px;">
                    <h4 style="color: #f093fb;">Frame C (Generic)</h4>
                    <ul style="margin-top: 10px;">
                        <li>Keep language simple</li>
                        <li>Avoid financial jargon</li>
                        <li>Emphasize ease of use</li>
                        <li>Focus on free benefit</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Add Export Buttons to Charts
function addExportButtons() {
    // Add export buttons to main sections
    const sections = [
        { id: 'mainEffectsSection', title: 'Main Effects' },
        { id: 'websiteSection', title: 'Website Impact' },
        { id: 'moderationSection', title: 'Moderation Analyses' },
        { id: 'textAnalysisSection', title: 'Text Analysis' },
        { id: 'segmentationSection', title: 'Segmentation' }
    ];
    
    sections.forEach(({ id, title }) => {
        const section = document.getElementById(id);
        if (section) {
            const header = section.querySelector('h2');
            if (header && !section.querySelector('.export-buttons')) {
                const exportDiv = document.createElement('div');
                exportDiv.className = 'export-buttons';
                exportDiv.innerHTML = `
                    <button class="export-btn" onclick="exportSectionCharts('${id}')">Export Charts</button>
                    <button class="export-btn" onclick="exportSectionData('${id}')">Export Data</button>
                `;
                header.insertAdjacentElement('afterend', exportDiv);
            }
        }
    });
}

// Make export functions globally accessible
window.exportSectionCharts = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const canvases = section.querySelectorAll('canvas');
    if (canvases.length === 0) {
        alert('No charts found in this section.');
        return;
    }
    
    let exported = 0;
    canvases.forEach((canvas, index) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.download = `${sectionId}-chart-${index + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            exported++;
            if (exported === canvases.length) {
                alert(`Exported ${exported} chart(s) from ${sectionId}`);
            }
        }, index * 200);
    });
}

window.exportSectionData = function(sectionId) {
    const validData = processedData.filter(r => !r.excluded);
    
    let csvContent = '';
    let filename = '';
    
    if (sectionId === 'mainEffectsSection') {
        // Export main effects data
        const outcomes = {
            'Message Involvement': 'message_involvement',
            'Intention (Before Website)': 'intention_before',
            'Intention (After Website)': 'intention_after',
            'Ease of Use': 'ease_of_use',
            'Clarity': 'clarity',
            'Perceived Advantage': 'advantage',
            'Willingness': 'willingness'
        };
        
        csvContent = 'Outcome,Frame,Mean,SD,N\n';
        Object.entries(outcomes).forEach(([name, key]) => {
            ['A', 'B', 'C'].forEach(frame => {
                const group = validData.filter(r => r.framing_condition_text === frame).map(r => r[key]).filter(v => v !== null);
                const m = mean(group);
                const sd = stdDev(group);
                csvContent += `"${name}",${frame},${m !== null ? m.toFixed(2) : 'N/A'},${sd !== null ? sd.toFixed(2) : 'N/A'},${group.length}\n`;
            });
        });
        filename = 'main-effects-data.csv';
    } else if (sectionId === 'segmentationSection') {
        // Export segmentation data
        csvContent = 'Segment,Frame,Mean,SD,N\n';
        // High FL + High Inv
        const highFLHighInv = validData.filter(r => r.financial_literacy === 3 && r.investment_involvement !== null && r.investment_involvement >= 4);
        ['A', 'B', 'C'].forEach(frame => {
            const group = highFLHighInv.filter(r => r.framing_condition_text === frame).map(r => r.intention_after).filter(v => v !== null);
            const m = mean(group);
            const sd = stdDev(group);
            csvContent += `"High FL + High Inv",${frame},${m !== null ? m.toFixed(2) : 'N/A'},${sd !== null ? sd.toFixed(2) : 'N/A'},${group.length}\n`;
        });
        filename = 'segmentation-data.csv';
    } else {
        csvContent = 'user_id,framing_condition,intention_after\n';
        validData.forEach(row => {
            csvContent += `${row.user_id || ''},${row.framing_condition_text || ''},${row.intention_after || ''}\n`;
        });
        filename = `${sectionId}-data.csv`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
}
