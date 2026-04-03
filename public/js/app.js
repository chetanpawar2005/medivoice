document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatContainer = document.getElementById('chatContainer');
    const newChatBtn = document.getElementById('newChatBtn');
    const emergencyAlert = document.getElementById('emergencyAlert');
    const closeAlertBtn = document.getElementById('closeAlertBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.querySelector('.sidebar');
    const errorModal = document.getElementById('errorModal');
    const errorModalBody = document.getElementById('errorModalBody');
    const closeErrorModalBtn = document.getElementById('closeErrorModalBtn');

    // State
    let isWaitingForResponse = false;
    let chatHistory = [];

    // --- Core UI Interactions ---

    // Auto-resize textarea
    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        // Enable/disable send button
        if (this.value.trim().length > 0 && !isWaitingForResponse) {
            sendBtn.removeAttribute('disabled');
        } else {
            sendBtn.setAttribute('disabled', 'true');
        }
    });

    // Handle Enter to send
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendBtn.disabled) {
                chatForm.dispatchEvent(new Event('submit'));
            }
        }
    });

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !mobileMenuBtn.contains(e.target) && 
            sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    });

    // Start new chat
    newChatBtn.addEventListener('click', () => {
        // Clear UI and history except welcome message
        const welcomeMessage = chatContainer.firstElementChild.outerHTML;
        chatContainer.innerHTML = welcomeMessage;
        chatHistory = [];
        hideEmergencyAlert();
        
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
        
        lucide.createIcons();
    });

    // --- Chat Logic ---

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        if (!message || isWaitingForResponse) return;

        // Reset input
        messageInput.value = '';
        messageInput.style.height = 'auto';
        sendBtn.setAttribute('disabled', 'true');
        
        hideEmergencyAlert();

        // 1. Add user message to UI
        appendUserMessage(message);
        
        // 2. Add typing indicator
        const typingId = appendTypingIndicator();
        
        isWaitingForResponse = true;

        try {
            // 3. Send to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    history: chatHistory
                })
            });

            const data = await response.json();
            
            // Remove typing indicator
            document.getElementById(typingId).remove();
            
            if (!response.ok) {
                throw new Error(data.error || 'Server error');
            }

            // 4. Update history
            chatHistory.push({ role: 'user', content: message });
            chatHistory.push({ role: 'assistant', content: data.response });

            // 5. Add AI response to UI
            appendAiMessage(data.response, data.isEmergency);

            // 6. Show emergency banner if needed
            if (data.isEmergency) {
                showEmergencyAlert();
            }

        } catch (error) {
            document.getElementById(typingId).remove();
            showError(error.message);
            // Re-enable button so user can try again
            sendBtn.removeAttribute('disabled');
            messageInput.value = message;
        } finally {
            isWaitingForResponse = false;
        }
    });

    // --- Message Rendering Helpers ---

    function appendUserMessage(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message user-message';
        msgDiv.innerHTML = \`
            <div class="avatar user-avatar">
                <i data-lucide="user"></i>
            </div>
            <div class="message-content">
                <p>\${escapeHTML(text)}</p>
            </div>
        \`;
        chatContainer.appendChild(msgDiv);
        lucide.createIcons({ root: msgDiv });
        scrollToBottom();
    }

    function appendAiMessage(text, isEmergency) {
        // Simple Markdown parsing for bullet points and bold text
        let formattedText = escapeHTML(text)
            .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
            .replace(/\\n\\n/g, '</p><p>')
            .replace(/\\n- (.*?)/g, '<br>• $1');

        // Wrap in p tag if not already
        if (!formattedText.startsWith('<p>')) {
            formattedText = \`<p>\${formattedText}</p>\`;
        }

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ai-message';
        
        let emergencyHtml = '';
        if (isEmergency) {
            emergencyHtml = \`
                <div class="message-emergency">
                    <i data-lucide="alert-triangle"></i>
                    <p>Emergency warning: Please seek immediate professional medical attention.</p>
                </div>
            \`;
        }

        msgDiv.innerHTML = \`
            <div class="avatar ai-avatar">
                <i data-lucide="bot"></i>
            </div>
            <div class="message-content">
                \${formattedText}
                \${emergencyHtml}
            </div>
        \`;
        
        chatContainer.appendChild(msgDiv);
        lucide.createIcons({ root: msgDiv });
        scrollToBottom();
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.id = id;
        msgDiv.className = 'message ai-message typing-message';
        msgDiv.innerHTML = \`
            <div class="avatar ai-avatar">
                <i data-lucide="bot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        \`;
        chatContainer.appendChild(msgDiv);
        lucide.createIcons({ root: msgDiv });
        scrollToBottom();
        return id;
    }

    // --- Utilities ---

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    function showEmergencyAlert() {
        emergencyAlert.classList.add('show');
    }

    function hideEmergencyAlert() {
        emergencyAlert.classList.remove('show');
    }

    closeAlertBtn.addEventListener('click', hideEmergencyAlert);

    function showError(msg) {
        errorModalBody.textContent = msg;
        errorModal.classList.add('show');
    }

    closeErrorModalBtn.addEventListener('click', () => {
        errorModal.classList.remove('show');
    });
});
