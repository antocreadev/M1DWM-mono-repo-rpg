from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.database import engine
from .models.models import Base
from .routers import auth, characters, game_sessions

# Création des tables dans la base de données
Base.metadata.create_all(bind=engine)

# Création de l'application FastAPI
app = FastAPI(
    title="RPG Game API",
    description="API pour le jeu de rôle RPG avec authentification et gestion des personnages",
    version="1.0.0",
)

# Configuration CORS pour permettre l'accès depuis les trois front-ends
origins = [
    "http://localhost:3000",  # React
    "http://localhost:4200",  # Angular
    "http://localhost:5173",  # Vue
    "http://127.0.0.1:3000",
    "http://127.0.0.1:4200",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routeurs
app.include_router(auth.router, prefix="/api")
app.include_router(characters.router, prefix="/api")
app.include_router(game_sessions.router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Welcome to the RPG Board Game API"}


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "API is running"}
