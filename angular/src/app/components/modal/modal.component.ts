import { Component, Input, Output, EventEmitter } from '@angular/core';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  standalone: true,
  imports: [
    NgIf
  ],
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() actionLabel = 'Fermer';
  @Output() onClose = new EventEmitter<void>();
  @Output() onAction = new EventEmitter<void>();

  close() {
    this.onClose.emit();
  }

  action() {
    this.onAction.emit();
  }
}
