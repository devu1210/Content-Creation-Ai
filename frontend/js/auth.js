class Auth {
    static init() {
        this.checkAuth();

        // Sign out
        document.getElementById('btn-logout').addEventListener('click', () => this.logout());

        // Login form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const errEl = document.getElementById('login-error');
            const btn = document.getElementById('btn-login');

            errEl.classList.add('hidden');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Signing in...';

            try {
                const data = await ApiService.login(email, password);
                this.handleAuthSuccess(data.access_token, email, false);
            } catch (err) {
                errEl.textContent = err.message;
                errEl.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>Sign in</span><i class="fa-solid fa-arrow-right"></i>';
            }
        });

        // Signup form
        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const errEl = document.getElementById('signup-error');
            const btn = document.getElementById('btn-signup');

            errEl.classList.add('hidden');
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating account...';

            try {
                await ApiService.signup(email, password);
                // Auto login after signup
                const data = await ApiService.login(email, password);
                this.handleAuthSuccess(data.access_token, email, false);
                UI.showToast('Account created! Welcome aboard 🎉', 'success');
            } catch (err) {
                errEl.textContent = err.message;
                errEl.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<span>Create account</span><i class="fa-solid fa-arrow-right"></i>';
            }
        });

        // Guest
        document.getElementById('btn-guest').addEventListener('click', async () => {
            try {
                const data = await ApiService.loginGuest();
                this.handleAuthSuccess(data.access_token, 'Guest', true);
            } catch (err) {
                UI.showToast('Failed to continue as guest. Is the server running?', 'error');
            }
        });
    }

    static handleAuthSuccess(token, email, isGuest) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('user_email', email);
        localStorage.setItem('is_guest', isGuest);

        this.showApp(email, isGuest);

        if (!isGuest && window.App) {
            window.App.loadHistory();
        }
    }

    static checkAuth() {
        const token = localStorage.getItem('access_token');
        if (token) {
            const email = localStorage.getItem('user_email') || 'User';
            const isGuest = localStorage.getItem('is_guest') === 'true';
            this.showApp(email, isGuest);
        } else {
            this.showLogin();
        }
    }

    static showApp(email, isGuest) {
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('app-view').classList.remove('hidden');

        document.getElementById('user-display').textContent = email;
        document.getElementById('user-avatar').textContent = email.charAt(0).toUpperCase();
        document.getElementById('user-role-label').textContent = isGuest ? 'Guest' : 'Member';

        if (isGuest) {
            document.getElementById('guest-notice').classList.remove('hidden');
            document.querySelectorAll('.export-btn-guest-hidden').forEach(el => el.classList.add('hidden'));
            document.getElementById('history-list').innerHTML =
                '<div class="history-item" style="cursor:default;color:var(--text-muted);font-size:12px;"><i class="fa-solid fa-lock"></i><span>History disabled for guests</span></div>';
        } else {
            document.getElementById('guest-notice').classList.add('hidden');
            document.querySelectorAll('.export-btn-guest-hidden').forEach(el => el.classList.remove('hidden'));
        }
    }

    static showLogin() {
        document.getElementById('auth-view').classList.remove('hidden');
        document.getElementById('app-view').classList.add('hidden');
        document.getElementById('login-email').value = '';
        document.getElementById('login-password').value = '';
    }

    static logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('is_guest');
        this.showLogin();
    }
}
