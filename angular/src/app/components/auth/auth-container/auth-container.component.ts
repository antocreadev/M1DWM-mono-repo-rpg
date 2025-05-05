import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-auth-container',
  standalone: true,
  imports: [CommonModule, LoginComponent, RegisterComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div class="w-full max-w-md">
        <ng-container *ngIf="showLogin; else registerTemplate">
          <app-login
            (onLoginSuccess)="onAuthSuccess()"
            (onRegisterClick)="switchToRegister()"
          ></app-login>
        </ng-container>

        <ng-template #registerTemplate>
          <app-register
            (onRegisterSuccess)="switchToLogin()"
            (onLoginClick)="switchToLogin()"
          ></app-register>
        </ng-template>
      </div>
    </div>
  `,
  styles: [],
})
export class AuthContainerComponent {
  showLogin = true;

  switchToLogin() {
    this.showLogin = true;
  }

  switchToRegister() {
    this.showLogin = false;
  }

  onAuthSuccess() {
    // Cette méthode sera remplacée par le composant parent qui l'utilise
    console.log('Authentification réussie!');
  }
}
