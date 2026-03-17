// src/services/ai.service.js

const openai = require('../config/openai');

// ── BUSINESS INSIGHTS ────────────────────────────────
const generateBusinessInsights = async (dashboardData) => {
  const prompt = `
You are a smart business analyst for a small business.
Analyze this business data and give 3-5 practical recommendations:

TODAY:
- Revenue: Rs. ${dashboardData.today.revenue}
- Expenses: Rs. ${dashboardData.today.expenses}
- Profit: Rs. ${dashboardData.today.profit}
- Sales Count: ${dashboardData.today.salesCount}

THIS MONTH:
- Revenue: Rs. ${dashboardData.thisMonth.revenue}
- Expenses: Rs. ${dashboardData.thisMonth.expenses}
- Profit: Rs. ${dashboardData.thisMonth.profit}

ALL TIME:
- Total Revenue: Rs. ${dashboardData.allTime.revenue}
- Total Expenses: Rs. ${dashboardData.allTime.expenses}
- Total Profit: Rs. ${dashboardData.allTime.profit}

INVENTORY:
- Total Products: ${dashboardData.inventory.totalProducts}
- Low Stock Items: ${dashboardData.inventory.lowStockCount}

Give specific, actionable advice. Be concise and friendly.
Format your response as a JSON array of insights like:
[
  { "type": "warning", "title": "Low Stock Alert", "message": "..." },
  { "type": "tip", "title": "Increase Revenue", "message": "..." },
  { "type": "positive", "title": "Great Performance", "message": "..." }
]
Important: Only respond with the JSON array, nothing else.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.7,
  });

  // ── CLEAN RESPONSE ────────────────────────────────
  const raw = response.choices[0].message.content;
  const cleaned = raw
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ')
    .trim();

  return JSON.parse(cleaned);
};

// ── SOCIAL MEDIA POST GENERATOR ──────────────────────
const generateSocialPost = async (platform, productName, details) => {
  const prompt = `
Create a ${platform} post for a small business promoting their product.
Product: ${productName}
Details: ${details}

Make it engaging, use relevant emojis, include a call to action.
Format as JSON:
{
  "post": "...",
  "hashtags": ["...", "..."]
}
Important: Only respond with the JSON, nothing else.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
    temperature: 0.8,
  });

  // ── CLEAN RESPONSE ────────────────────────────────
  const raw = response.choices[0].message.content;
  const cleaned = raw
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\t/g, ' ')
    .trim();

  return JSON.parse(cleaned);
};
// ── EMAIL COMPOSER ───────────────────────────────────
const composeEmail = async (purpose, details) => {
  const prompt = `
Write a professional business email for a small business owner.
Purpose: ${purpose}
Details: ${details}

Write a complete email with subject line and body.
Format as JSON:
{
  "subject": "...",
  "body": "..."
}
Important: 
- Do not use line breaks inside the JSON values
- Use \\n for new lines inside the body
- Only respond with the JSON, nothing else.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
    temperature: 0.7,
  });

  // ── CLEAN RESPONSE BEFORE PARSING ────────────────
  // Remove any control characters that break JSON.parse
  const raw = response.choices[0].message.content;
  const cleaned = raw
    .replace(/[\u0000-\u001F\u007F]/g, ' ') // remove control characters
    .replace(/\n/g, ' ')                     // remove newlines
    .replace(/\r/g, ' ')                     // remove carriage returns
    .replace(/\t/g, ' ')                     // remove tabs
    .trim();

  return JSON.parse(cleaned);
};




// ── BUSINESS CHATBOT ─────────────────────────────────
const chatWithBusiness = async (question, businessContext) => {
  const prompt = `
You are a helpful business assistant for a small business.
Here is the current business data:
${JSON.stringify(businessContext, null, 2)}

Answer this question concisely and helpfully:
${question}
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
};

module.exports = {
  generateBusinessInsights,
  composeEmail,
  generateSocialPost,
  chatWithBusiness,
};