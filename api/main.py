from fastapi import FastAPI, APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy import create_engine, Column, Integer, String, Boolean, JSON, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, Session, relationship
import uvicorn

# Base SQLite config
DATABASE_URL = "sqlite:///./game.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# SQLAlchemy Models
class CharacterDB(Base):
    __tablename__ = "characters"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    color = Column(String)
    power = Column(String)
    base_damage = Column(Integer)


class GameStateDB(Base):
    __tablename__ = "games"
    id = Column(Integer, primary_key=True, index=True)
    character_id = Column(Integer, ForeignKey("characters.id"))
    player_position = Column(Integer)
    health = Column(Integer)
    inventory = Column(JSON)
    message = Column(String)
    dice_result = Column(Integer, nullable=True)
    is_rolling = Column(Boolean, default=False)

    character = relationship("CharacterDB", backref="games")


class TileDB(Base):
    __tablename__ = "tiles"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    row = Column(Integer)
    col = Column(Integer)
    is_active = Column(Boolean)
    data = Column(JSON)
    game_id = Column(Integer, ForeignKey("games.id"))


# Create tables
Base.metadata.create_all(bind=engine)


# Pydantic Models
class Character(BaseModel):
    id: Optional[int] = None
    type: str
    color: str
    power: str
    base_damage: int

    class Config:
        orm_mode = True


class Tile(BaseModel):
    id: Optional[int] = None
    type: str
    row: int
    col: int
    is_active: bool
    data: dict

    class Config:
        orm_mode = True


class GameState(BaseModel):
    id: Optional[int] = None
    character: Character
    board: List[Tile]
    player_position: int
    health: int
    inventory: List[dict]
    message: str
    dice_result: Optional[int] = None
    is_rolling: bool = False

    class Config:
        orm_mode = True


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Routers
router = APIRouter()


@router.post("/characters", response_model=Character)
def create_character(character: Character, db: Session = Depends(get_db)):
    db_character = CharacterDB(**character.dict())
    db.add(db_character)
    db.commit()
    db.refresh(db_character)
    return db_character


@router.get("/characters", response_model=List[Character])
def get_characters(db: Session = Depends(get_db)):
    return db.query(CharacterDB).all()


@router.post("/games", response_model=GameState)
def create_game(game: GameState, db: Session = Depends(get_db)):
    db_character = (
        db.query(CharacterDB).filter(CharacterDB.id == game.character.id).first()
    )
    if not db_character:
        raise HTTPException(status_code=404, detail="Character not found")

    db_game = GameStateDB(
        character_id=db_character.id,
        player_position=game.player_position,
        health=game.health,
        inventory=game.inventory,
        message=game.message,
        dice_result=game.dice_result,
        is_rolling=game.is_rolling,
    )
    db.add(db_game)
    db.commit()
    db.refresh(db_game)

    # Save tiles
    for tile in game.board:
        db_tile = TileDB(**tile.dict(), game_id=db_game.id)
        db.add(db_tile)
    db.commit()

    # Retrieve saved tiles
    tiles = db.query(TileDB).filter(TileDB.game_id == db_game.id).all()

    return GameState(
        id=db_game.id,
        character=game.character,
        board=tiles,
        player_position=db_game.player_position,
        health=db_game.health,
        inventory=db_game.inventory,
        message=db_game.message,
        dice_result=db_game.dice_result,
        is_rolling=db_game.is_rolling,
    )


@router.get("/games", response_model=List[GameState])
def get_games(db: Session = Depends(get_db)):
    games = db.query(GameStateDB).all()
    results = []
    for game in games:
        character = (
            db.query(CharacterDB).filter(CharacterDB.id == game.character_id).first()
        )
        tiles = db.query(TileDB).filter(TileDB.game_id == game.id).all()
        results.append(
            GameState(
                id=game.id,
                character=character,
                board=tiles,
                player_position=game.player_position,
                health=game.health,
                inventory=game.inventory,
                message=game.message,
                dice_result=game.dice_result,
                is_rolling=game.is_rolling,
            )
        )
    return results


@router.get("/games/{game_id}", response_model=GameState)
def get_game(game_id: int, db: Session = Depends(get_db)):
    game = db.query(GameStateDB).filter(GameStateDB.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    character = (
        db.query(CharacterDB).filter(CharacterDB.id == game.character_id).first()
    )
    tiles = db.query(TileDB).filter(TileDB.game_id == game.id).all()
    return GameState(
        id=game.id,
        character=character,
        board=tiles,
        player_position=game.player_position,
        health=game.health,
        inventory=game.inventory,
        message=game.message,
        dice_result=game.dice_result,
        is_rolling=game.is_rolling,
    )


@router.put("/games/{game_id}", response_model=GameState)
def update_game(game_id: int, updated_game: GameState, db: Session = Depends(get_db)):
    game = db.query(GameStateDB).filter(GameStateDB.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    game.player_position = updated_game.player_position
    game.health = updated_game.health
    game.inventory = updated_game.inventory
    game.message = updated_game.message
    game.dice_result = updated_game.dice_result
    game.is_rolling = updated_game.is_rolling
    db.commit()

    # Update tiles
    db.query(TileDB).filter(TileDB.game_id == game.id).delete()
    for tile in updated_game.board:
        db_tile = TileDB(**tile.dict(), game_id=game.id)
        db.add(db_tile)
    db.commit()

    character = (
        db.query(CharacterDB).filter(CharacterDB.id == game.character_id).first()
    )
    tiles = db.query(TileDB).filter(TileDB.game_id == game.id).all()

    return GameState(
        id=game.id,
        character=character,
        board=tiles,
        player_position=game.player_position,
        health=game.health,
        inventory=game.inventory,
        message=game.message,
        dice_result=game.dice_result,
        is_rolling=game.is_rolling,
    )


# App
app = FastAPI()
app.include_router(router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Welcome to the RPG Board Game API"}
