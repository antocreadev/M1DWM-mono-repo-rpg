import { Injectable } from '@angular/core';
import { TILE_TYPES, ITEM_TYPES, ENEMY_TYPES, TILE_DESCRIPTIONS } from '../constants/game-constants';
import { Tile, TileType } from '../types/game-types';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  constructor() { }

  // Création du plateau de jeu
  createBoard(): Tile[] {
    // Créer un plateau carré de 7x7
    const size = 7;
    const boardTiles: Tile[] = [];
    const totalTiles = (size - 1) * 4; // Nombre total de cases sur le bord du plateau

    // Créer les cases dans l'ordre du parcours (sens horaire à partir du coin supérieur gauche)
    for (let i = 0; i < totalTiles; i++) {
      const { row, col } = this.calculateTilePosition(i, size);
      const tileType = this.determineTileType(i, totalTiles);

      boardTiles.push(this.createTile(i, tileType, row, col, totalTiles));
    }

    return boardTiles;
  }

  private calculateTilePosition(i: number, size: number): { row: number, col: number } {
    let row = 0;
    let col = 0;

    if (i < size) {
      // Bord supérieur (de gauche à droite)
      row = 0;
      col = i;
    } else if (i < size * 2 - 1) {
      // Bord droit (de haut en bas)
      row = i - size + 1;
      col = size - 1;
    } else if (i < size * 3 - 2) {
      // Bord inférieur (de droite à gauche)
      row = size - 1;
      col = size - 1 - (i - (size * 2 - 1));
    } else {
      // Bord gauche (de bas en haut)
      row = size - 1 - (i - (size * 3 - 2));
      col = 0;
    }

    return { row, col };
  }

  private determineTileType(index: number, totalTiles: number): TileType {
    if (index === 0) {
      return TILE_TYPES.START;
    }

    const randomValue = Math.random();

    if (randomValue < 0.25) return TILE_TYPES.ITEM;
    if (randomValue < 0.5) return TILE_TYPES.ENEMY;
    if (randomValue < 0.65) return TILE_TYPES.HEAL;
    if (randomValue < 0.8) return TILE_TYPES.TRAP;
    if (randomValue < 0.95) return TILE_TYPES.TELEPORT;

    return TILE_TYPES.EMPTY;
  }

  private createTile(id: number, type: TileType, row: number, col: number, totalTiles: number): Tile {
    return {
      id,
      type,
      row,
      col,
      isActive: id === 0, // La première case est active au début
      data: {
        itemType: type === TILE_TYPES.ITEM
          ? ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)]
          : undefined,
        enemyType: type === TILE_TYPES.ENEMY
          ? ENEMY_TYPES[Math.floor(Math.random() * ENEMY_TYPES.length)]
          : undefined,
        destination: type === TILE_TYPES.TELEPORT
          ? Math.floor(Math.random() * totalTiles)
          : undefined,
        description: TILE_DESCRIPTIONS[type],
      }
    };
  }
}
