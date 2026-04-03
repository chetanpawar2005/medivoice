const fs = require('fs');
const path = require('path');

async function extractPdf() {
  try {
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(path.join(__dirname, 'Chetan major report.pdf'));
    const data = await pdfParse(dataBuffer);
    console.log(data.text);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

extractPdf();
