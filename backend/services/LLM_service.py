import os
import requests
import google.generativeai as genai
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


# SYSTEM PROMPT

SYSTEM_PROMPT = """
You are a professional AI content generation engine.
Your ONLY task is to generate the requested content.

STRICT RULES:
- DO NOT ask questions.
- DO NOT ask for clarification.
- DO NOT introduce yourself.
- DO NOT explain anything.
- ONLY generate the requested content.
"""


# PRIMARY MODEL CONFIGURATION
PRIMARY_MODEL = "gemini"


# GEMINI SETUP
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_model = None

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # Try gemini-1.5-flash first (stable), fallback model names for compatibility
        gemini_model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:
        print(f"Gemini setup error: {e}")


def ask_gemini(prompt):
    if not gemini_model:
        return None
    try:
        response = gemini_model.generate_content(
            SYSTEM_PROMPT + "\nUser request:\n" + prompt
        )
        return response.text
    except Exception as e:
        print("Gemini Error:", e)
        return None


# NVIDIA SETUP
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
nvidia_client = None

if NVIDIA_API_KEY:
    try:
        nvidia_client = OpenAI(
            api_key=NVIDIA_API_KEY,
            base_url="https://integrate.api.nvidia.com/v1"
        )
    except Exception as e:
        print(f"NVIDIA setup error: {e}")


def ask_nvidia(prompt):
    if not nvidia_client:
        return None
    try:
        response = nvidia_client.chat.completions.create(
            model="nvidia/nemotron-mini-4b-instruct",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        return response.choices[0].message.content
    except Exception as e:
        print("NVIDIA Error:", e)
        return None


# OLLAMA SETUP

def ask_ollama(prompt):
    try:
        url = "http://localhost:11434/api/generate"
        data = {
            "model": "llama3",
            "prompt": SYSTEM_PROMPT + "\nUser request:\n" + prompt,
            "stream": False
        }
        response = requests.post(url, json=data, timeout=30)
        return response.json()["response"]
    except Exception as e:
        print("Ollama Error:", e)
        return None


# MAIN GENERATION FUNCTION

def generate_response(prompt):
    # PRIMARY → GEMINI
    if PRIMARY_MODEL == "gemini":
        result = ask_gemini(prompt)
        if result:
            print("Model used: Gemini")
            return result

        print("Gemini failed, switching to NVIDIA...")
        result = ask_nvidia(prompt)
        if result:
            print("Model used: NVIDIA")
            return result

        print("NVIDIA failed, switching to Ollama...")
        result = ask_ollama(prompt)
        if result:
            print("Model used: Ollama")
            return result

    return "All models failed."
