// Vercel cron endpoint to trigger daily report
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow GET requests (Vercel cron uses GET)
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const analystEmail = process.env.ANALYST_EMAIL;
    const fromEmail = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
    
    // Support multiple recipients (comma-separated)
    const recipientEmails = analystEmail.split(',').map(email => email.trim()).filter(email => email);
    
    if (!supabaseUrl || !serviceKey) {
      return res.status(500).json({ 
        error: 'Missing Supabase configuration' 
      });
    }

    if (!resendApiKey || recipientEmails.length === 0) {
      return res.status(500).json({ 
        error: 'Missing email configuration (RESEND_API_KEY, ANALYST_EMAIL)' 
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get today's date for filename
    const today = new Date().toISOString().split('T')[0];
    
    // Query ALL framing study results (full database)
    const { data: framingData, error: framingError } = await supabase
      .from('framing_study_results')
      .select('*')
      .order('created_at', { ascending: true });

    if (framingError) {
      throw new Error(`Error fetching framing study data: ${framingError.message}`);
    }

    // Query ALL demographics data (full database)
    const { data: demographicsData, error: demographicsError } = await supabase
      .from('demographics')
      .select('*')
      .order('created_at', { ascending: true });

    if (demographicsError) {
      throw new Error(`Error fetching demographics data: ${demographicsError.message}`);
    }

    // If no data at all, send a notification
    if (framingData.length === 0 && demographicsData.length === 0) {
      await sendEmail(resendApiKey, fromEmail, recipientEmails, today, 0, 0, null);
      
      return res.status(200).json({
        success: true,
        message: 'No data in database, notification sent'
      });
    }

    // Create SPSS-friendly CSV buffers (multiple attachments)
    const csvAttachments = createSpssFriendlyCsvs(framingData, demographicsData, today);
    
    // Send email with CSV attachments
    await sendEmail(resendApiKey, fromEmail, recipientEmails, today, framingData.length, demographicsData.length, csvAttachments);

    return res.status(200).json({
      success: true,
      message: `Full database report sent successfully. ${framingData.length} framing study results and ${demographicsData.length} demographic records included.`
    });

  } catch (error) {
    console.error('Error in cron-daily-report:', error);
    return res.status(500).json({ 
      error: error.message 
    });
  }
}

// === SPSS-FRIENDLY EXPORT HELPERS ===

function toNumber(value) {
  if (value === null || value === undefined || value === '') return '';
  const cleaned = String(value).replace(/[€,$\s]/g, '').replace(',', '.');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : '';
}

function codeYesNo(value) {
  if (value === undefined || value === null || value === '') return '';
  const v = String(value).toLowerCase();
  if (['sim','yes','y','true','1'].includes(v)) return 1;
  if (['não','nao','no','n','false','0'].includes(v)) return 0;
  return '';
}

function codeGender(value) {
  const v = String(value || '').toLowerCase();
  if (v.startsWith('f')) return 1; // Female
  if (v.startsWith('m')) return 2; // Male
  if (v.startsWith('o')) return 3; // Other
  return 9; // Prefer not to say / unknown
}

function codeFramingCondition(value) {
  const v = String(value || '').toLowerCase();
  if (v === 'a') return 1;
  if (v === 'b') return 2;
  if (v === 'c') return 3;
  return '';
}

function codeShoppingPreference(value) {
  const v = String(value || '').toLowerCase();
  if (v.includes('online')) return 1;
  if (v.includes('presencial') || v.includes('person') || v.includes('store')) return 2;
  return '';
}

function createSpssFriendlyCsvs(framingData, demographicsData, today) {
  // Framing study results - one row per participant
  const framingRows = framingData.map(row => ({
    user_id: row.user_id || '',
    timestamp: row.timestamp || '',
    framing_condition_text: row.framing_condition || '',
    framing_condition_code: codeFramingCondition(row.framing_condition),
    exclusion_partner_name: row.exclusion_partner_name || '',
    exclusion_additional_cost: row.exclusion_additional_cost || '',
    manipulation_thoughts: row.manipulation_thoughts || '',
    investment_involvement_important: toNumber(row.investment_involvement_important),
    investment_involvement_relevant: toNumber(row.investment_involvement_relevant),
    investment_involvement_meaningful: toNumber(row.investment_involvement_meaningful),
    investment_involvement_valuable: toNumber(row.investment_involvement_valuable),
    involvement_interested: toNumber(row.involvement_interested),
    involvement_absorbed: toNumber(row.involvement_absorbed),
    involvement_attention: toNumber(row.involvement_attention),
    involvement_relevant: toNumber(row.involvement_relevant),
    involvement_interesting: toNumber(row.involvement_interesting),
    involvement_engaging: toNumber(row.involvement_engaging),
    intention_probable: toNumber(row.intention_probable),
    intention_possible: toNumber(row.intention_possible),
    intention_definitely_use: toNumber(row.intention_definitely_use),
    intention_frequent: toNumber(row.intention_frequent),
    ease_difficult: toNumber(row.ease_difficult),
    ease_easy: toNumber(row.ease_easy),
    clarity_steps_clear: toNumber(row.clarity_steps_clear),
    clarity_feel_secure: toNumber(row.clarity_feel_secure),
    advantage_more_advantageous: toNumber(row.advantage_more_advantageous),
    advantage_better_position: toNumber(row.advantage_better_position),
    willingness_interest: toNumber(row.willingness_interest),
    willingness_likely_use: toNumber(row.willingness_likely_use),
    willingness_intend_future: toNumber(row.willingness_intend_future),
    intention_after_website_probable: toNumber(row.intention_after_website_probable),
    intention_after_website_possible: toNumber(row.intention_after_website_possible),
    intention_after_website_definitely_use: toNumber(row.intention_after_website_definitely_use),
    intention_after_website_frequent: toNumber(row.intention_after_website_frequent),
    website_view_time: toNumber(row.website_view_time),
    concerns_text: (row.concerns_text || '').replace(/\r?\n/g, ' '),
    user_feedback: (row.user_feedback || '').replace(/\r?\n/g, ' '),
    created_at: row.created_at || ''
  }));

  // Demographics - one row per participant
  const demographicsRows = demographicsData.map(d => ({
    user_id: d.user_id || '',
    timestamp: d.timestamp || '',
    age: d.age || '',
    gender_text: d.gender || '',
    gender_code: codeGender(d.gender),
    monthly_income: d.monthly_income || '',
    shopping_preference_text: d.shopping_preference || '',
    shopping_preference_code: codeShoppingPreference(d.shopping_preference),
    first_name: d.first_name || '',
    prolific_id: d.prolific_id || '',
    selected_brand: d.selected_brand || '',
    financial_literacy_q1: d.financial_literacy_q1 || '',
    financial_literacy_q2: d.financial_literacy_q2 || '',
    financial_literacy_q3: d.financial_literacy_q3 || '',
    initial_involvement_important: toNumber(d.initial_involvement_important),
    initial_involvement_relevant: toNumber(d.initial_involvement_relevant),
    initial_involvement_meaningful: toNumber(d.initial_involvement_meaningful),
    initial_involvement_valuable: toNumber(d.initial_involvement_valuable),
    created_at: d.created_at || ''
  }));

  const attachments = [];
  attachments.push(bufferToAttachment(framingRows, `framing_study_results-${today}.csv`));
  attachments.push(bufferToAttachment(demographicsRows, `demographics-${today}.csv`));
  return attachments;
}

function bufferToAttachment(rows, filename) {
  const csv = rowsToCsv(rows);
  return {
    filename,
    content: Buffer.from(csv, 'utf8').toString('base64'),
    type: 'text/csv'
  };
}

function rowsToCsv(rows) {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n\r]/.test(s) ? `"${s}"` : s;
  };
  const dataLines = rows.map(r => headers.map(h => esc(r[h])).join(','));
  return [headers.join(','), ...dataLines].join('\n');
}

// Helper function to send email
async function sendEmail(resendApiKey, fromEmail, recipientEmails, today, framingCount, demographicsCount, attachments) {
  const emailData = {
    from: `Survey System <${fromEmail}>`,
    to: recipientEmails,
    subject: `Daily Survey Report - ${today} (${framingCount + demographicsCount} responses)`,
    html: `
      <h2>Daily Survey Report - ${today}</h2>
      <p><strong>Survey Responses:</strong> ${framingCount + demographicsCount}</p>
      <ul>
        <li>Framing Study Results: ${framingCount}</li>
        <li>Demographics: ${demographicsCount}</li>
      </ul>
      <p>Two CSV files are attached for SPSS:</p>
      <ol>
        <li>framing_study_results-YYYY-MM-DD.csv</li>
        <li>demographics-YYYY-MM-DD.csv</li>
      </ol>
      <p>This is an automated report from your survey system.</p>
    `
  };

  if (attachments && attachments.length > 0) {
    emailData.attachments = attachments;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send email: ${error.message || response.statusText}`);
  }

  return await response.json();
}

// Helper function to create Excel buffer (proper CSV format)
function createExcelBuffer(data) {
  // Create a proper CSV file instead of fake Excel
  const csvContent = Object.keys(data).map(sheetName => {
    const sheetData = data[sheetName];
    if (sheetData.length === 0) return '';
    
    const headers = Object.keys(sheetData[0]);
    const csvRows = [
      headers.join(','),
      ...sheetData.map(row => headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = String(value).replace(/"/g, '""');
        return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
      }).join(','))
    ];
    
    return `\n=== ${sheetName} ===\n${csvRows.join('\n')}\n`;
  }).join('\n');
  
  return Buffer.from(csvContent, 'utf8');
}
