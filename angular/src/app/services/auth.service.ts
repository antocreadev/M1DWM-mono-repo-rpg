import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  // Mock user database
  private users: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123'
    }
  ];

  constructor() {
    // Load users from localStorage if available
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }

    // Initialize current user from localStorage if available
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Save users to localStorage
  private saveUsers(): void {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    // Simulate API call with delay
    return of(null).pipe(
      delay(800), // Simulate network delay
      map(() => {
        const user = this.users.find(
          u => u.username === request.username && u.password === request.password
        );

        if (!user) {
          throw new Error('Username or password is incorrect');
        }

        // Create a copy without the password and add token
        const userWithoutPassword: User = {
          id: user.id,
          username: user.username,
          email: user.email,
          token: `mock-jwt-token-${user.username}-${Date.now()}`
        };

        // Store user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        this.currentUserSubject.next(userWithoutPassword);

        return {
          user: userWithoutPassword,
          token: userWithoutPassword.token!,
          success: true
        };
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    // Simulate API call with delay
    return of(null).pipe(
      delay(800), // Simulate network delay
      map(() => {
        // Check if username already exists
        if (this.users.some(u => u.username === request.username)) {
          throw new Error('Username is already taken');
        }

        // Check if email already exists
        if (this.users.some(u => u.email === request.email)) {
          throw new Error('Email is already registered');
        }

        // Create new user
        const newUser: User = {
          id: this.users.length + 1,
          username: request.username,
          email: request.email,
          password: request.password
        };

        // Add to mock database
        this.users.push(newUser);

        // Save updated users to localStorage
        this.saveUsers();

        // Create a copy without the password and add token
        const userWithoutPassword: User = {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          token: `mock-jwt-token-${newUser.username}-${Date.now()}`
        };

        // Store user in localStorage
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        this.currentUserSubject.next(userWithoutPassword);

        return {
          user: userWithoutPassword,
          token: userWithoutPassword.token!,
          success: true
        };
      })
    );
  }

  logout(): void {
    // Remove user from local storage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }
}
