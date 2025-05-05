from pydantic import BaseModel
from typing import List, Optional, Literal


class CharacterBase(BaseModel):
    name: str
    type: str
    color: str
    power: Literal["magic", "strength", "lifesteal"]
    base_damage: int


class CharacterCreate(CharacterBase):
    pass


class Character(CharacterBase):
    id: int

    class Config:
        orm_mode = True
