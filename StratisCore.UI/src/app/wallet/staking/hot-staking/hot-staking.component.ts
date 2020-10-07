import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { WalletService } from '@shared/services/wallet.service';
import { WalletBalance, StakingInfo } from '@shared/services/interfaces/api.i';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from '@shared/services/global.service';
import { StakingService } from '@shared/services/staking-service';
import { SnackbarService } from 'ngx-snackbar';

@Component({
  selector: 'app-hot-staking',
  templateUrl: './hot-staking.component.html',
  styleUrls: ['./hot-staking.component.scss']
})
export class HotStakingComponent implements OnInit {
  public wallet: Observable<WalletBalance>;
  public stakingEnabled: Observable<boolean>;
  public stakingInfo: Observable<StakingInfo>;
  public stakingForm: FormGroup;

  constructor(private fb: FormBuilder, public globalService: GlobalService, public stakingService: StakingService, public walletService: WalletService, public snackbarService: SnackbarService) { }

  ngOnInit(): void {
    this.wallet = this.walletService.wallet();
    this.stakingInfo = this.stakingService.stakingInfo();
    this.buildStakingForm();
  }

  private buildStakingForm(): void {
    this.stakingForm = this.fb.group({
        walletPassword: ['', Validators.required]
    });
  }

  public startStaking(): void {
    const walletData = {
      name: this.globalService.getWalletName(),
      password: this.stakingForm.get('walletPassword').value
    };

    this.stakingForm.patchValue({walletPassword: ''});

    this.stakingService.startStaking(walletData).then(
      stakingStarted => {
        if (stakingStarted) {
          this.snackbarService.add({
            msg: `You are now staking.`,
            customClass: 'notify-snack-bar',
            action: {
              text: null
            }
          });
        }
      }
    )
  }

  public stopStaking(): void {
    this.stakingService.stopStaking().then(
      stakingStopped => {
        if (stakingStopped) {
          this.snackbarService.add({
            msg: `Staking is now disabled.`,
            customClass: 'notify-snack-bar',
            action: {
              text: null
            }
          });
        }
      }
    )
  }
}
