import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="flex flex-col items-center justify-center bg-gray-900 text-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto mt-10"
    >
      <h1 class="text-3xl font-bold mb-6">Connexion</h1>

      <div
        *ngIf="error"
        class="w-full bg-red-600 text-white p-3 rounded mb-4 text-center"
      >
        {{ error }}
      </div>

      <form (ngSubmit)="handleSubmit()" class="w-full">
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium mb-1">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            id="username"
            [(ngModel)]="username"
            name="username"
            class="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
            required
          />
        </div>

        <div class="mb-6">
          <label for="password" class="block text-sm font-medium mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            [(ngModel)]="password"
            name="password"
            class="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
            required
          />
        </div>

        <button
          type="submit"
          [disabled]="isLoading"
          class="w-full p-3 rounded font-medium"
          [ngClass]="
            isLoading
              ? 'bg-blue-700 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          "
        >
          {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-400">
          Pas encore de compte ?
          <button
            (click)="onRegisterClick.emit()"
            class="text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  `,
  styles: [],
})
export class LoginComponent {
  @Output() onLoginSuccess = new EventEmitter<void>();
  @Output() onRegisterClick = new EventEmitter<void>();

  username: string = '';
  password: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(private apiService: ApiService) {}

  async handleSubmit() {
    if (!this.username || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const success = await this.apiService
        .login(this.username, this.password)
        .toPromise();
      if (success) {
        this.onLoginSuccess.emit();
      } else {
        this.error = "Nom d'utilisateur ou mot de passe incorrect";
      }
    } catch (err: any) {
      this.error =
        err.message || "Une erreur s'est produite lors de la connexion";
    } finally {
      this.isLoading = false;
    }
  }
}
