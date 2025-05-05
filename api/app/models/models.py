from sqlalchemy import Column, Integer, String, Boolean, JSON, ForeignKey, Table
from sqlalchemy.orm import relationship
from ..database.database import Base

# Association table for user-character relationship (one user can have many characters)
user_characters = Table(
    "user_characters",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("character_id", Integer, ForeignKey("characters.id")),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    # Relation avec les personnages créés par l'utilisateur
    characters = relationship(
        "Character", secondary=user_characters, back_populates="users"
    )
    # Relation avec les sessions de jeu de l'utilisateur
    game_sessions = relationship("GameSession", back_populates="user")


class Character(Base):
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # Nom du personnage
    type = Column(String)  # Type (guerrier, magicien, etc.)
    color = Column(String)
    power = Column(String)
    base_damage = Column(Integer)

    # Relation avec les utilisateurs qui possèdent ce personnage
    users = relationship("User", secondary=user_characters, back_populates="characters")
    # Relation avec les sessions de jeu utilisant ce personnage
    game_sessions = relationship("GameSession", back_populates="character")


class GameSession(Base):
    __tablename__ = "game_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    character_id = Column(Integer, ForeignKey("characters.id"))
    player_position = Column(Integer)
    health = Column(Integer)
    inventory = Column(JSON)
    message = Column(String)
    dice_result = Column(Integer, nullable=True)
    is_rolling = Column(Boolean, default=False)
    game_state = Column(String)  # État actuel du jeu (playing, combat, gameOver, etc.)

    # Relations
    user = relationship("User", back_populates="game_sessions")
    character = relationship("Character", back_populates="game_sessions")
    tiles = relationship(
        "Tile", back_populates="game_session", cascade="all, delete-orphan"
    )


class Tile(Base):
    __tablename__ = "tiles"

    id = Column(Integer, primary_key=True, index=True)
    game_session_id = Column(Integer, ForeignKey("game_sessions.id"))
    type = Column(String)
    row = Column(Integer)
    col = Column(Integer)
    is_active = Column(Boolean)
    data = Column(JSON)

    # Relations
    game_session = relationship("GameSession", back_populates="tiles")


class Enemy(Base):
    __tablename__ = "enemies"

    id = Column(Integer, primary_key=True, index=True)
    game_session_id = Column(Integer, ForeignKey("game_sessions.id"))
    type = Column(String)
    health = Column(Integer)
    max_health = Column(Integer)
    power = Column(Integer)
    weakness = Column(String, nullable=True)

    # Relation avec la session de jeu
    game_session = relationship("GameSession", backref="enemy")
