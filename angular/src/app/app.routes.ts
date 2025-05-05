import { Routes } from '@angular/router';
import {CharacterSelectionComponent} from './components/character-selection/character-selection.component';
import {RpgBoardGameComponent} from './components/game/game.component';


export const routes: Routes = [
  { path: '', component: RpgBoardGameComponent },
];
