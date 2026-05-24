// ===== أبو البزيز - مستشار التسويق العراقي =====

class AbuAlBaziz {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.init();
    }

    init() {
        this.chatMessages = document.getElementById('chatMessages');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.messagesWrapper = document.getElementById('messagesWrapper');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.newChatBtnHeader = document.getElementById('newChatBtnHeader');
        this.convPanel = document.getElementById('convPanel');
        this.togglePanel = document.getElementById('togglePanel');

        this.bindEvents();
        this.autoResizeTextarea();
    }

    bindEvents() {
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input state
        this.messageInput.addEventListener('input', () => {
            this.sendBtn.disabled = !this.messageInput.value.trim();
            this.autoResizeTextarea();
        });

        // Toggle panel
        this.togglePanel.addEventListener('click', () => {
            this.convPanel.classList.toggle('collapsed');
        });

        // New chat
        this.newChatBtn.addEventListener('click', () => this.newChat());
        this.newChatBtnHeader.addEventListener('click', () => this.newChat());

        // Suggestion chips
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const prompt = chip.dataset.prompt;
                this.messageInput.value = prompt;
                this.sendBtn.disabled = false;
                this.sendMessage();
            });
        });

        // Close panel on outside click (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 900 && 
                !this.convPanel.classList.contains('collapsed') &&
                !this.convPanel.contains(e.target) &&
                !this.togglePanel.contains(e.target)) {
                this.convPanel.classList.add('collapsed');
            }
        });
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 150) + 'px';
    }

    async sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || this.isTyping) return;

        // Hide welcome, show messages
        this.welcomeScreen.style.display = 'none';
        this.messagesWrapper.style.display = 'block';

        // Add user message
        this.messages.push({ role: 'user', content: text });
        this.addMessageToUI('user', text);
        this.messageInput.value = '';
        this.sendBtn.disabled = true;
        this.autoResizeTextarea();

        // Get AI response
        await this.getResponse();
    }

    addMessageToUI(role, content) {
        const msgEl = document.createElement('div');
        msgEl.className = `message ${role}`;
        msgEl.innerHTML = `
            <div class="msg-avatar">
                <i class="fas ${role === 'user' ? 'fa-user' : 'fa-store'}"></i>
            </div>
            <div class="msg-body">
                <div class="msg-bubble">
                    ${this.formatMessage(content)}
                </div>
            </div>
        `;

        this.messagesWrapper.appendChild(msgEl);
        this.scrollToBottom();
    }

    formatMessage(text) {
        let formatted = text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        return `<p>${formatted}</p>`;
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async getResponse() {
        this.isTyping = true;

        // Show typing indicator
        const typingEl = document.createElement('div');
        typingEl.className = 'message assistant';
        typingEl.id = 'typing-indicator';
        typingEl.innerHTML = `
            <div class="msg-avatar">
                <i class="fas fa-store"></i>
            </div>
            <div class="msg-body">
                <div class="msg-bubble">
                    <div class="typing-dots">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;
        this.messagesWrapper.appendChild(typingEl);
        this.scrollToBottom();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: this.messages })
            });

            // Remove typing indicator
            typingEl.remove();

            if (!response.ok) {
                throw new Error('فشل الاتصال بالسيرفر');
            }

            const data = await response.json();
            const assistantMessage = data.choices[0].message.content;

            this.messages.push({ role: 'assistant', content: assistantMessage });
            this.addMessageToUI('assistant', assistantMessage);

        } catch (error) {
            typingEl.remove();
            this.addMessageToUI('assistant', 'عذراً، صار خطأ بالاتصال. حاول مرة ثانية.');
            console.error('Error:', error);
        }

        this.isTyping = false;
    }

    newChat() {
        this.messages = [];
        this.messagesWrapper.innerHTML = '';
        this.messagesWrapper.style.display = 'none';
        this.welcomeScreen.style.display = 'flex';
        this.messageInput.value = '';
        this.sendBtn.disabled = true;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AbuAlBaziz();
});
