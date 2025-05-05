import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Character, Enemy, Item } from '../../types/game-types';
import { ENEMY_DESCRIPTIONS } from '../../constants/game-constants';
import {InventoryModalComponent} from '../inventory-modal/inventory-modal.component';
import {NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-combat-screen',
  templateUrl: './combat-screen.component.html',
  standalone: true,
  imports: [
    InventoryModalComponent,
    NgIf,
    NgForOf,
    NgClass
  ],
  styleUrls: ['./combat-screen.component.css']
})
export class CombatScreenComponent implements OnChanges {
  @Input() character: Character | null = null;
  @Input() enemy: Enemy | null = null;
  @Input() health: number = 0;
  @Input() message: string = '';
  @Input() inventory: Item[] = [];
  @Input() isPlayerAttacking: boolean = false;
  @Input() isEnemyAttacking: boolean = false;
  @Output() attack = new EventEmitter<void>();
  @Output() useItem = new EventEmitter<Item>();

  combatLog: string[] = [];
  isInventoryOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message'] && changes['message'].currentValue) {
      this.updateCombatLog(changes['message'].currentValue);
    }
  }

  private updateCombatLog(newMessage: string): void {
    this.combatLog = [...this.combatLog, newMessage];
    // Limiter le nombre de messages dans le log
    if (this.combatLog.length > 5) {
      this.combatLog = this.combatLog.slice(this.combatLog.length - 5);
    }
  }

  getEnemyDescription(enemyType: string): string {
    return ENEMY_DESCRIPTIONS[enemyType as keyof typeof ENEMY_DESCRIPTIONS]?.description ||
      'Un adversaire redoutable.';
  }

  getWeaknessText(weakness?: string): string {
    if (!weakness || weakness === 'none') return 'Aucune faiblesse connue.';
    if (weakness === 'magic') return 'Faiblesse contre la magie.';
    if (weakness === 'physical') return 'Faiblesse contre les attaques physiques.';
    return 'Faiblesse inconnue.';
  }

  get usableItems(): Item[] {
    return this.inventory.filter(i => i.usableInCombat);
  }

  openInventory(): void {
    this.isInventoryOpen = true;
  }

  closeInventory(): void {
    this.isInventoryOpen = false;
  }

  onUseItem(item: Item): void {
    this.useItem.emit(item);
    this.closeInventory();
  }
}
