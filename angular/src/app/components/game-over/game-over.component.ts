import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Character, Item } from '../../types/game-types';
import { CommonModule } from '@angular/common';
import { ScoresService } from '../../services/scores.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-over',
  templateUrl: "game-over.component.html",
  standalone: true,
  imports: [
    CommonModule
  ],
  styles: []
})
export class GameOverComponent implements OnInit {
  @Input() health!: number;
  @Input() character: Character | null = null;
  @Input() inventory: Item[] = [];
  @Output() onRestart = new EventEmitter<void>();

  score: number = 0;
  scoreSaved: boolean = false;

  constructor(
    private scoresService: ScoresService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.calculateAndSaveScore();
  }

  get hasWon(): boolean {
    return this.health > 0;
  }

  private calculateAndSaveScore(): void {
    if (!this.character) return;

    this.score = this.scoresService.calculateScore(
      this.health,
      this.inventory.length,
      this.hasWon
    );

    this.scoresService.saveScore(
      this.score,
      this.character.type,
      this.health,
      this.inventory.length,
      this.hasWon
    ).subscribe(success => {
      this.scoreSaved = success;
    });
  }

  viewScores(): void {
    this.router.navigate(['/scores']);
  }
}
