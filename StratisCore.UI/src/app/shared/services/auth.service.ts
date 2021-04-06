import { Injectable } from '@angular/core';
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  private authorized: boolean;

  constructor(public router: Router) { }

  get isLoggedIn(): boolean {
    return this.authorized;
  }

  SignIn() {
    this.authorized = true;
  }

  SignOut() {
    this.authorized = false;
  }
}
