class App {
    constructor() {
        this.currentChat = null;
        this.recentContent = null;
        this.init();
    }

    init() {
        UI.initTheme();

        // Theme toggle
        document.getElementById('btn-theme').addEventListener('click', () => UI.toggleTheme());

        // Mobile sidebar
        document.getElementById('btn-menu').addEventListener('click', () => {
            document.getElementById('sidebar').classList.add('open');
            document.getElementById('sidebar-backdrop').classList.remove('hidden');
        });
        document.getElementById('btn-close-sidebar').addEventListener('click', () => this.closeSidebar());
        document.getElementById('sidebar-backdrop').addEventListener('click', () => this.closeSidebar());

        // New generation
        document.getElementById('btn-new-chat').addEventListener('click', () => {
            UI.setViewNew();
            this.currentChat = null;
            this.recentContent = null;
            this.closeSidebar();
        });

        // Clear form
        document.getElementById('btn-clear').addEventListener('click', () => {
            document.getElementById('content-form').reset();
            document.getElementById('keywords-container').removeAttribute('style');
        });

        // Voice input
        document.getElementById('btn-voice-input').addEventListener('click', () => {
            UI.startVoiceInput('field-topic');
        });

        // Keywords visibility by type
        document.getElementById('field-type').addEventListener('change', (e) => {
            const kw = document.getElementById('keywords-container');
            if (e.target.value === 'email') {
                kw.style.opacity = '0.4';
                kw.style.pointerEvents = 'none';
                document.getElementById('field-keywords').value = '';
            } else {
                kw.style.opacity = '';
                kw.style.pointerEvents = '';
            }
        });

        // Generate form submit
        document.getElementById('content-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const topic = document.getElementById('field-topic').value.trim();
            if (!topic) { UI.showToast('Please enter a topic', 'error'); return; }

            const payload = {
                content_type: document.getElementById('field-type').value,
                topic,
                tone: document.getElementById('field-tone').value,
                target_audience: document.getElementById('field-audience').value,
                content_length: document.getElementById('field-length').value,
                output_format: document.getElementById('field-format').value,
                keywords: document.getElementById('field-keywords').value
            };

            await this.generateContent(payload);
        });

        // Regenerate
        document.getElementById('btn-regenerate-chat').addEventListener('click', async () => {
            if (this.currentChat) {
                await this.generateContent(this.currentChat);
            } else {
                UI.showToast('Start a New Generation to regenerate.', 'error');
            }
        });

        // Export PDF
        document.getElementById('btn-export-pdf').addEventListener('click', () => {
            if (this.recentContent) UI.exportToPDF(this.recentContent);
            else UI.showToast('Nothing to export yet', 'error');
        });

        // Export TXT
        document.getElementById('btn-export-txt').addEventListener('click', () => {
            if (this.recentContent) UI.exportToTxt(this.recentContent);
            else UI.showToast('Nothing to export yet', 'error');
        });

        window.App = this;
        Auth.init();
    }

    closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-backdrop').classList.add('hidden');
    }

    async generateContent(payload) {
        this.currentChat = payload;

        UI.setViewChat();

        const userMsg = `📝 ${payload.content_type.toUpperCase()} — "${payload.topic}"\n` +
                        `Tone: ${payload.tone} · Audience: ${payload.target_audience} · Length: ${payload.content_length}`;
        UI.addChatMessage('user', userMsg);

        const btn = document.getElementById('btn-generate');
        const origHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Generating...';

        UI.showLoadingBubble();

        try {
            const res = await ApiService.generateContent(payload);
            UI.removeLoadingBubble();
            this.recentContent = res.response;
            UI.addChatMessage('ai', res.response);

            if (localStorage.getItem('is_guest') !== 'true') {
                this.loadHistory();
            }
        } catch (err) {
            UI.removeLoadingBubble();
            UI.showToast(err.message, 'error');
            UI.addChatMessage('ai', `**Error:** ${err.message}\n\nMake sure the backend server is running and your API key is set in \`.env\`.`);
        } finally {
            btn.disabled = false;
            btn.innerHTML = origHTML;
        }
    }

    async loadHistory() {
        const container = document.getElementById('history-list');
        container.innerHTML = `
            <div class="history-loading">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line"></div>
            </div>`;

        try {
            const history = await ApiService.getHistory();
            container.innerHTML = '';

            if (history.length === 0) {
                container.innerHTML = '<div class="history-item" style="cursor:default;color:var(--text-muted);font-size:12px;"><i class="fa-regular fa-clock"></i><span>No history yet</span></div>';
                return;
            }

            history.forEach(item => {
                const el = document.createElement('div');
                el.className = 'history-item';

                let title = item.prompt
                    ? item.prompt.substring(0, 35).split('\n')[0].trim() + '…'
                    : `Content #${item.id}`;

                el.innerHTML = `<i class="fa-regular fa-message"></i><span class="history-item-text">${title}</span>`;
                el.addEventListener('click', () => {
                    this.loadHistoricalChat(item);
                    this.closeSidebar();
                });
                container.appendChild(el);
            });
        } catch (err) {
            container.innerHTML = '<div class="history-item" style="cursor:default;color:var(--danger);font-size:12px;"><i class="fa-solid fa-triangle-exclamation"></i><span>Failed to load</span></div>';
        }
    }

    loadHistoricalChat(item) {
        UI.setViewChat();
        document.getElementById('chat-messages-view').innerHTML = '';
        UI.addChatMessage('user', `📂 Reloaded from history — Content #${item.id}`);
        this.recentContent = item.response;
        UI.addChatMessage('ai', item.response);
        document.getElementById('current-chat-title').textContent = `History #${item.id}`;
        this.currentChat = null;
    }
}

document.addEventListener('DOMContentLoaded', () => { new App(); });
