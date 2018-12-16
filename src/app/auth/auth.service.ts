import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthData } from './signUp/auth.data.model';
import { environment } from '../../environments/environment';

const USERS_API = '/users';
const FULL_POSTS_URL = `${environment.apiUrl}${USERS_API}`;
const TOKEN = 'token';
const EXPIRATION = 'expiration';
const USER_ID = 'userId';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authToken: string;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;
  private tokenTimer: NodeJS.Timer;
  private userId: string;

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.authToken;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post(`${FULL_POSTS_URL}/signup`, authData).subscribe(response => {
      this.router.navigate(['/']);
    }, error => {
      this.authStatusListener.next(false);
    });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post<{token: string, expiresIn: number, userId: string}>(`${FULL_POSTS_URL}/login`, authData).subscribe(response => {
      const token = response.token;
      this.authToken = token;
      if (token) {
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        this.userId = response.userId;
        const now = new Date();
        const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
        this.saveAuthData(token, expirationDate, response.userId);
        this.router.navigate(['/']);
      }
    }, error => {
      this.authStatusListener.next(false);
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
      this.userId = authInfo.userId;
    } else {
      this.clearAuthData();
      this.userId = null;
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
    this.userId = null;
    this.authStatusListener.next(false);
    this.router.navigate(['/']);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
  }

  private saveAuthData(token: string, expirationDate: Date, userid: string) {
    localStorage.setItem(TOKEN, token);
    localStorage.setItem(EXPIRATION, expirationDate.toISOString());
    localStorage.setItem(USER_ID, userid);
  }

  private clearAuthData() {
    localStorage.removeItem(TOKEN);
    localStorage.removeItem(EXPIRATION);
    localStorage.removeItem(USER_ID);
  }

  private getAuthData() {
    const token = localStorage.getItem(TOKEN);
    const expirationDate = localStorage.getItem(EXPIRATION);
    const userId = localStorage.getItem(USER_ID);
    if (!token && !expirationDate && !userId) {
      return;
    }
    return { token, expirationDate: new Date(expirationDate), userId };
  }
}
