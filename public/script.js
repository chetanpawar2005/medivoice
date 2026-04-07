document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const emergencyBannerWrapper = document.getElementById('emergency-banner-wrapper');
    const closeEmergencyBtn = document.getElementById('close-emergency-btn');

    // Conversation History
    let conversationHistory = [];
    let isWaitingForResponse = false;

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if(this.value.trim() === '') {
            this.style.height = 'auto';
        }
    });

    // Handle Enter key (allow Shift+Enter for new line)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.requestSubmit();
        }
    });

    // Close emergency banner
    closeEmergencyBtn.addEventListener('click', () => {
        emergencyBannerWrapper.classList.add('hidden');
    });

    // New Chat
    newChatBtn.addEventListener('click', () => {
        conversationHistory = [];
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-content">
                    Hello, I'm Dr. Nova, your MediVoice assistant. Please describe your symptoms in detail, and I'll do my best to guide you. (Remember, I am an AI and cannot replace real medical care).
                </div>
                <div class="message-time">Now</div>
            </div>
        `;
        emergencyBannerWrapper.classList.add('hidden');
        messageInput.value = '';
        messageInput.style.height = 'auto';
        messageInput.focus();
    });

    // Helper: format time
    const formatTime = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Add message to DOM
    const addMessageToDOM = (content, role) => {
        let displayContent = content;
        let specialtyMatch = null;
        
        if (role === 'ai') {
            const specialtyRegex = /\[SPECIALTY:\s*([^\]]+)\]/i;
            specialtyMatch = displayContent.match(specialtyRegex);
            if (specialtyMatch) {
                displayContent = displayContent.replace(specialtyRegex, '').trim();
            }
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role === 'user' ? 'user-message' : 'ai-message'}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Simple markdown parsing for bold and line breaks
        let formattedContent = displayContent
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        
        contentDiv.innerHTML = formattedContent;

        if (specialtyMatch && specialtyMatch[1]) {
            const specialty = specialtyMatch[1].trim();
            const actionContainer = document.createElement('div');
            actionContainer.className = 'action-buttons-container';
            
            const mapQuery = encodeURIComponent(specialty + " near me");
            const hospitalQuery = encodeURIComponent("hospitals near me");
            
            actionContainer.innerHTML = `
                <a href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" class="action-btn doctor-btn">
                    <i class="fa-solid fa-stethoscope"></i> Find nearby ${specialty}
                </a>
                <a href="#" class="action-btn hospital-btn">
                    <i class="fa-solid fa-phone"></i> Contact Detail
                </a>
            `;
            contentDiv.appendChild(actionContainer);
        }

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = formatTime();

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);

        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    };

    // Show/Hide typing indicator
    const toggleTypingIndicator = (show) => {
        if (show) {
            const indicatorDiv = document.createElement('div');
            indicatorDiv.className = 'typing-indicator id-typing';
            indicatorDiv.id = 'typing-indicator';
            
            for(let i=0; i<3; i++) {
                const dot = document.createElement('div');
                dot.className = 'typing-dot';
                indicatorDiv.appendChild(dot);
            }
            
            chatMessages.appendChild(indicatorDiv);
            scrollToBottom();
        } else {
            const indicator = document.getElementById('typing-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    };

    // Scroll to bottom
    const scrollToBottom = () => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Form Submit Handler
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        if (!message || isWaitingForResponse) return;

        // Reset input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        
        // Add User Message
        addMessageToDOM(message, 'user');
        
        // Disable input
        isWaitingForResponse = true;
        sendBtn.disabled = true;
        messageInput.disabled = true;
        
        toggleTypingIndicator(true);

        try {
            const response = await fetch('http://127.0.0.1:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    history: conversationHistory
                })
            });

            const data = await response.json();
            
            toggleTypingIndicator(false);

            if (!response.ok) {
                throw new Error(data.error || 'Server responded with an error');
            }

            // Show Emergency Banner if flagged
            if (data.isEmergency) {
                emergencyBannerWrapper.classList.remove('hidden');
            } else {
                emergencyBannerWrapper.classList.add('hidden'); // optionally hide if next message is not an emergency
            }

            // Add AI response
            addMessageToDOM(data.response, 'ai');

            // Update history
            conversationHistory.push({ role: 'user', content: message });
            conversationHistory.push({ role: 'assistant', content: data.response });

        } catch (error) {
            toggleTypingIndicator(false);
            console.error("Chat Error:", error);
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'message ai-message';
            errorMsg.innerHTML = `
                <div class="message-content" style="background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5);">
                    <i class="fa-solid fa-circle-exclamation"></i> Sorry, I encountered an error: ${error.message}
                </div>
            `;
            chatMessages.appendChild(errorMsg);
            scrollToBottom();
        } finally {
            // Re-enable input
            isWaitingForResponse = false;
            sendBtn.disabled = false;
            messageInput.disabled = false;
            messageInput.focus();
        }
    });
});
