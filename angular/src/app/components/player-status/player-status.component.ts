import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Character, Item } from '../../types/game-types';
import {NgForOf, NgIf, NgTemplateOutlet, SlicePipe} from '@angular/common';

@Component({
  selector: 'app-player-status',
  template: `
    <div>
      <div class="mb-4">
        <h2 class="text-xl font-semibold mb-2">État du joueur</h2>
        <div class="flex items-center mb-2">
          <div
            [class]="'w-10 h-10 rounded-full bg-' + character?.color + '-500 mr-3 flex items-center justify-center text-white font-bold'"
          >
            {{ character?.type?.[0] }}
          </div>
          <div class="flex-1">
            <p class="font-semibold">{{ character?.type }}</p>
            <div class="flex items-center">
              <div class="bg-gray-200 h-4 w-32 rounded-full mr-2  ">
                <div
                  class="bg-green-500 h-4 rounded-full"
                  [style.width.%]="health"
                ></div>
              </div>
              <span class="text-sm">{{ health }}/100</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <h2 class="text-xl font-semibold mb-2">Inventaire</h2>
        <ng-container *ngTemplateOutlet="inventoryPreview"></ng-container>
      </div>
    </div>

    <ng-template #inventoryPreview>
      <ng-container *ngIf="inventory.length === 0; else hasItems">
        <p class="text-gray-500">Aucun objet</p>
      </ng-container>

      <ng-template #hasItems>
        <div class="flex flex-wrap gap-2 mb-2">
          <div *ngFor="let entry of groupedItems | slice:0:3"
               class="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded text-sm">
            <span>{{ entry.item.icon }}</span>
            <span>{{ entry.item.name }}</span>
            <span *ngIf="entry.count > 1" class="text-xs">({{ entry.count }})</span>
          </div>
        </div>
        <p *ngIf="inventory.length > 3" class="text-xs text-gray-500">
          + {{ inventory.length - 3 }} autre{{ inventory.length - 3 > 1 ? 's' : '' }}
          objet{{ inventory.length - 3 > 1 ? 's' : '' }}
        </p>
        <button
          (click)="onOpenInventory.emit()"
          class="mt-2 text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none"
        >
          Voir tout l'inventaire
        </button>
      </ng-template>
    </ng-template>
  `,
  standalone: true,
  imports: [
    SlicePipe,
    NgForOf,
    NgIf,
    NgTemplateOutlet
  ],
  styles: []
})
export class PlayerStatusComponent {
  @Input() character: Character | null = null;
  @Input() health: number = 0;
  @Input() inventory: Item[] = [];
  @Output() onOpenInventory = new EventEmitter<void>();

  get groupedItems(): { item: Item; count: number }[] {
    const itemCounts: Record<string, { item: Item; count: number }> = {};
    this.inventory.forEach((item) => {
      const key = item.id;
      if (!itemCounts[key]) {
        itemCounts[key] = { item, count: 1 };
      } else {
        itemCounts[key].count++;
      }
    });
    return Object.values(itemCounts);
  }
}
