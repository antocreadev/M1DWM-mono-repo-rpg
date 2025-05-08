// src/app/services/game-data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, forkJoin } from 'rxjs';
import { map, tap, shareReplay, catchError } from 'rxjs/operators';
import { Character, Enemy, Item, TileType, EnemyType, ItemType } from '../types/game-types';
import { GAME_ITEMS, ENEMY_DESCRIPTIONS, TILE_DESCRIPTIONS, TILE_COLORS, CHARACTER_TYPES } from '../constants/game-constants';

export interface GameState {
  playerHealth: number;
  inventory: Item[];
  position: number;
  score: number;
  character: Character;
}

export interface CharacterType {
  id: string;
  name: string;
  color: string;
  power: 'magic' | 'strength' | 'lifesteal';
  description: string;
  damage: number;
  baseDamage: number;
  lifeStealRatio?: number;
}

export interface EnemyDescription {
  name: string;
  description: string;
  weakness: 'physical' | 'magic';
}

@Injectable({
  providedIn: 'root'
})
export class GameDataService {
  private dataPath = 'assets/data/';
  private gameState = new BehaviorSubject<GameState | null>(null);

  // Cache for data
  private itemsCache$: Observable<Record<string, Item>> | null = null;
  private enemiesCache$: Observable<Record<string, EnemyDescription>> | null = null;
  private tilesCache$: Observable<{
    colors: Record<TileType, string>;
    descriptions: Record<TileType, string>;
  }> | null = null;
  private charactersCache$: Observable<CharacterType[]> | null = null;

  // Constants
  private tileTypes: Record<string, TileType> = {
    START: "start",
    ITEM: "item",
    ENEMY: "enemy",
    HEAL: "heal",
    TRAP: "trap",
    TELEPORT: "teleport",
    EMPTY: "empty",
  };

  private itemTypes: ItemType[] = ["potion", "sword", "shield", "amulet", "scroll"];
  private enemyTypes: EnemyType[] = ["goblin", "skeleton", "ghost", "dragon", "witch"];

  constructor(private http: HttpClient) {
    this.loadInitialState();
  }

  private loadInitialState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      this.gameState.next(JSON.parse(savedState));
    }
  }

  getTileTypes(): Record<string, TileType> {
    return { ...this.tileTypes };
  }

  getItemTypes(): ItemType[] {
    return [...this.itemTypes];
  }

  getEnemyTypes(): EnemyType[] {
    return [...this.enemyTypes];
  }

  getItems(): Observable<Record<string, Item>> {
    if (!this.itemsCache$) {
      this.itemsCache$ = this.http.get<Record<string, Item>>(`${this.dataPath}items.json`).pipe(
        catchError(error => {
          console.error('Error loading items:', error);
          console.log('Using fallback items data');
          return of(GAME_ITEMS as unknown as Record<string, Item>);
        }),
        shareReplay(1)
      );
    }
    return this.itemsCache$;
  }

  getEnemies(): Observable<Record<string, EnemyDescription>> {
    if (!this.enemiesCache$) {
      this.enemiesCache$ = this.http.get<Record<string, EnemyDescription>>(`${this.dataPath}enemies.json`).pipe(
        catchError(error => {
          console.error('Error loading enemies:', error);
          console.log('Using fallback enemies data');
          return of(ENEMY_DESCRIPTIONS as Record<string, EnemyDescription>);
        }),
        shareReplay(1)
      );
    }
    return this.enemiesCache$;
  }

  getTileData(): Observable<{
    colors: Record<TileType, string>;
    descriptions: Record<TileType, string>;
  }> {
    if (!this.tilesCache$) {
      this.tilesCache$ = this.http.get<any>(`${this.dataPath}tiles.json`).pipe(
        catchError(error => {
          console.error('Error loading tiles:', error);
          console.log('Using fallback tiles data');
          return of({
            colors: TILE_COLORS,
            descriptions: TILE_DESCRIPTIONS
          });
        }),
        shareReplay(1)
      );
    }
    return this.tilesCache$;
  }

  getCharacters(): Observable<CharacterType[]> {
    if (!this.charactersCache$) {
      this.charactersCache$ = this.http.get<CharacterType[]>(`${this.dataPath}characters.json`).pipe(
        catchError(error => {
          console.error('Error loading characters:', error);
          console.log('Using fallback characters data');
          return of(CHARACTER_TYPES);
        }),
        shareReplay(1)
      );
    }
    return this.charactersCache$;
  }

  getRandomItem(): Observable<Item> {
    return this.getItems().pipe(
      map(items => {
        const itemArray = Object.values(items);
        const randomIndex = Math.floor(Math.random() * itemArray.length);
        const item = { ...itemArray[randomIndex] };
        if (item.effect.uses) {
          item.effect.currentUses = item.effect.uses;
        }
        return item;
      })
    );
  }

  getTileDescriptions(): Observable<Record<TileType, string>> {
    return this.getTileData().pipe(
      map(data => data.descriptions)
    );
  }

  getTileColors(): Observable<Record<TileType, string>> {
    return this.getTileData().pipe(
      map(data => data.colors)
    );
  }

  getEnemyDescriptions(): Observable<Record<EnemyType, EnemyDescription>> {
    return this.getEnemies();
  }

  getCharacterByType(type: string): Observable<CharacterType | undefined> {
    return this.getCharacters().pipe(
      map(characters => characters.find(c => c.name === type))
    );
  }

  getAllData(): Observable<{
    items: Record<string, Item>,
    enemies: Record<string, EnemyDescription>,
    tiles: {
      colors: Record<TileType, string>,
      descriptions: Record<TileType, string>
    },
    characters: CharacterType[]
  }> {
    return forkJoin({
      items: this.getItems(),
      enemies: this.getEnemies(),
      tiles: this.getTileData(),
      characters: this.getCharacters()
    });
  }

  saveGameState(state: GameState): Observable<boolean> {
    localStorage.setItem('gameState', JSON.stringify(state));
    this.gameState.next(state);
    return of(true);
  }

  getCurrentGameState(): Observable<GameState | null> {
    return this.gameState.asObservable();
  }

  clearGameState(): Observable<boolean> {
    localStorage.removeItem('gameState');
    this.gameState.next(null);
    return of(true);
  }
}
