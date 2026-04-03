const { OpenAI } = require('openai');
const fs = require('fs');
require('dotenv').config();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "MediVoice",
  }
});

async function run() {
  try {
    fs.writeFileSync('test_output.txt', 'Starting test...\n');
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [{ role: 'user', content: 'hello' }],
      temperature: 0.5,
      max_tokens: 300,
    });
    fs.appendFileSync('test_output.txt', 'Success: ' + JSON.stringify(completion));
  } catch(e) {
    fs.appendFileSync('test_output.txt', 'Error: ' + e.message + '\n');
    if (e.response) {
      fs.appendFileSync('test_output.txt', 'ResponseData: ' + JSON.stringify(e.response.data));
    }
    if (e.cause) {
      fs.appendFileSync('test_output.txt', 'Cause: ' + String(e.cause));
    }
  }
}
run();
