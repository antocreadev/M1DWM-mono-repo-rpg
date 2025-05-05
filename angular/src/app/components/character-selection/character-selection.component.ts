import { Component, EventEmitter, Output } from '@angular/core';
import {CHARACTER_TYPES} from '../../constants/game-constants';
import {NgClass, NgForOf} from '@angular/common';


@Component({
  selector: 'app-character-selection',
  templateUrl: './character-selection.component.html',
  styleUrls: ['./character-selection.component.css'],
  standalone: true,
  imports: [
    NgClass,
    NgForOf
  ],
  // ou .scss, si tu utilises SCSS
})
export class CharacterSelectionComponent {
  characterTypes = CHARACTER_TYPES;

  @Output() selectCharacter = new EventEmitter<{ type: string; color: string }>();

  onSelect(character: any) {
    this.selectCharacter.emit({ type: character.name, color: character.color });
  }
}
