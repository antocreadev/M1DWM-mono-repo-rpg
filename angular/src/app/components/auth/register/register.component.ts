import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="flex flex-col items-center justify-center bg-gray-900 text-white p-8 rounded-lg shadow-lg w-full max-w-md mx-auto mt-10"
    >
      <h1 class="text-3xl font-bold mb-6">Créer un compte</h1>

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

        <div class="mb-4">
          <label for="email" class="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            [(ngModel)]="email"
            name="email"
            class="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
            required
          />
        </div>

        <div class="mb-4">
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

        <div class="mb-6">
          <label for="confirmPassword" class="block text-sm font-medium mb-1">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            id="confirmPassword"
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
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
          {{ isLoading ? 'Inscription en cours...' : "S'inscrire" }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-400">
          Déjà un compte ?{" "}
          <button
            (click)="onLoginClick.emit()"
            class="text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  `,
  styles: [],
})
export class RegisterComponent {
  @Output() onRegisterSuccess = new EventEmitter<void>();
  @Output() onLoginClick = new EventEmitter<void>();

  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(private apiService: ApiService) {}

  async handleSubmit() {
    if (
      !this.username ||
      !this.email ||
      !this.password ||
      !this.confirmPassword
    ) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'Le mot de passe doit contenir au moins 8 caractères';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const response = await this.apiService
        .register(this.username, this.email, this.password)
        .toPromise();
      this.onRegisterSuccess.emit();
    } catch (err: any) {
      this.error =
        err.message || "Une erreur s'est produite lors de l'inscription";
    } finally {
      this.isLoading = false;
    }
  }
}
