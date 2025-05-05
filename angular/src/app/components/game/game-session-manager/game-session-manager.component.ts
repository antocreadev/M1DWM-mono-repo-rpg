import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api.service';

interface Character {
  id: number;
  name: string;
  type: string;
  color: string;
  power: string;
  base_damage: number;
}

interface GameSession {
  id: number;
  character: Character;
  player_position: number;
  health: number;
  inventory: any[];
  message: string;
  game_state: string;
}

@Component({
  selector: 'app-game-session-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4"
    >
      <div class="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-white">
            Parties sauvegardées pour {{ character.name }}
          </h1>
          <div>
            <button
              (click)="onStartNewGame.emit()"
              class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mr-2"
            >
              Nouvelle partie
            </button>
            <button
              (click)="onBack.emit()"
              class="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Retour
            </button>
          </div>
        </div>

        <div *ngIf="error" class="bg-red-600 text-white p-3 rounded mb-4">
          {{ error }}
        </div>

        <ng-container *ngIf="loading">
          <div class="flex justify-center items-center h-40">
            <div
              class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
            ></div>
          </div>
        </ng-container>

        <div
          *ngIf="!loading && gameSessions.length === 0"
          class="bg-gray-700 rounded-lg p-6 text-center"
        >
          <p class="text-white text-lg">
            Aucune partie sauvegardée pour ce personnage.
          </p>
          <p class="text-gray-400 mt-2">Démarrez une nouvelle aventure !</p>
        </div>

        <div
          *ngIf="!loading && gameSessions.length > 0"
          class="grid grid-cols-1 gap-4"
        >
          <div
            *ngFor="let session of gameSessions"
            class="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
          >
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-xl font-bold text-white">
                  {{ session.character.name }} - Niveau
                  {{ Math.floor(session.health / 10) }}
                </h3>
                <div class="text-sm text-gray-300 mt-1">
                  <div>État: {{ getGameStateLabel(session.game_state) }}</div>
                  <div>Santé: {{ session.health }}/100</div>
                  <div>Objets: {{ session.inventory.length }}</div>
                </div>
              </div>
              <div class="flex">
                <button
                  (click)="onLoadGame.emit(session)"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
                >
                  Charger
                </button>
                <button
                  (click)="handleDeleteSession(session.id)"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class GameSessionManagerComponent implements OnInit {
  @Input() character!: Character;
  @Output() onStartNewGame = new EventEmitter<void>();
  @Output() onLoadGame = new EventEmitter<GameSession>();
  @Output() onBack = new EventEmitter<void>();

  gameSessions: GameSession[] = [];
  loading: boolean = true;
  error: string = '';
  Math = Math; // Pour pouvoir l'utiliser dans le template

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadGameSessions();
  }

  loadGameSessions() {
    this.loading = true;
    this.error = '';

    this.apiService.getGameSessions().subscribe(
      (sessions) => {
        // Filtrer les sessions pour ne garder que celles avec le personnage actuel
        this.gameSessions = sessions.filter(
          (session) => session.character.id === this.character.id
        );
        this.loading = false;
      },
      (error) => {
        this.error = 'Erreur lors du chargement des parties sauvegardées';
        console.error(
          'Erreur lors du chargement des parties sauvegardées:',
          error
        );
        this.loading = false;
      }
    );
  }

  handleDeleteSession(sessionId: number) {
    if (
      !confirm('Êtes-vous sûr de vouloir supprimer cette partie sauvegardée ?')
    ) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.apiService.deleteGameSession(sessionId).subscribe(
      () => {
        this.gameSessions = this.gameSessions.filter(
          (session) => session.id !== sessionId
        );
        this.loading = false;
      },
      (error) => {
        this.error = 'Erreur lors de la suppression de la partie';
        console.error('Erreur lors de la suppression de la partie:', error);
        this.loading = false;
      }
    );
  }

  getGameStateLabel(state: string): string {
    switch (state) {
      case 'playing':
        return 'En jeu';
      case 'combat':
        return 'En combat';
      case 'gameOver':
        return 'Partie terminée';
      default:
        return state;
    }
  }
}
