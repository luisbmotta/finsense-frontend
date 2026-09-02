import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models';
import { API_BASE_URL } from '../core/api-config';

const STORAGE_KEY = 'finsense_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private _token = signal<string | null>(null);
  private _user = signal<User | null>(null);

  readonly token = this._token.asReadonly();
  readonly currentUser = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  constructor() {
    this.restoreSession();
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/register`, { name, email, password })
      .pipe(tap(auth => this.persistSession(auth)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/login`, { email, password })
      .pipe(tap(auth => this.persistSession(auth)));
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private persistSession(auth: AuthResponse): void {
    this._token.set(auth.token);
    this._user.set(auth.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as AuthResponse;
      this._token.set(parsed.token);
      this._user.set(parsed.user);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
