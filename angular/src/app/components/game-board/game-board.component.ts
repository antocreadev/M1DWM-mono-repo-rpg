import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import { TileIconComponent } from '../tile-icon/tile-icon.component';
import { TILE_COLORS } from '../../constants/game-constants';
import { Tile, Character } from '../../types/game-types';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [TileIconComponent],
  templateUrl: 'game-board.component.html',
  styles: []
})
export class GameBoardComponent  implements OnChanges {
  @Input() board: Tile[] = [];
  @Input() character: Character | null = null;

  size = 7;
  rows = Array(this.size).fill(0).map((_, i) => i);
  cols = Array(this.size).fill(0).map((_, i) => i);
  grid: (Tile | null)[][] = [];

  ngOnInit() {
    // Initialiser la grille
    this.grid = Array(this.size)
      .fill(null)
      .map(() => Array(this.size).fill(null));

    // Placer les cases du plateau dans la grille
    this.board.forEach((tile) => {
      this.grid[tile.row][tile.col] = tile;
    });
  }

  isEdge(row: number, col: number): boolean {
    return row === 0 || col === 0 || row === this.size - 1 || col === this.size - 1;
  }

  getTile(row: number, col: number): Tile | null {
    return this.grid[row][col];
  }

  getTileClasses(row: number, col: number): string {
    const tile = this.getTile(row, col);
    const baseClasses = 'w-16 h-16 border border-gray-400 flex items-center justify-center';
    return tile ? `${baseClasses} ${TILE_COLORS[tile.type]}` : `${baseClasses} bg-gray-200`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['board'] && this.board?.length > 0) {
      this.grid = Array(this.size)
        .fill(null)
        .map(() => Array(this.size).fill(null));

      this.board.forEach((tile) => {
        this.grid[tile.row][tile.col] = tile;
      });
    }
  }


}
