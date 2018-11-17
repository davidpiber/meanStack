import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthData } from './signUp/auth.data.model';


const MAIN_URL = 'http://localhost:3000';
const USERS_API = '/api/users';
const FULL_POSTS_URL = `${MAIN_URL}${USERS_API}`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authToken: string;
  private authStatusListener = new Subject<boolean>();
  private isAuthenticated = false;

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
    this.http.post<{token: string}>(`${FULL_POSTS_URL}/login`, authData).subscribe(response => {
      const token = response.token;
      this.authToken = token;
      if (token) {
        this.isAuthenticated = true;
        this.authStatusListener.next(true);
        this.router.navigate(['/']);
      }
    });
  }

  logout() {
    this.authToken = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.router.navigate(['/']);
  }
}
