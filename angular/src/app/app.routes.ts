import { Routes } from '@angular/router';
import { RpgBoardGameComponent } from './components/game/game.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ScoresComponent } from './components/scores/scores.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: RpgBoardGameComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'scores', component: ScoresComponent, canActivate: [AuthGuard] },
  // Redirect any unknown paths to login
  { path: '**', redirectTo: 'login' }
];
