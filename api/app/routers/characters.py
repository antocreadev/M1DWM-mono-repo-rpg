from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.security import get_current_active_user
from ..schemas.character import Character, CharacterCreate
from ..database.database import get_db
from ..models.models import Character as CharacterModel, User

router = APIRouter(
    prefix="/characters",
    tags=["characters"],
    responses={404: {"description": "Non trouvé"}},
)


@router.post("/", response_model=Character)
async def create_character(
    character: CharacterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Créer un nouveau personnage pour l'utilisateur authentifié.
    """
    db_character = CharacterModel(
        name=character.name,
        type=character.type,
        color=character.color,
        power=character.power,
        base_damage=character.base_damage,
    )

    # Associer le personnage à l'utilisateur courant
    db_character.users.append(current_user)

    db.add(db_character)
    db.commit()
    db.refresh(db_character)

    return db_character


@router.get("/", response_model=List[Character])
async def read_characters(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Récupérer tous les personnages de l'utilisateur authentifié.
    """
    characters = (
        db.query(CharacterModel)
        .filter(CharacterModel.users.any(id=current_user.id))
        .offset(skip)
        .limit(limit)
        .all()
    )

    return characters


@router.get("/{character_id}", response_model=Character)
async def read_character(
    character_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Récupérer un personnage spécifique de l'utilisateur authentifié.
    """
    character = (
        db.query(CharacterModel)
        .filter(
            CharacterModel.id == character_id,
            CharacterModel.users.any(id=current_user.id),
        )
        .first()
    )

    if character is None:
        raise HTTPException(status_code=404, detail="Personnage non trouvé")

    return character


@router.put("/{character_id}", response_model=Character)
async def update_character(
    character_id: int,
    character: CharacterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Mettre à jour un personnage spécifique de l'utilisateur authentifié.
    """
    db_character = (
        db.query(CharacterModel)
        .filter(
            CharacterModel.id == character_id,
            CharacterModel.users.any(id=current_user.id),
        )
        .first()
    )

    if db_character is None:
        raise HTTPException(status_code=404, detail="Personnage non trouvé")

    # Mise à jour des attributs
    db_character.name = character.name
    db_character.type = character.type
    db_character.color = character.color
    db_character.power = character.power
    db_character.base_damage = character.base_damage

    db.commit()
    db.refresh(db_character)

    return db_character


@router.delete("/{character_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_character(
    character_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Supprimer un personnage spécifique de l'utilisateur authentifié.
    """
    db_character = (
        db.query(CharacterModel)
        .filter(
            CharacterModel.id == character_id,
            CharacterModel.users.any(id=current_user.id),
        )
        .first()
    )

    if db_character is None:
        raise HTTPException(status_code=404, detail="Personnage non trouvé")

    # Retirer le personnage de la liste des personnages de l'utilisateur
    current_user.characters.remove(db_character)

    # Si le personnage n'appartient à aucun autre utilisateur, le supprimer
    if not db_character.users:
        db.delete(db_character)

    db.commit()

    return None
