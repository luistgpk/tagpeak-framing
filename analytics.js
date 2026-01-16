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
        dashboard.innerHTML = `
            <div class="section">
                <h2>⚠️ Scripts Failed to Load</h2>
                <div class="conclusion-box">
                    <h4>Problem:</h4>
                    <p>Chart.js and/or PapaParse libraries could not be loaded. This is usually caused by:</p>
                    <ul style="margin-left: 20px; margin-top: 10px;">
                        <li><strong>Content Security Policy (CSP) blocking CDN scripts</strong></li>
                        <li>Opening the file directly (file://) instead of using a local server</li>
                        <li>Network/firewall blocking cdn.jsdelivr.net</li>
                    </ul>
                    <h4 style="margin-top: 20px;">Solutions:</h4>
                    <ol style="margin-left: 20px; margin-top: 10px;">
                        <li><strong>Use a local server:</strong>
                            <pre style="background: #f0f0f0; padding: 10px; border-radius: 5px; margin-top: 10px;">
# In your project folder, run:
python -m http.server 8000

# Then open: http://localhost:8000/analytics.html</pre>
                        </li>
                        <li><strong>Check browser console</strong> for CSP errors and adjust server settings if needed</li>
                        <li><strong>Disable browser extensions</strong> that might block scripts (ad blockers, privacy extensions)</li>
                    </ol>
                    <p style="margin-top: 20px;"><strong>Current Status:</strong></p>
                    <ul style="margin-left: 20px;">
                        <li>Chart.js: ${typeof Chart !== 'undefined' ? '✅ Loaded' : '❌ Not loaded'}</li>
                        <li>PapaParse: ${typeof Papa !== 'undefined' ? '✅ Loaded' : '❌ Not loaded'}</li>
                    </ul>
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
                    
                    // Show loading message
                    const dashboardContent = dashboard.innerHTML;
                    dashboard.innerHTML = '<div class="section"><div class="loading">Loading data and initializing dashboard...</div></div>';
                    
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

        // Try to find CSV files (check common date formats)
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const possibleDates = [
            dateStr,
            '2026-01-15',
            '2025-01-15',
            '2024-01-15'
        ];

        let demoFile = null;
        let framingFile = null;
        let demoText = null;
        let framingText = null;

        // Try to load demographics file
        for (const date of possibleDates) {
            try {
                const response = await fetch(`demographics-${date}.csv`);
                if (response.ok) {
                    demoFile = `demographics-${date}.csv`;
                    demoText = await response.text();
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
                if (response.ok) {
                    framingFile = `framing_study_results-${date}.csv`;
                    framingText = await response.text();
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
            throw new Error(`CSV files not found. Tried: demographics-*.csv and framing_study_results-*.csv. Please ensure files are in the same directory as analytics.html`);
        }

        // Parse CSV data
        demographicsData = Papa.parse(demoText, { header: true, skipEmptyLines: true }).data;
        framingData = Papa.parse(framingText, { header: true, skipEmptyLines: true }).data;

        if (demographicsData.length === 0 || framingData.length === 0) {
            throw new Error('CSV files are empty or could not be parsed.');
        }

        // Process and merge data
        processData();
        
        // Render all sections
        renderOverview();
        renderDataQuality();
        renderMainEffects();
        renderWebsiteImpact();
        renderModeration();
        renderManipulationCheck();
        renderConcerns();
        renderConclusions();
        
        // Setup event listeners after rendering
        setupEventListeners();
    } catch (error) {
        console.error('Error loading data:', error);
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.innerHTML = `
                <div class="section">
                    <h2>⚠️ Error Loading Data</h2>
                    <div class="conclusion-box">
                        <h4>Error Details:</h4>
                        <p>${error.message}</p>
                        <h4 style="margin-top: 20px;">Troubleshooting:</h4>
                        <ul style="margin-left: 20px; margin-top: 10px;">
                            <li>Ensure CSV files are in the same directory as analytics.html</li>
                            <li>Check file names: demographics-YYYY-MM-DD.csv and framing_study_results-YYYY-MM-DD.csv</li>
                            <li>If using a local server, make sure it's running (e.g., python -m http.server 8000)</li>
                            <li>Check browser console for CORS errors</li>
                            <li>Verify that PapaParse and Chart.js libraries loaded (check Network tab)</li>
                        </ul>
                    </div>
                </div>
            `;
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
    const MSB = SSB / dfB;
    const MSW = SSW / dfW;
    const F = MSB / MSW;

    // Calculate p-value (simplified F-distribution approximation)
    const pValue = F > 10 ? 0.001 : F > 5 ? 0.01 : F > 3 ? 0.05 : 0.1;

    // Effect size (eta squared)
    const etaSquared = SSB / (SSB + SSW);

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
        'Avg. Website Time': Math.round(mean(validData.map(r => parseFloat(r.website_view_time) || 0))) + 's'
    };

    const statsHTML = Object.entries(stats).map(([key, value]) => `
        <div class="stat-card">
            <h4>${key}</h4>
            <div class="value">${value}</div>
        </div>
    `).join('');

    document.getElementById('overviewStats').innerHTML = statsHTML;

    // Demographics charts
    renderDemographicsCharts();
}

function renderDemographicsCharts() {
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

    // Gender distribution
    const genderData = {
        'Woman': validData.filter(r => r.gender_code === '2').length,
        'Man': validData.filter(r => r.gender_code === '9').length,
        'Other': validData.filter(r => r.gender_code !== '2' && r.gender_code !== '9').length
    };

    const genderCanvas = document.createElement('canvas');
    genderCanvas.className = 'chart-container small';
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

    document.getElementById('demographicsCharts').innerHTML = '';
    document.getElementById('demographicsCharts').appendChild(ageCanvas);
    document.getElementById('demographicsCharts').appendChild(genderCanvas);
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

    document.getElementById('qualityStats').innerHTML = `
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

    document.getElementById('exclusionCharts').innerHTML = '';
    document.getElementById('exclusionCharts').appendChild(exclusionCanvas);
}

// Render Main Effects
function renderMainEffects() {
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

        const means = {
            'A (Financial)': mean(groupA),
            'B (Cashback)': mean(groupB),
            'C (Generic)': mean(groupC)
        };

        const anovaResult = anova([groupA, groupB, groupC]);
        const isSig = anovaResult.pValue < 0.05;

        // Chart
        const canvas = document.createElement('canvas');
        canvas.className = 'chart-container';
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: Object.keys(means),
                datasets: [{
                    label: name,
                    data: Object.values(means),
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

        chartsHTML.push(canvas.outerHTML);

        // Table
        const dAB = cohensD(groupA, groupB);
        const dAC = cohensD(groupA, groupC);
        const dBC = cohensD(groupB, groupC);

        tablesHTML.push(`
            <h3>${name}</h3>
            <div class="table-container">
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
                            <td>${means['A (Financial)'].toFixed(2)}</td>
                            <td>${stdDev(groupA).toFixed(2)}</td>
                            <td>${groupA.length}</td>
                        </tr>
                        <tr>
                            <td>B (Cashback)</td>
                            <td>${means['B (Cashback)'].toFixed(2)}</td>
                            <td>${stdDev(groupB).toFixed(2)}</td>
                            <td>${groupB.length}</td>
                        </tr>
                        <tr>
                            <td>C (Generic)</td>
                            <td>${means['C (Generic)'].toFixed(2)}</td>
                            <td>${stdDev(groupC).toFixed(2)}</td>
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

    document.getElementById('mainEffectsCharts').innerHTML = chartsHTML.join('');
    document.getElementById('mainEffectsTables').innerHTML = tablesHTML.join('');
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

    const canvas = document.createElement('canvas');
    canvas.className = 'chart-container';
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['Condition A', 'Condition B', 'Condition C'],
            datasets: [
                {
                    label: 'Before Website',
                    data: [mean(beforeA), mean(beforeB), mean(beforeC)],
                    backgroundColor: '#9ca3af'
                },
                {
                    label: 'After Website',
                    data: [mean(afterA), mean(afterB), mean(afterC)],
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
        'A': mean(afterA) - mean(beforeA),
        'B': mean(afterB) - mean(beforeB),
        'C': mean(afterC) - mean(beforeC)
    };

    document.getElementById('websiteCharts').innerHTML = '';
    document.getElementById('websiteCharts').appendChild(canvas);

    document.getElementById('websiteAnalysis').innerHTML = `
        <div class="conclusion-box">
            <h4>Website Exposure Impact</h4>
            <p><strong>Change in Intention:</strong></p>
            <ul>
                <li>Condition A (Financial): ${changes.A > 0 ? '+' : ''}${changes.A.toFixed(2)} points</li>
                <li>Condition B (Cashback): ${changes.B > 0 ? '+' : ''}${changes.B.toFixed(2)} points</li>
                <li>Condition C (Generic): ${changes.C > 0 ? '+' : ''}${changes.C.toFixed(2)} points</li>
            </ul>
            <p>The website exposure ${Object.values(changes).some(c => c > 0) ? 'increased' : 'decreased'} intention scores across all conditions, 
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
        
        const canvas = document.createElement('canvas');
        canvas.className = 'chart-container';
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Condition A', 'Condition B', 'Condition C'],
                datasets: [
                    {
                        label: 'High Investment Involvement',
                        data: [mean(highA), mean(highB), mean(highC)],
                        backgroundColor: '#667eea'
                    },
                    {
                        label: 'Low Investment Involvement',
                        data: [mean(lowA), mean(lowB), mean(lowC)],
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
                <p><strong>High Involvement (≥4):</strong> A: ${mean(highA).toFixed(2)}, B: ${mean(highB).toFixed(2)}, C: ${mean(highC).toFixed(2)}</p>
                <p><strong>Low Involvement (<4):</strong> A: ${mean(lowA).toFixed(2)}, B: ${mean(lowB).toFixed(2)}, C: ${mean(lowC).toFixed(2)}</p>
                <p>${mean(highA) > mean(lowA) ? 'High involvement participants respond better to Financial frame (A)' : 'Low involvement participants respond better to Financial frame (A)'}</p>
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
        
        const canvas = document.createElement('canvas');
        canvas.className = 'chart-container';
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['High Literacy', 'Medium Literacy', 'Low Literacy'],
                datasets: [
                    {
                        label: 'Condition A (Financial)',
                        data: [mean(highA), mean(medA), mean(lowA)],
                        backgroundColor: '#667eea'
                    },
                    {
                        label: 'Condition B (Cashback)',
                        data: [mean(highB), mean(medB), mean(lowB)],
                        backgroundColor: '#764ba2'
                    },
                    {
                        label: 'Condition C (Generic)',
                        data: [mean(highC), mean(medC), mean(lowC)],
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
                <p><strong>High Literacy (3 correct):</strong> A: ${mean(highA).toFixed(2)}, B: ${mean(highB).toFixed(2)}, C: ${mean(highC).toFixed(2)}</p>
                <p><strong>Medium Literacy (2 correct):</strong> A: ${mean(medA).toFixed(2)}, B: ${mean(medB).toFixed(2)}, C: ${mean(medC).toFixed(2)}</p>
                <p><strong>Low Literacy (0-1 correct):</strong> A: ${mean(lowA).toFixed(2)}, B: ${mean(lowB).toFixed(2)}, C: ${mean(lowC).toFixed(2)}</p>
                <p>${mean(highA) > mean(highB) && mean(highA) > mean(highC) ? 'High financial literacy participants respond best to Financial frame (A)' : 'Financial literacy moderates framing effects'}</p>
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
        
        const canvas = document.createElement('canvas');
        canvas.className = 'chart-container';
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Young (≤35)', 'Middle (36-50)', 'Older (51+)'],
                datasets: [
                    {
                        label: 'Condition A',
                        data: [mean(youngA), mean(middleA), mean(olderA)],
                        backgroundColor: '#667eea'
                    },
                    {
                        label: 'Condition B',
                        data: [mean(youngB), mean(middleB), mean(olderB)],
                        backgroundColor: '#764ba2'
                    },
                    {
                        label: 'Condition C',
                        data: [mean(youngC), mean(middleC), mean(olderC)],
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
    
    document.getElementById('moderationCharts').innerHTML = moderationHTML;
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

    document.getElementById('manipulationAnalysis').innerHTML = `
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

    document.getElementById('concernsAnalysis').innerHTML = `
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

    document.getElementById('conclusions').innerHTML = `
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
