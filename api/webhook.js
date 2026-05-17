// Vercel Serverless Function — relay SePay webhook → Apps Script
// SePay cannot follow 302 redirects from Google Apps Script
// This endpoint receives POST directly (no redirect) then forwards to Apps Script

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4i7mPwC2QBdNDA_5gEwkY2-4wJbCMy-1x1PguNGfMUYTkva_mIkdtaUrCq-FYhshNaQ/exec';

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    // Forward to Apps Script (follows 302 redirect internally)
    const response = await fetch(SCRIPT_URL, {
      method:   'POST',
      headers:  { 'Content-Type': 'text/plain' },
      body:     body,
      redirect: 'follow',
    });

    const result = await response.text();
    console.log('[Webhook relay] Apps Script response:', result);

    return res.status(200).json({ status: 'forwarded', result });
  } catch (err) {
    console.error('[Webhook relay] Error:', err.message);
    return res.status(200).json({ status: 'error', error: err.message });
  }
}
