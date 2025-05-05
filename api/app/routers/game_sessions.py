from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.security import get_current_active_user
from ..schemas.game_session import (
    GameSession,
    GameSessionCreate,
    Tile as TileSchema,
    Enemy as EnemySchema,
)
from ..database.database import get_db
from ..models.models import (
    GameSession as GameSessionModel,
    Character,
    Tile,
    Enemy,
    User,
)

router = APIRouter(
    prefix="/game-sessions",
    tags=["game_sessions"],
    responses={404: {"description": "Non trouvé"}},
)


@router.post("/", response_model=GameSession)
async def create_game_session(
    game_session: GameSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Créer une nouvelle session de jeu pour l'utilisateur authentifié.
    """
    # Vérifier si le personnage existe et appartient à l'utilisateur
    character = (
        db.query(Character)
        .filter(
            Character.id == game_session.character_id,
            Character.users.any(id=current_user.id),
        )
        .first()
    )

    if character is None:
        raise HTTPException(status_code=404, detail="Personnage non trouvé")

    # Créer la session de jeu
    db_game_session = GameSessionModel(
        user_id=current_user.id,
        character_id=character.id,
        player_position=game_session.player_position,
        health=game_session.health,
        inventory=game_session.inventory,
        message=game_session.message,
        dice_result=game_session.dice_result,
        is_rolling=game_session.is_rolling,
        game_state=game_session.game_state,
    )

    db.add(db_game_session)
    db.commit()
    db.refresh(db_game_session)

    return db_game_session


@router.get("/", response_model=List[GameSession])
async def read_game_sessions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Récupérer toutes les sessions de jeu de l'utilisateur authentifié.
    """
    game_sessions = (
        db.query(GameSessionModel)
        .filter(GameSessionModel.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return game_sessions


@router.get("/{game_session_id}", response_model=GameSession)
async def read_game_session(
    game_session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Récupérer une session de jeu spécifique de l'utilisateur authentifié.
    """
    game_session = (
        db.query(GameSessionModel)
        .filter(
            GameSessionModel.id == game_session_id,
            GameSessionModel.user_id == current_user.id,
        )
        .first()
    )

    if game_session is None:
        raise HTTPException(status_code=404, detail="Session de jeu non trouvée")

    return game_session


@router.put("/{game_session_id}", response_model=GameSession)
async def update_game_session(
    game_session_id: int,
    game_session_update: GameSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Mettre à jour une session de jeu spécifique de l'utilisateur authentifié.
    """
    db_game_session = (
        db.query(GameSessionModel)
        .filter(
            GameSessionModel.id == game_session_id,
            GameSessionModel.user_id == current_user.id,
        )
        .first()
    )

    if db_game_session is None:
        raise HTTPException(status_code=404, detail="Session de jeu non trouvée")

    # Vérifier si le personnage existe et appartient à l'utilisateur
    character = (
        db.query(Character)
        .filter(
            Character.id == game_session_update.character_id,
            Character.users.any(id=current_user.id),
        )
        .first()
    )

    if character is None:
        raise HTTPException(status_code=404, detail="Personnage non trouvé")

    # Mise à jour des attributs
    db_game_session.character_id = character.id
    db_game_session.player_position = game_session_update.player_position
    db_game_session.health = game_session_update.health
    db_game_session.inventory = game_session_update.inventory
    db_game_session.message = game_session_update.message
    db_game_session.dice_result = game_session_update.dice_result
    db_game_session.is_rolling = game_session_update.is_rolling
    db_game_session.game_state = game_session_update.game_state

    db.commit()
    db.refresh(db_game_session)

    return db_game_session


@router.delete("/{game_session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_game_session(
    game_session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Supprimer une session de jeu spécifique de l'utilisateur authentifié.
    """
    db_game_session = (
        db.query(GameSessionModel)
        .filter(
            GameSessionModel.id == game_session_id,
            GameSessionModel.user_id == current_user.id,
        )
        .first()
    )

    if db_game_session is None:
        raise HTTPException(status_code=404, detail="Session de jeu non trouvée")

    # Supprimer la session de jeu
    db.delete(db_game_session)
    db.commit()

    return None


@router.post("/{game_session_id}/tiles", response_model=List[TileSchema])
async def add_tiles_to_game_session(
    game_session_id: int,
    tiles: List[TileSchema],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Ajouter des tuiles à une session de jeu spécifique.
    """
    # Vérifier si la session de jeu existe et appartient à l'utilisateur
    db_game_session = (
        db.query(GameSessionModel)
        .filter(
            GameSessionModel.id == game_session_id,
            GameSessionModel.user_id == current_user.id,
        )
        .first()
    )

    if db_game_session is None:
        raise HTTPException(status_code=404, detail="Session de jeu non trouvée")

    # Supprimer les tuiles existantes
    db.query(Tile).filter(Tile.game_session_id == game_session_id).delete()

    # Ajouter les nouvelles tuiles
    db_tiles = []
    for tile in tiles:
        db_tile = Tile(
            game_session_id=game_session_id,
            type=tile.type,
            row=tile.row,
            col=tile.col,
            is_active=tile.is_active,
            data=tile.data,
        )
        db.add(db_tile)
        db_tiles.append(db_tile)

    db.commit()

    # Rafraîchir les objets
    for db_tile in db_tiles:
        db.refresh(db_tile)

    return db_tiles


@router.post("/{game_session_id}/enemy", response_model=EnemySchema)
async def add_enemy_to_game_session(
    game_session_id: int,
    enemy: EnemySchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Ajouter ou mettre à jour un ennemi à une session de jeu spécifique.
    """
    # Vérifier si la session de jeu existe et appartient à l'utilisateur
    db_game_session = (
        db.query(GameSessionModel)
        .filter(
            GameSessionModel.id == game_session_id,
            GameSessionModel.user_id == current_user.id,
        )
        .first()
    )

    if db_game_session is None:
        raise HTTPException(status_code=404, detail="Session de jeu non trouvée")

    # Supprimer l'ennemi existant s'il y en a un
    db.query(Enemy).filter(Enemy.game_session_id == game_session_id).delete()

    # Ajouter le nouvel ennemi
    db_enemy = Enemy(
        game_session_id=game_session_id,
        type=enemy.type,
        health=enemy.health,
        max_health=enemy.max_health,
        power=enemy.power,
        weakness=enemy.weakness,
    )

    db.add(db_enemy)
    db.commit()
    db.refresh(db_enemy)

    return db_enemy
