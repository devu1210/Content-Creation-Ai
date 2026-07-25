class ApiService {
    static getHeaders() {
        const token = localStorage.getItem('access_token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    static async login(email, password) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const res = await fetch(`${CONFIG.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });
        if (!res.ok) throw new Error((await res.json()).detail || 'Login failed');
        return await res.json();
    }

    static async signup(email, password) {
        const res = await fetch(`${CONFIG.API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error((await res.json()).detail || 'Signup failed');
        return await res.json();
    }

    static async loginGuest() {
        const res = await fetch(`${CONFIG.API_URL}/auth/guest`, {
            method: 'POST'
        });
        if (!res.ok) throw new Error('Guest login failed');
        return await res.json();
    }

    static async getHistory() {
        const res = await fetch(`${CONFIG.API_URL}/history/`, {
            headers: this.getHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch history');
        return await res.json();
    }

    static async generateContent(data) {
        const res = await fetch(`${CONFIG.API_URL}/generate/`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.detail || 'Generation failed');
        }
        return await res.json();
    }
}
