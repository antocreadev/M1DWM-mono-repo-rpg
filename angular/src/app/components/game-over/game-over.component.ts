import { Component, Input, Output, EventEmitter } from '@angular/core';
import {Character, Item} from '../../types/game-types';

@Component({
  selector: 'app-game-over',
  templateUrl: "game-over.component.html",
  standalone: true,
  styles: []
})
export class GameOverComponent {
  @Input() health!: number;
  @Input() character: Character | null = null;
  @Input() inventory: Item[] = [];
  @Output() onRestart = new EventEmitter<void>();

  get hasWon(): boolean {
    return this.health > 0;
  }
}
