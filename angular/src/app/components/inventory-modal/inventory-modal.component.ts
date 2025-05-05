import { Component, Input, Output, EventEmitter } from '@angular/core';
import {Item} from '../../types/game-types';
import {ModalComponent} from '../modal/modal.component';
import {NgClass, NgForOf, NgIf} from '@angular/common';


@Component({
  selector: 'app-inventory-modal',
  templateUrl: './inventory-modal.component.html',
  styleUrls: ['./inventory-modal.component.css'],
  imports: [
    ModalComponent,
    NgClass,
    NgIf,
    NgForOf
  ],
  standalone: true
})
export class InventoryModalComponent {
  @Input() isOpen = false;
  @Input() inventory: Item[] = [];
  @Input() inCombat = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onUseItem = new EventEmitter<Item>();

  selectedItem: Item | null = null;

  get filteredInventory(): Item[] {
    return this.inCombat
      ? this.inventory.filter((item) => item.usableInCombat)
      : this.inventory;
  }

  handleUseItem() {
    if (this.selectedItem) {
      this.onUseItem.emit(this.selectedItem);
      this.selectedItem = null;
      this.onClose.emit();
    }
  }

  closeModal() {
    this.selectedItem = null;
    this.onClose.emit();
  }

  renderIcon(type: string): string {
    switch (type) {
      case 'potion':
        return '🧪';
      case 'sword':
        return '🗡️';
      case 'shield':
        return '🛡️';
      case 'amulet':
        return '💎';
      case 'scroll':
        return '📜';
      default:
        return '❓';
    }
  }
}
