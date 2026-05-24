// ===== Abu Al-Baziz - Chat Agent Application =====

class AbuAlBaziz {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.init();
    }

    init() {
        // DOM Elements
        this.chatMessages = document.getElementById('chatMessages');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.messagesWrapper = document.getElementById('messagesWrapper');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.convPanel = document.getElementById('convPanel');
        this.togglePanel = document.getElementById('togglePanel');
        this.settingsModal = document.getElementById('settingsModal');
        this.openSettings = document.getElementById('openSettings');
        this.closeSettings = document.getElementById('closeSettings');

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

        // Settings
        this.openSettings.addEventListener('click', () => {
            this.settingsModal.classList.add('show');
        });
        this.closeSettings.addEventListener('click', () => {
            this.settingsModal.classList.remove('show');
        });
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.settingsModal.classList.remove('show');
            }
        });

        // Suggestion chips
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const prompt = chip.dataset.prompt;
                this.messageInput.value = prompt;
                this.sendBtn.disabled = false;
                this.sendMessage();
            });
        });

        // Conversation items
        document.querySelectorAll('.conv-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.conv-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Icon nav buttons
        document.querySelectorAll('.icon-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.icon-nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.settingsModal.classList.remove('show');
            }
        });
    }


    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 150) + 'px';
    }

    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text || this.isTyping) return;

        // Hide welcome, show messages
        this.welcomeScreen.style.display = 'none';
        this.messagesWrapper.style.display = 'block';

        // Add user message
        this.addMessage('user', text);
        this.messageInput.value = '';
        this.sendBtn.disabled = true;
        this.autoResizeTextarea();

        // Simulate AI response
        this.simulateResponse(text);
    }

    addMessage(role, content) {
        const msg = { role, content, time: new Date() };
        this.messages.push(msg);

        const msgEl = document.createElement('div');
        msgEl.className = `message ${role}`;
        msgEl.innerHTML = `
            <div class="msg-avatar">
                <i class="fas ${role === 'user' ? 'fa-user' : 'fa-robot'}"></i>
            </div>
            <div class="msg-body">
                <div class="msg-bubble">
                    ${this.formatMessage(content)}
                </div>
                <div class="msg-actions">
                    <button class="msg-action" title="نسخ"><i class="fas fa-copy"></i></button>
                    <button class="msg-action" title="إعادة"><i class="fas fa-rotate-right"></i></button>
                    ${role === 'assistant' ? '<button class="msg-action" title="إعجاب"><i class="fas fa-thumbs-up"></i></button>' : ''}
                </div>
            </div>
        `;

        this.messagesWrapper.appendChild(msgEl);
        this.scrollToBottom();

        // Bind copy button
        const copyBtn = msgEl.querySelector('.msg-action');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(content);
                copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            });
        }
    }

    formatMessage(text) {
        // Basic markdown-like formatting
        let formatted = text
            .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
        return `<p>${formatted}</p>`;
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }


    simulateResponse(userMessage) {
        this.isTyping = true;

        // Show typing indicator
        const typingEl = document.createElement('div');
        typingEl.className = 'message assistant';
        typingEl.id = 'typing-indicator';
        typingEl.innerHTML = `
            <div class="msg-avatar">
                <i class="fas fa-robot"></i>
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

        // Simulate delay then respond
        const delay = 1000 + Math.random() * 2000;
        setTimeout(() => {
            // Remove typing indicator
            typingEl.remove();

            // Generate response
            const response = this.generateResponse(userMessage);
            this.addMessage('assistant', response);
            this.isTyping = false;
        }, delay);
    }

    generateResponse(input) {
        // Demo responses - will be replaced with API calls later
        const responses = {
            'code': `بالتأكيد! إليك مثال على كود Python لتحليل البيانات:\n\n\`\`\`python\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# قراءة البيانات\ndf = pd.read_csv('data.csv')\n\n# تحليل أساسي\nprint(df.describe())\nprint(df.info())\n\n# رسم بياني\ndf.plot(kind='bar', x='category', y='value')\nplt.title('تحليل البيانات')\nplt.show()\n\`\`\`\n\nهذا الكود يقوم بـ:\n- قراءة ملف CSV\n- عرض إحصائيات أساسية\n- إنشاء رسم بياني`,

            'مقال': `بكل سرور! إليك هيكل مقال احترافي:\n\n**العنوان:** [عنوان جذاب ومحدد]\n\n**المقدمة:**\nابدأ بسؤال أو إحصائية مثيرة للاهتمام تجذب القارئ.\n\n**الجسم الرئيسي:**\n1. النقطة الأولى مع أدلة داعمة\n2. النقطة الثانية مع أمثلة عملية\n3. النقطة الثالثة مع إحصائيات\n\n**الخاتمة:**\nلخّص النقاط الرئيسية وقدم دعوة للعمل.\n\nهل تريد أن أكتب لك مقالاً عن موضوع محدد؟`,

            'machine': `**Machine Learning** (تعلم الآلة) هو فرع من الذكاء الاصطناعي يسمح للأنظمة بالتعلم من البيانات.\n\n**الأنواع الرئيسية:**\n1. **التعلم الخاضع للإشراف** - بيانات مع تسميات\n2. **التعلم غير الخاضع للإشراف** - اكتشاف الأنماط\n3. **التعلم التعزيزي** - التعلم من التجربة\n\n**تطبيقات عملية:**\n- التعرف على الصور والوجوه\n- معالجة اللغة الطبيعية\n- التنبؤ بالأسعار\n- السيارات ذاتية القيادة`,

            'api': `إليك تصميم REST API أساسي:\n\n\`\`\`\nGET    /api/v1/users          - قائمة المستخدمين\nGET    /api/v1/users/:id      - مستخدم محدد\nPOST   /api/v1/users          - إنشاء مستخدم\nPUT    /api/v1/users/:id      - تحديث مستخدم\nDELETE /api/v1/users/:id      - حذف مستخدم\n\`\`\`\n\n**البنية المقترحة:**\n- استخدم JWT للمصادقة\n- أضف Rate Limiting\n- استخدم Pagination للقوائم\n- أرجع أكواد HTTP صحيحة\n\nهل تريد تفاصيل أكثر عن جزء معين؟`
        };

        const lowerInput = input.toLowerCase();
        if (lowerInput.includes('كود') || lowerInput.includes('python') || lowerInput.includes('code')) {
            return responses['code'];
        } else if (lowerInput.includes('مقال') || lowerInput.includes('كتابة')) {
            return responses['مقال'];
        } else if (lowerInput.includes('machine') || lowerInput.includes('اشرح') || lowerInput.includes('مفهوم')) {
            return responses['machine'];
        } else if (lowerInput.includes('api') || lowerInput.includes('صمم')) {
            return responses['api'];
        }

        return `شكراً على سؤالك! 🙏\n\nأنا **أبو البزيز**، مساعدك الذكي. حالياً أعمل بوضع العرض التوضيحي.\n\nعندما يتم ربط الـ API، سأتمكن من:\n- الإجابة على أسئلتك بدقة\n- كتابة وتحليل الأكواد\n- المساعدة في الترجمة والكتابة\n- وأكثر بكثير!\n\nجرب تسألني عن البرمجة أو الكتابة أو أي موضوع آخر. 😊`;
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
