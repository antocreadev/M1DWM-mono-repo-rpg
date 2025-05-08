import { Injectable } from '@angular/core';
import { Tile, TileType, ItemType, EnemyType } from '../types/game-types';
import { GameDataService } from './game-data.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private tileTypes: Record<string, TileType> = {};
  private itemTypes: ItemType[] = [];
  private enemyTypes: EnemyType[] = [];
  private tileDescriptions: Record<TileType, string> = {} as Record<TileType, string>;

  constructor(private gameDataService: GameDataService) {
    // Initialize with default values from the service
    this.tileTypes = this.gameDataService.getTileTypes();
    this.itemTypes = this.gameDataService.getItemTypes();
    this.enemyTypes = this.gameDataService.getEnemyTypes();

    // Load tile descriptions
    this.gameDataService.getTileDescriptions().subscribe(descriptions => {
      this.tileDescriptions = descriptions;
    });
  }

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
      return this.tileTypes['START'];
    }

    const randomValue = Math.random();

    if (randomValue < 0.25) return this.tileTypes['ITEM'];
    if (randomValue < 0.5) return this.tileTypes['ENEMY'];
    if (randomValue < 0.65) return this.tileTypes['HEAL'];
    if (randomValue < 0.8) return this.tileTypes['TRAP'];
    if (randomValue < 0.95) return this.tileTypes['TELEPORT'];

    return this.tileTypes['EMPTY'];
  }

  private createTile(id: number, type: TileType, row: number, col: number, totalTiles: number): Tile {
    return {
      id,
      type,
      row,
      col,
      isActive: id === 0, // La première case est active au début
      data: {
        itemType: type === this.tileTypes['ITEM']
          ? this.itemTypes[Math.floor(Math.random() * this.itemTypes.length)]
          : undefined,
        enemyType: type === this.tileTypes['ENEMY']
          ? this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)]
          : undefined,
        destination: type === this.tileTypes['TELEPORT']
          ? Math.floor(Math.random() * totalTiles)
          : undefined,
        description: this.tileDescriptions[type],
      }
    };
  }
}
