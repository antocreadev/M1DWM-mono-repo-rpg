import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterCreationComponent } from '../character-creation/character-creation.component';
import { CharacterListComponent } from '../character-list/character-list.component';
import { ApiService } from '../../../services/api.service';

interface Character {
  id: number;
  name: string;
  type: string;
  color: string;
  power: string;
  base_damage: number;
}

@Component({
  selector: 'app-character-manager',
  standalone: true,
  imports: [CommonModule, CharacterCreationComponent, CharacterListComponent],
  template: `
    <div
      class="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4"
    >
      <div class="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-white">
            {{ showCreation ? 'Créer un personnage' : 'Mes personnages' }}
          </h1>
          <div>
            <button
              (click)="toggleCreationMode()"
              class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
            >
              {{
                showCreation ? 'Retour aux personnages' : 'Nouveau personnage'
              }}
            </button>
            <button
              (click)="onBackToMenu.emit()"
              class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Retour au menu
            </button>
          </div>
        </div>

        <div *ngIf="error" class="bg-red-600 text-white p-3 rounded mb-4">
          {{ error }}
        </div>

        <app-character-creation
          *ngIf="showCreation"
          (onCreateCharacter)="handleCreateCharacter($event)"
        ></app-character-creation>

        <app-character-list
          *ngIf="!showCreation"
          [characters]="characters"
          [loading]="loading"
          (onSelect)="onSelectCharacter.emit($event)"
          (onDelete)="handleDeleteCharacter($event)"
        ></app-character-list>
      </div>
    </div>
  `,
  styles: [],
})
export class CharacterManagerComponent implements OnInit {
  @Output() onSelectCharacter = new EventEmitter<Character>();
  @Output() onBackToMenu = new EventEmitter<void>();

  characters: Character[] = [];
  loading: boolean = true;
  error: string = '';
  showCreation: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters() {
    this.loading = true;
    this.error = '';

    this.apiService.getCharacters().subscribe(
      (data) => {
        this.characters = data;
        this.loading = false;
      },
      (error) => {
        this.error = 'Erreur lors du chargement des personnages';
        console.error('Erreur lors du chargement des personnages:', error);
        this.loading = false;
      }
    );
  }

  handleCreateCharacter(newCharacter: any) {
    this.loading = true;
    this.error = '';

    this.apiService.createCharacter(newCharacter).subscribe(
      (createdCharacter) => {
        this.characters = [...this.characters, createdCharacter];
        this.showCreation = false;
        this.loading = false;
      },
      (error) => {
        this.error = 'Erreur lors de la création du personnage';
        console.error('Erreur lors de la création du personnage:', error);
        this.loading = false;
      }
    );
  }

  handleDeleteCharacter(characterId: number) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce personnage ?')) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.apiService.deleteCharacter(characterId).subscribe(
      () => {
        this.characters = this.characters.filter((c) => c.id !== characterId);
        this.loading = false;
      },
      (error) => {
        this.error = 'Erreur lors de la suppression du personnage';
        console.error('Erreur lors de la suppression du personnage:', error);
        this.loading = false;
      }
    );
  }

  toggleCreationMode() {
    this.showCreation = !this.showCreation;
    this.error = '';
  }
}
