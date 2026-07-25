from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.database import engine, Base
from backend.routes import auth_routes, generate_routes, history_routes
import uvicorn
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Content Creation API", docs_url="/docs", redoc_url="/redoc")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes — must be declared BEFORE static file mounts
app.include_router(auth_routes.router)
app.include_router(generate_routes.router)
app.include_router(history_routes.router)

# Frontend static assets
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")

if os.path.exists(FRONTEND_DIR):
    # Mount css and js directories separately so they are accessible as /css/* and /js/*
    css_dir = os.path.join(FRONTEND_DIR, "css")
    js_dir  = os.path.join(FRONTEND_DIR, "js")
    assets_dir = os.path.join(FRONTEND_DIR, "assets")

    if os.path.exists(css_dir):
        app.mount("/css", StaticFiles(directory=css_dir), name="css")
    if os.path.exists(js_dir):
        app.mount("/js", StaticFiles(directory=js_dir), name="js")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/", response_class=FileResponse, include_in_schema=False)
    def serve_index():
        return os.path.join(FRONTEND_DIR, "index.html")
else:
    @app.get("/")
    def root():
        return {"message": "API is running. Access /docs for Swagger UI."}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
