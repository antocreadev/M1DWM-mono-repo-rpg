uv venv   # crée l'environnement virtuel
source .venv/bin/activate  # active l'environnement virtuel

uv pip install -r pyproject.toml

uvicorn main:app --reload
