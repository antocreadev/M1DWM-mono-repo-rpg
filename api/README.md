# API RPG Game

API FastAPI pour le jeu de rôle RPG avec système d'authentification et gestion de personnages.

## Fonctionnalités

- Authentification (création de compte, connexion)
- Gestion des personnages (création, modification, suppression)
- Gestion des sessions de jeu (sauvegarde, chargement)
- Support CORS pour les trois front-ends (React, Angular, Vue)

## Installation

1. Créer un environnement virtuel Python :

```bash
python -m venv .venv
source .venv/bin/activate  # Sur Linux/Mac
# ou
.venv\Scripts\activate     # Sur Windows
```

2. Installer les dépendances :

```bash
pip install fastapi uvicorn sqlalchemy pydantic[email] passlib[bcrypt] python-jose[cryptography] python-multipart
```

## Démarrer l'API

```bash
uvicorn app.main:app --reload
```

L'API sera disponible à l'adresse http://localhost:8000

## Documentation de l'API

Une fois l'API démarrée, vous pouvez accéder à la documentation interactive :

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints principaux

### Authentification

- POST `/api/auth/register` - Créer un nouveau compte
- POST `/api/auth/login` - Se connecter et obtenir un token JWT

### Personnages

- GET `/api/characters` - Obtenir tous les personnages de l'utilisateur
- POST `/api/characters` - Créer un nouveau personnage
- GET `/api/characters/{id}` - Obtenir un personnage spécifique
- PUT `/api/characters/{id}` - Mettre à jour un personnage
- DELETE `/api/characters/{id}` - Supprimer un personnage

### Sessions de jeu

- GET `/api/game-sessions` - Obtenir toutes les sessions de jeu de l'utilisateur
- POST `/api/game-sessions` - Créer une nouvelle session de jeu
- GET `/api/game-sessions/{id}` - Obtenir une session de jeu spécifique
- PUT `/api/game-sessions/{id}` - Mettre à jour une session de jeu
- DELETE `/api/game-sessions/{id}` - Supprimer une session de jeu
- POST `/api/game-sessions/{id}/tiles` - Ajouter des tuiles à une session de jeu
- POST `/api/game-sessions/{id}/enemy` - Ajouter/mettre à jour un ennemi dans une session de jeu
