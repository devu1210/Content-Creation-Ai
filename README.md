# 🚀 Content Creation AI

An AI-powered content creation platform that helps users generate high-quality content efficiently. The application provides a modern web interface with secure authentication, backend APIs, and AI-powered content generation.

---

## ✨ Features

- 🔐 User Authentication (Login & Registration)
- 🤖 AI-powered Content Generation
- 📝 Generate blogs, articles, captions, and marketing content
- 💾 SQLite Database Integration
- 🌐 REST API Backend
- 🎨 Responsive User Interface
- ⚡ Fast and Lightweight

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6)

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite

### Tools
- Git & GitHub
- REST APIs

---

## 📂 Project Structure

```
Content-Creation-AI/
│
├── backend/
│   ├── auth/
│   ├── routes/
│   ├── services/
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── schemas.py
│
├── frontend/
│   ├── css/
│   ├── js/
│   └── index.html
│
├── ui/
│
├── content_app.db
├── requirements.txt
├── run.py
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/devu1210/Content-Creation-Ai.git

cd Content-Creation-Ai
```

---

### 2. Create Virtual Environment

Windows

```bash
python -m venv venv

venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv venv

source venv/bin/activate
```

---

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Run the Backend

```bash
python run.py
```

or

```bash
uvicorn backend.main:app --reload
```

---

### 5. Open the Frontend

Simply open

```
frontend/index.html
```

or serve it using VS Code Live Server.

---

## 📡 API

The backend is built using FastAPI.

Example endpoint:

```
GET /
```

Additional endpoints include authentication and AI content generation APIs.

---

## 📸 Screenshots

You can add screenshots of:

- Login Page
- Dashboard
- Content Generator
- Generated Content

Example:

```
screenshots/
    login.png
    dashboard.png
    generator.png
```

---

## 🔮 Future Improvements

- Multiple AI Models
- Export Content as PDF
- Content History
- Dark Mode
- AI Image Generation
- Multi-language Support
- User Dashboard Analytics

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Add feature"
```

4. Push

```bash
git push origin feature-name
```

5. Open a Pull Request

---


---

⭐ If you found this project useful, consider giving it a Star on GitHub.
