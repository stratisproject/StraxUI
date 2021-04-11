import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { StakingService } from '@shared/services/staking-service';
import { Animations } from '@shared/animations/animations';
import { WalletService } from '@shared/services/wallet.service';
import { ColdStakingService } from '@shared/services/cold-staking-service';
import { AuthenticationService } from '@shared/services/auth.service';

@Component({
  selector: 'app-logout-confirmation',
  templateUrl: './logout-confirmation.component.html',
  styleUrls: ['./logout-confirmation.component.scss'],
  animations: Animations.fadeIn
})
export class LogoutConfirmationComponent implements OnInit {

  constructor(
    public activeModal: NgbActiveModal,
    private router: Router,
    private stakingService: StakingService,
    private walletService: WalletService,
    private coldStakingService: ColdStakingService,
    private authenticationService: AuthenticationService) { }

  ngOnInit(): void {

  }

  public onLogout(): void {
    this.stakingService.stopStaking();
    this.activeModal.close();
    this.walletService.clearWalletHistory();
    this.coldStakingService.setStakingAccount(null);
    this.authenticationService.SignOut();
    this.router.navigate(['/login']);
  }
}
