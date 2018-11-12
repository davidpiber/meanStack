import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthData } from './signUp/auth.data.model';

const MAIN_URL = 'http://localhost:3000';
const USERS_API = '/api/users';
const FULL_POSTS_URL = `${MAIN_URL}${USERS_API}`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post(`${FULL_POSTS_URL}/signup`, authData).subscribe(response => {
      console.log(response);
    });
  }
}
