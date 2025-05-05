import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Character {
  id: number;
  name: string;
  type: string;
  color: string;
  power: string;
  base_damage: number;
}

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="loading">
      <div class="flex justify-center items-center h-40">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>
    </ng-container>

    <ng-container *ngIf="!loading && characters.length === 0">
      <div class="bg-gray-700 rounded-lg p-6 text-center">
        <p class="text-white text-lg">
          Vous n'avez pas encore créé de personnage.
        </p>
        <p class="text-gray-400 mt-2">
          Créez votre premier personnage pour commencer l'aventure !
        </p>
      </div>
    </ng-container>

    <div
      *ngIf="!loading && characters.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        *ngFor="let character of characters"
        class="bg-gray-700 rounded-lg p-4 flex flex-col hover:bg-gray-600 transition-colors"
      >
        <div class="flex items-center mb-3">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
            [style.backgroundColor]="character.color"
          >
            {{ character.name.charAt(0) }}
          </div>
          <div class="ml-4">
            <h3 class="text-xl font-bold text-white">{{ character.name }}</h3>
            <p class="text-gray-300 capitalize">{{ character.type }}</p>
          </div>
        </div>

        <div class="text-sm text-gray-300 mb-4 flex-grow">
          <div class="flex justify-between mb-1">
            <span>Pouvoir:</span>
            <span class="font-medium">{{
              getPowerLabel(character.power)
            }}</span>
          </div>
          <div class="flex justify-between">
            <span>Dégâts de base:</span>
            <span class="font-medium">{{ character.base_damage }}</span>
          </div>
        </div>

        <div class="flex justify-between mt-auto">
          <button
            (click)="onSelect.emit(character)"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm"
          >
            Sélectionner
          </button>
          <button
            (click)="onDelete.emit(character.id)"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded text-sm"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class CharacterListComponent {
  @Input() characters: Character[] = [];
  @Input() loading: boolean = false;
  @Output() onSelect = new EventEmitter<Character>();
  @Output() onDelete = new EventEmitter<number>();

  getPowerLabel(power: string): string {
    switch (power) {
      case 'magic':
        return 'Magie';
      case 'strength':
        return 'Force';
      case 'lifesteal':
        return 'Vol de vie';
      default:
        return power;
    }
  }
}
