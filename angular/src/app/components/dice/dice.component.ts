import { Component, Input } from '@angular/core';
import {NgClass, NgIf, NgStyle, NgSwitch, NgSwitchCase} from '@angular/common';

@Component({
  selector: 'app-dice',
  templateUrl: './dice.component.html',
  standalone: true,
  imports: [
    NgSwitchCase,
    NgClass,
    NgSwitch,
    NgStyle,
    NgIf
  ],
  styleUrls: ['./dice.component.css']
})
export class DiceComponent {
  @Input() value: number | null = null;
  @Input() size: number = 48;

  get diceClass(): string {
    return `dice-${this.value}`;
  }

  get sizeStyle(): any {
    return {
      width: `${this.size}px`,
      height: `${this.size}px`
    };
  }
}
