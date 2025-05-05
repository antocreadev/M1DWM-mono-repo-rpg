import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

interface Character {
  id: number;
  name: string;
  type: string;
  color: string;
  power: string;
  base_damage: number;
}

interface GameSession {
  id: number;
  character: Character;
  player_position: number;
  health: number;
  inventory: any[];
  message: string;
  game_state: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  // Utilitaires privés
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = error.error.message;
    } else {
      // Erreur renvoyée par le backend
      errorMessage =
        error.error.detail ||
        `Code d'erreur: ${error.status}, message: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Authentification
  login(username: string, password: string): Observable<boolean> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    return this.http
      .post<any>(`${this.apiUrl}/auth/token`, formData.toString(), {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
      .pipe(
        map((response) => {
          if (response && response.access_token) {
            localStorage.setItem('auth_token', response.access_token);
            return true;
          }
          return false;
        }),
        catchError(this.handleError)
      );
  }

  register(
    username: string,
    email: string,
    password: string
  ): Observable<boolean> {
    return this.http
      .post<any>(`${this.apiUrl}/auth/register`, {
        username,
        email,
        password,
      })
      .pipe(
        map(() => true),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }

  checkAuth(): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }

    return this.http
      .get<any>(`${this.apiUrl}/auth/me`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map(() => true),
        catchError(() => {
          localStorage.removeItem('auth_token');
          return of(false);
        })
      );
  }

  // Gestion des personnages
  getCharacters(): Observable<Character[]> {
    return this.http
      .get<Character[]>(`${this.apiUrl}/characters/`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  createCharacter(characterData: Omit<Character, 'id'>): Observable<Character> {
    return this.http
      .post<Character>(`${this.apiUrl}/characters/`, characterData, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  deleteCharacter(characterId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/characters/${characterId}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  // Gestion des sessions de jeu
  getGameSessions(): Observable<GameSession[]> {
    return this.http
      .get<GameSession[]>(`${this.apiUrl}/game-sessions/`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  createGameSession(characterId: number): Observable<GameSession> {
    return this.http
      .post<GameSession>(
        `${this.apiUrl}/game-sessions/`,
        {
          character_id: characterId,
        },
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError));
  }

  updateGameSession(
    sessionId: number,
    sessionData: Partial<GameSession>
  ): Observable<GameSession> {
    return this.http
      .put<GameSession>(
        `${this.apiUrl}/game-sessions/${sessionId}`,
        sessionData,
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError));
  }

  deleteGameSession(sessionId: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/game-sessions/${sessionId}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }
}
