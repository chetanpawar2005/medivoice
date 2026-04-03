const express = require('express');
const cors = require('cors');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize OpenAI client for OpenRouter
let openai;
try {
  openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENAI_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "MediVoice",
    }
  });
} catch (error) {
  console.warn("OpenAI API key not configured properly.");
}

// Emergency keywords
const emergencyKeywords = [
  'chest pain', 'heart attack', 'stroke', 'difficulty breathing', 
  'severe bleeding', 'unconscious', 'suicide', 'kill myself',
  'severe trauma', 'choking', 'sudden weakness', 'sudden numbness',
  'coughing blood', 'vomiting blood', 'seizure', 'convulsion'
];

function checkEmergency(text) {
  const lowerText = text.toLowerCase();
  return emergencyKeywords.some(keyword => lowerText.includes(keyword));
}

// System prompt for the AI
const systemPrompt = `You are MediVoice, an AI-powered conversational healthcare assistant. 
Your goal is to provide users with instant, safe, and general medical guidance based on their symptoms.
Constraints & Limitations:
- NEVER provide a definitive medical diagnosis.
- NEVER prescribe medication.
- ALWAYS emphasize that you are an AI assistant and not a replacement for a real doctor.
- ALWAYS advise seeking professional medical care or calling emergency services if the situation sounds serious.
- Keep responses concise, clear, and empathetic.
- Provide general guidance on home care for minor issues if appropriate.
IMPORTANT: Based on the user's symptoms, if it is highly recommended they see a doctor, determine the specific medical specialist they should see (e.g., General Physician, Cardiologist, Dermatologist, Dentist, Orthopedic). If you recommend a doctor, you MUST append this exact tag at the very end of your response: [SPECIALTY: <Specialist Name>] (e.g., [SPECIALTY: Dermatologist]). If it's an emergency, append [SPECIALTY: Hospital]. If no doctor visit is necessary, do not include the tag.`;

// Chat API Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    if (message.length > 500) {
      return res.status(400).json({ error: 'Message is too long. Please keep it under 500 characters.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key is missing. Please configure it in the .env file.' 
      });
    }

    const isEmergency = checkEmergency(message);

    // Format conversation history for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    if (history && Array.isArray(history)) {
      history.forEach(item => {
        messages.push({ role: item.role, content: item.content });
      });
    }

    messages.push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo", // Guarantee a valid OpenRouter model
      messages: messages,
      temperature: 0.5,
      max_tokens: 300,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      response: aiResponse,
      isEmergency: isEmergency
    });

  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ error: 'An error occurred while communicating with the AI. Please try again later.' });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MediVoice Server is running on http://127.0.0.1:${PORT}`);
});
