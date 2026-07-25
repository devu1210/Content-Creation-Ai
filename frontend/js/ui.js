class UI {
    // ─── TOAST ───
    static showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = type === 'error'
            ? '<i class="fa-solid fa-circle-exclamation" style="color:var(--danger)"></i>'
            : type === 'success'
            ? '<i class="fa-solid fa-circle-check" style="color:var(--success)"></i>'
            : '<i class="fa-solid fa-circle-info" style="color:var(--accent)"></i>';

        toast.innerHTML = `
            ${icon}
            <span style="flex:1">${message}</span>
            <button style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:12px;" onclick="this.closest('.toast').remove()">
                <i class="fa-solid fa-xmark"></i>
            </button>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }

    // ─── THEME ───
    static toggleTheme() {
        document.body.classList.toggle('light');
        const isLight = document.body.classList.contains('light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }

    static initTheme() {
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = stored ? stored === 'dark' : prefersDark;
        if (!isDark) document.body.classList.add('light');
        const icon = document.getElementById('theme-icon');
        if (icon) icon.className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }

    // ─── MARKDOWN ───
    static renderMarkdown(text) {
        if (typeof marked !== 'undefined') {
            marked.setOptions({ breaks: true, gfm: true });
            return marked.parse(text);
        }
        return text.replace(/\n/g, '<br>');
    }

    // ─── CHAT MESSAGES ───
    static addChatMessage(role, content) {
        const chatContainer = document.getElementById('chat-messages-view');
        const isUser = role === 'user';

        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${isUser ? 'user' : 'ai'}`;

        if (isUser) {
            msgDiv.innerHTML = `
                <div class="msg-bubble">
                    <div style="font-size:13px;white-space:pre-wrap;">${this.escapeHtml(content)}</div>
                </div>
            `;
        } else {
            const wordsCount = content.split(/\s+/).length;
            msgDiv.innerHTML = `
                <div class="msg-avatar ai-avatar">
                    <i class="fa-solid fa-wand-magic-sparkles" style="font-size:12px;"></i>
                </div>
                <div class="msg-bubble" style="min-width:60px;">
                    <div class="prose">${this.renderMarkdown(content)}</div>
                    <div class="msg-actions">
                        <button class="copy-btn" onclick="UI.copyContent(this, ${JSON.stringify(content).replace(/'/g, "\\'")})">
                            <i class="fa-regular fa-copy"></i> Copy
                        </button>
                        <span style="font-size:11px;color:var(--text-muted);">${wordsCount} words</span>
                    </div>
                </div>
            `;
        }

        chatContainer.appendChild(msgDiv);
        document.getElementById('chat-container').scrollTop = 99999;
    }

    static copyContent(btn, content) {
        navigator.clipboard.writeText(content).then(() => {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            btn.style.color = 'var(--success)';
            setTimeout(() => {
                btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
                btn.style.color = '';
            }, 2000);
        });
    }

    static escapeHtml(text) {
        return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    // ─── LOADING BUBBLE ───
    static showLoadingBubble() {
        const chatContainer = document.getElementById('chat-messages-view');
        const el = document.createElement('div');
        el.id = 'loading-bubble';
        el.className = 'loading-bubble';
        el.innerHTML = `
            <div class="msg-avatar ai-avatar"><i class="fa-solid fa-wand-magic-sparkles" style="font-size:12px;"></i></div>
            <div class="loading-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        chatContainer.appendChild(el);
        document.getElementById('chat-container').scrollTop = 99999;
    }

    static removeLoadingBubble() {
        const el = document.getElementById('loading-bubble');
        if (el) el.remove();
    }

    // ─── VIEW SWITCHERS ───
    static setViewChat() {
        document.getElementById('generation-form-view').classList.add('hidden');
        document.getElementById('chat-messages-view').classList.remove('hidden');
        document.getElementById('chat-toolbar').classList.remove('hidden');
    }

    static setViewNew() {
        document.getElementById('generation-form-view').classList.remove('hidden');
        document.getElementById('chat-messages-view').classList.add('hidden');
        document.getElementById('chat-toolbar').classList.add('hidden');
        document.getElementById('chat-messages-view').innerHTML = '';
        document.getElementById('current-chat-title').textContent = 'New Generation';
        document.getElementById('field-topic').value = '';
    }

    // ─── EXPORT ───
    static async exportToPDF(content) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFont('helvetica');
            doc.setFontSize(18);
            doc.setTextColor(40, 40, 80);
            doc.text('AI Generated Content', 14, 22);
            doc.setLineWidth(0.5);
            doc.setDrawColor(200, 200, 220);
            doc.line(14, 26, 196, 26);
            doc.setFontSize(11);
            doc.setTextColor(50, 50, 50);
            const lines = doc.splitTextToSize(content, 180);
            doc.text(lines, 14, 34);
            doc.save('AI_Generated_Content.pdf');
            UI.showToast('PDF downloaded!', 'success');
        } catch (e) {
            UI.showToast('PDF export failed: ' + e.message, 'error');
        }
    }

    static exportToTxt(content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'AI_Generated_Content.txt'; a.click();
        URL.revokeObjectURL(url);
        UI.showToast('TXT downloaded!', 'success');
    }

    // ─── VOICE INPUT ───
    static startVoiceInput(targetId) {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            UI.showToast('Voice input not supported in this browser.', 'error');
            return;
        }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        const btn = document.getElementById('btn-voice-input');
        btn.classList.add('recording');
        btn.innerHTML = '<i class="fa-solid fa-microphone-slash"></i>';

        recognition.onresult = (event) => {
            document.getElementById(targetId).value = event.results[0][0].transcript;
            UI.showToast('Voice captured!', 'success');
        };
        recognition.onerror = () => UI.showToast('Voice recognition error', 'error');
        recognition.onend = () => {
            btn.classList.remove('recording');
            btn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        };
        recognition.start();
    }
}
