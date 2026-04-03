# 📄 Product Requirement Document (PRD)
## Project: MediVoice – AI Doctor Website

---

## 1. 📌 Overview

**MediVoice** is an AI-powered conversational healthcare assistant designed to provide users with **instant, safe, and general medical guidance** based on their symptoms.

The system uses **natural language processing (NLP)** and integrates with an AI model to simulate basic doctor-patient interaction. It is a **web-based platform** accessible from any device without login or installation.

---

## 2. 🎯 Objectives

- Provide **instant medical guidance** based on user symptoms  
- Reduce unnecessary **hospital visits for minor issues**  
- Help users identify **red-flag (emergency) symptoms**  
- Improve **healthcare accessibility**, especially in rural areas  
- Ensure **safe and ethical AI responses** (no diagnosis or prescriptions)

---

## 3. 📊 Problem Statement

Users face:
- Long waiting times in hospitals  
- Lack of immediate medical consultation  
- Confusing and unreliable online health information  
- Difficulty identifying serious vs minor symptoms  

There is a need for a **simple, fast, and intelligent platform** that gives **preliminary medical guidance**.

---

## 4. 👥 Target Users

- General public (all age groups)  
- Rural users with limited healthcare access  
- Students and working professionals  
- Elderly users needing quick guidance  

---

## 5. 🚀 Key Features

### 5.1 Core Features
- 💬 Chat-based AI interaction  
- 🧠 Symptom analysis using AI  
- ⚠️ Emergency (red-flag) detection  
- 📱 Responsive web interface  
- 🔄 Real-time responses  

### 5.2 Advanced Features
- 🎤 Voice input (future scope)  
- 🌐 Multi-language support (future)  
- 🚑 Emergency alert system  
- 👨‍⚕️ Doctor recommendations  

---

## 6. 🧩 Functional Requirements

### User Side
- User can input symptoms via text  
- User receives AI-generated response  
- User sees warnings for serious symptoms  
- User can continue conversation (chat history)

### System Side
- Validate user input  
- Process natural language queries  
- Generate safe AI responses  
- Highlight emergency conditions  

---

## 7. ⚙️ Non-Functional Requirements

- ⚡ Fast response time (< 2–3 seconds)  
- 🔒 Data privacy (no personal data storage)  
- 📈 Scalability for future features  
- 📱 Mobile-friendly UI  
- 🧠 High accuracy in general guidance  

---

## 8. 🏗️ System Architecture


User → Frontend → Backend → OpenAI API → Backend → Frontend → User


### Components:
- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Node.js, Express.js  
- **AI Layer**: OpenAI GPT model  

---

## 9. 🔄 Workflow

1. User enters symptoms  
2. Input is validated  
3. Backend processes request  
4. AI generates response  
5. Response is filtered (safety check)  
6. Output displayed to user  

---

## 10. 🧠 Algorithm Overview

1. Input validation  
2. Text preprocessing  
3. AI prompt creation  
4. AI response generation  
5. Safety filtering  
6. Response delivery  

---

## 11. 🖥️ Tech Stack

### Frontend:
- HTML5  
- CSS3  
- JavaScript  

### Backend:
- Node.js  
- Express.js  

### Tools:
- OpenAI API  
- dotenv  
- npm  
- VS Code  

---

## 12. 🔐 Constraints & Limitations

- ❌ No medical diagnosis  
- ❌ No prescription generation  
- ⚠️ Limited to general guidance  
- 🌐 Requires internet connection  

---

## 13. 📈 Success Metrics

- Response accuracy  
- User satisfaction  
- System response time  
- Number of successful interactions  

---

## 14. 🔮 Future Scope

- Voice-based interaction  
- Multi-language support  
- Mobile app development  
- Integration with hospitals/EHR  
- Appointment booking system  

---

## 15. ✅ Conclusion

MediVoice aims to bridge the gap between users and healthcare by providing **instant, accessible, and safe medical guidance**. It acts as a **support system**, not a replacement for doctors, and enhances healthcare awareness using AI.

---