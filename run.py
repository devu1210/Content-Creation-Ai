"""
run.py - Single-command entry point for the AI Content Creator app.
Run from the project root: python run.py
Then open: http://localhost:8000
"""
import uvicorn
import os
import sys

# Add the project root to Python path so "backend" is importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"\n[INFO] AI Content Creator starting on http://localhost:{port}")
    print(f"       API Docs: http://localhost:{port}/docs\n")
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        reload_dirs=["backend"]
    )
