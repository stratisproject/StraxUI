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

  SignIn(): void {
    this.authorized = true;
  }

  SignOut(): void {
    this.authorized = false;
  }
}
