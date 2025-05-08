import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { ScoreEntry, UserScores } from '../models/score.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ScoresService {
  private scoresKey = 'userScores';
  private scoresSubject = new BehaviorSubject<ScoreEntry[]>([]);
  public scores$ = this.scoresSubject.asObservable();

  constructor(private authService: AuthService) {
    this.loadScores();
  }

  private loadScores(): void {
    const storedScores = localStorage.getItem(this.scoresKey);
    if (storedScores) {
      const allScores: UserScores = JSON.parse(storedScores);
      const currentUser = this.authService.currentUserValue;

      if (currentUser && allScores[currentUser.username]) {
        this.scoresSubject.next(allScores[currentUser.username]);
      } else {
        this.scoresSubject.next([]);
      }
    }
  }

  getAllScores(): Observable<UserScores> {
    const storedScores = localStorage.getItem(this.scoresKey);
    return of(storedScores ? JSON.parse(storedScores) : {});
  }

  getUserScores(username?: string): Observable<ScoreEntry[]> {
    const user = username || this.authService.currentUserValue?.username;
    if (!user) return of([]);

    const storedScores = localStorage.getItem(this.scoresKey);
    if (storedScores) {
      const allScores: UserScores = JSON.parse(storedScores);
      return of(allScores[user] || []);
    }
    return of([]);
  }

  saveScore(score: number, characterType: string, health: number, itemsCollected: number, won: boolean): Observable<boolean> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return of(false);

    const storedScores = localStorage.getItem(this.scoresKey);
    const allScores: UserScores = storedScores ? JSON.parse(storedScores) : {};

    if (!allScores[currentUser.username]) {
      allScores[currentUser.username] = [];
    }

    const newScore: ScoreEntry = {
      id: Date.now(),
      username: currentUser.username,
      score,
      characterType,
      health,
      itemsCollected,
      date: new Date().toISOString(),
      won
    };

    allScores[currentUser.username].push(newScore);

    // Sort scores by date (newest first)
    allScores[currentUser.username].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    localStorage.setItem(this.scoresKey, JSON.stringify(allScores));
    this.scoresSubject.next(allScores[currentUser.username]);

    return of(true);
  }

  calculateScore(health: number, itemsCollected: number, won: boolean): number {
    // Base score calculation
    let score = 0;

    // Points for remaining health
    score += health * 10;

    // Points for collected items
    score += itemsCollected * 50;

    // Bonus for winning
    if (won) {
      score += 1000;
    }

    return score;
  }

  clearScores(): Observable<boolean> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return of(false);

    const storedScores = localStorage.getItem(this.scoresKey);
    if (storedScores) {
      const allScores: UserScores = JSON.parse(storedScores);
      if (allScores[currentUser.username]) {
        delete allScores[currentUser.username];
        localStorage.setItem(this.scoresKey, JSON.stringify(allScores));
        this.scoresSubject.next([]);
        return of(true);
      }
    }
    return of(false);
  }
}
