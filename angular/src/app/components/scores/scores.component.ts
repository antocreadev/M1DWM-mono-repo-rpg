import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScoresService } from '../../services/scores.service';
import { ScoreEntry } from '../../models/score.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-scores',
  templateUrl: './scores.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink]
})
export class ScoresComponent implements OnInit {
  scores$: Observable<ScoreEntry[]>;

  constructor(private scoresService: ScoresService) {
    this.scores$ = this.scoresService.scores$;
  }

  ngOnInit(): void {
    // Scores are loaded automatically in the service constructor
  }

  clearScores(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer tous vos scores ?')) {
      this.scoresService.clearScores().subscribe();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
