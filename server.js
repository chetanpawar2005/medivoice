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

// Initialize OpenAI client for Gemini
let openai;
try {
  openai = new OpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.warn("API key not configured properly.");
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

    let demoMode = false;
    if (!process.env.GEMINI_API_KEY && (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-or-'))) {
      demoMode = true;
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

    let aiResponse = "";

    if (demoMode) {
      // Create a smart mock response so the UI still functions perfectly
      await new Promise(resolve => setTimeout(resolve, 1500)); // fake typing delay
      
      if (isEmergency) {
        aiResponse = "I am currently in **Demo Mode** because a valid API Key is missing. However, based on your keywords, this sounds like a serious medical emergency! Please seek immediate attention. \n\n[SPECIALTY: Hospital]";
      } else {
        aiResponse = "I am currently in **Demo Mode** because a valid Gemini API Key is missing from the `.env` file.\n\nIf I were fully connected, I would analyze your symptoms and give you general medical advice. For general checkups, I would recommend visiting a local clinic.\n\n[SPECIALTY: General Physician]";
      }
    } else {
      const completion = await openai.chat.completions.create({
        model: "gemini-2.5-flash", // Fast and free Gemini model
        messages: messages,
        temperature: 0.5,
        max_tokens: 300,
      });
      aiResponse = completion.choices[0].message.content;
    }

    res.json({
      response: aiResponse,
      isEmergency: isEmergency
    });

  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // In case of a 401 auth error, fail gracefully to Demo Mode
    if (error.status === 401 || error.message.includes('401')) {
       res.json({
         response: "I attempted to contact the AI, but the API key was instantly rejected (Error 401 Unauthorized). Please check your `.env` file and generate a fresh key from https://aistudio.google.com/app/apikey. \n\n[SPECIALTY: General Physician]",
         isEmergency: false
       });
       return;
    }

    const apiErrorDetail = error.message || 'Unknown provider error';
    res.status(500).json({ error: `AI Communication Error: ${apiErrorDetail}` });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MediVoice Server is running on http://127.0.0.1:${PORT}`);
});
