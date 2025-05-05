import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CharacterFormData {
  name: string;
  type: string;
  color: string;
  power: 'magic' | 'strength' | 'lifesteal';
  base_damage: number;
}

@Component({
  selector: 'app-character-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form (ngSubmit)="handleSubmit()" class="text-white">
      <div class="mb-4">
        <label for="name" class="block font-medium mb-1">
          Nom du personnage
        </label>
        <input
          type="text"
          id="name"
          name="name"
          [(ngModel)]="formData.name"
          class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
          required
          minlength="3"
          maxlength="20"
        />
      </div>

      <div class="mb-4">
        <label for="type" class="block font-medium mb-1">
          Type de personnage
        </label>
        <select
          id="type"
          name="type"
          [(ngModel)]="formData.type"
          (change)="updateTypeValues()"
          class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
          required
        >
          <option *ngFor="let type of characterTypes" [value]="type.id">
            {{ type.name }} (Dégâts de base: {{ type.baseDamage }})
          </option>
        </select>
      </div>

      <div class="mb-4">
        <label for="color" class="block font-medium mb-1"> Couleur </label>
        <select
          id="color"
          name="color"
          [(ngModel)]="formData.color"
          class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
          required
        >
          <option *ngFor="let color of colorOptions" [value]="color.id">
            {{ color.name }}
          </option>
        </select>
        <div
          class="mt-2 w-10 h-10 rounded-full border border-gray-600"
          [style.backgroundColor]="formData.color"
        ></div>
      </div>

      <div class="mb-4">
        <label for="power" class="block font-medium mb-1">
          Pouvoir spécial
        </label>
        <select
          id="power"
          name="power"
          [(ngModel)]="formData.power"
          class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
          required
        >
          <option *ngFor="let power of powerTypes" [value]="power.id">
            {{ power.name }} - {{ power.description }}
          </option>
        </select>
      </div>

      <div class="mb-6">
        <label for="base_damage" class="block font-medium mb-1">
          Dégâts de base
        </label>
        <input
          type="number"
          id="base_damage"
          name="base_damage"
          [(ngModel)]="formData.base_damage"
          class="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
          required
          min="5"
          max="15"
        />
      </div>

      <button
        type="submit"
        class="w-full p-3 rounded font-medium bg-green-600 hover:bg-green-700 transition text-white"
      >
        Créer le personnage
      </button>
    </form>
  `,
  styles: [],
})
export class CharacterCreationComponent {
  @Output() onCreateCharacter = new EventEmitter<CharacterFormData>();

  formData: CharacterFormData = {
    name: '',
    type: 'warrior',
    color: 'blue',
    power: 'strength',
    base_damage: 10,
  };

  characterTypes = [
    { id: 'warrior', name: 'Guerrier', baseDamage: 12, defaultColor: 'red' },
    { id: 'mage', name: 'Mage', baseDamage: 8, defaultColor: 'blue' },
    { id: 'rogue', name: 'Voleur', baseDamage: 10, defaultColor: 'green' },
    { id: 'cleric', name: 'Clerc', baseDamage: 9, defaultColor: 'yellow' },
    { id: 'archer', name: 'Archer', baseDamage: 11, defaultColor: 'purple' },
  ];

  powerTypes = [
    {
      id: 'strength',
      name: 'Force',
      description: 'Augmente les dégâts physiques',
    },
    { id: 'magic', name: 'Magie', description: 'Augmente les dégâts magiques' },
    {
      id: 'lifesteal',
      name: 'Vol de vie',
      description: 'Récupère des PV en attaquant',
    },
  ];

  colorOptions = [
    { id: 'red', name: 'Rouge' },
    { id: 'blue', name: 'Bleu' },
    { id: 'green', name: 'Vert' },
    { id: 'purple', name: 'Violet' },
    { id: 'orange', name: 'Orange' },
    { id: 'yellow', name: 'Jaune' },
    { id: 'teal', name: 'Turquoise' },
    { id: 'pink', name: 'Rose' },
  ];

  updateTypeValues() {
    const selectedType = this.characterTypes.find(
      (type) => type.id === this.formData.type
    );
    if (selectedType) {
      this.formData.base_damage = selectedType.baseDamage;
      this.formData.color = selectedType.defaultColor;
    }
  }

  handleSubmit() {
    this.onCreateCharacter.emit({ ...this.formData });
  }
}
