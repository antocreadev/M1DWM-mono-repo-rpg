import { Component, Input } from '@angular/core';
import { NgSwitch, NgSwitchCase } from '@angular/common';

import { TILE_TYPES } from '../../constants/game-constants';
import { TileType } from '../../types/game-types';

// Import du seul composant nécessaire de lucide-angular
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-tile-icon',
  standalone: true,
  imports: [
    NgSwitch,
    NgSwitchCase,
    LucideAngularModule
  ],
  template: `
    <ng-container [ngSwitch]="type">
      <!-- START -->
      <svg *ngSwitchCase="TILE_TYPES.START" class="icon text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>

      <!-- ITEM -->
      <svg *ngSwitchCase="TILE_TYPES.ITEM" class="icon text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 12 20 22 4 22 4 12"></polyline>
        <rect x="2" y="7" width="20" height="5"></rect>
        <line x1="12" y1="22" x2="12" y2="7"></line>
        <line x1="7" y1="2" x2="17" y2="2"></line>
        <line x1="7" y1="2" x2="7" y2="7"></line>
        <line x1="17" y1="2" x2="17" y2="7"></line>
      </svg>

      <!-- ENEMY -->
      <svg *ngSwitchCase="TILE_TYPES.ENEMY" class="icon text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="4"></circle>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
      </svg>

      <!-- HEAL -->
      <svg *ngSwitchCase="TILE_TYPES.HEAL" class="icon text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>

      <!-- TRAP -->
      <svg *ngSwitchCase="TILE_TYPES.TRAP" class="icon text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="2" x2="12" y2="22"></line>
        <line x1="2" y1="12" x2="22" y2="12"></line>
      </svg>

      <!-- TELEPORT -->
      <svg *ngSwitchCase="TILE_TYPES.TELEPORT" class="icon text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v4"></path>
        <path d="M12 18v4"></path>
        <path d="M4.93 4.93l2.83 2.83"></path>
        <path d="M16.24 16.24l2.83 2.83"></path>
        <path d="M2 12h4"></path>
        <path d="M18 12h4"></path>
        <path d="M4.93 19.07l2.83-2.83"></path>
        <path d="M16.24 7.76l2.83-2.83"></path>
      </svg>
    </ng-container>


  `,
  styles: [`
    .icon {
      width: 24px;
      height: 24px;
    }

  `]
})
export class TileIconComponent {
  @Input() type: TileType | undefined;
  protected TILE_TYPES = TILE_TYPES;
}
