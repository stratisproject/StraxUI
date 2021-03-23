import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from '@shared/services/auth.service';
import { ModalService } from '@shared/services/modal.service';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationGuard implements CanActivate {
  constructor(public authenticationService: AuthenticationService, public router: Router, public modalService: ModalService) {}

  canActivate(): boolean {
    if (!this.authenticationService.isLoggedIn) {
      this.modalService.openModal("Access Denied", "You can only access this page when you have decrypted your wallet.")
      this.router.navigate(['login'])
    }
    return true
  }
}
