from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Literal
from .character import Character


class TileBase(BaseModel):
    type: str
    row: int
    col: int
    is_active: bool
    data: Dict[str, Any]


class TileCreate(TileBase):
    pass


class Tile(TileBase):
    id: int
    game_session_id: int

    class Config:
        orm_mode = True


class EnemyBase(BaseModel):
    type: str
    health: int
    max_health: int
    power: int
    weakness: Optional[Literal["magic", "physical", "none"]] = "none"


class EnemyCreate(EnemyBase):
    pass


class Enemy(EnemyBase):
    id: int
    game_session_id: int

    class Config:
        orm_mode = True


class ItemBase(BaseModel):
    id: str
    name: str
    type: str
    description: str
    effect: Dict[str, Any]
    usableInCombat: bool
    icon: str


class Item(ItemBase):
    pass


class GameSessionBase(BaseModel):
    player_position: int
    health: int
    inventory: List[Dict[str, Any]]
    message: str
    dice_result: Optional[int] = None
    is_rolling: bool = False
    game_state: str


class GameSessionCreate(GameSessionBase):
    character_id: int


class GameSession(GameSessionBase):
    id: int
    user_id: int
    character: Character
    tiles: List[Tile]
    enemy: Optional[Enemy] = None

    class Config:
        orm_mode = True
