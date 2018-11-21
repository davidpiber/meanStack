import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthData } from './signUp/auth.data.model';


const MAIN_URL = 'http://localhost:3000';
const USERS_API = '/api/users';
const FULL_POSTS_URL = `${MAIN_URL}${USERS_API}`;
const TOKEN = 'token';
const EXPIRATION = 'expiration';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authToken: string;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;
  private tokenTimer: NodeJS.Timer;

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.authToken;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post(`${FULL_POSTS_URL}/signup`, authData).subscribe(response => {
      console.log(response);
    });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post<{token: string, expiresIn: number}>(`${FULL_POSTS_URL}/login`, authData).subscribe(response => {
      const token = response.token;
      this.authToken = token;
      if (token) {
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        this.saveAuthData(token, expirationDate);
        this.router.navigate(['/']);
      }
    });
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const now = new Date();
    const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.authToken = authInfo.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    } else {
      this.clearAuthData();
    }
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  logout() {
    this.authToken = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.router.navigate(['/']);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem(TOKEN, token);
    localStorage.setItem(EXPIRATION, expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(EXPIRATION);
  }

  private getAuthData() {
    const token = localStorage.getItem(TOKEN);
    const expirationDate = localStorage.getItem(EXPIRATION);
    if (!token && !expirationDate) {
      return;
    }
    return { token, expirationDate: new Date(expirationDate) };
  }
}
