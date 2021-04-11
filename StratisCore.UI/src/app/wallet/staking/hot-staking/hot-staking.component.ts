import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
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
export class HotStakingComponent implements OnInit, OnDestroy {
  public wallet: Observable<WalletBalance>;
  public stakingInfo: Observable<StakingInfo>;
  public stakingForm: FormGroup;
  private subscriptions: Subscription[] = [];
  public amountConfirmed: number;
  public awaitingMaturityIfStaking: number;
  public stakingEnabled: boolean;
  public netStakeWeight: number;

  constructor(private fb: FormBuilder, public globalService: GlobalService, public stakingService: StakingService, public walletService: WalletService, public snackbarService: SnackbarService) { }

  ngOnInit(): void {
    this.wallet = this.walletService.wallet();
    this.stakingInfo = this.stakingService.stakingInfo();
    this.buildStakingForm();
    this.startWalletSubscription();
    this.startStakingServiceSubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  private buildStakingForm(): void {
    this.stakingForm = this.fb.group({
      walletPassword: ['', Validators.required]
    });
  }

  private startWalletSubscription(): void {
    this.subscriptions.push(this.wallet.subscribe(
      response => {
        if (response) {
          this.amountConfirmed = response.amountConfirmed;
          this.awaitingMaturityIfStaking = response.awaitingMaturityIfStaking;
        }
      }
    ));
  }

  private startStakingServiceSubscription(): void {
    this.subscriptions.push(this.stakingInfo.subscribe(
      response => {
        if (response) {
          this.stakingEnabled = response.enabled;
          this.netStakeWeight = response.netStakeWeight;
        }
      }
    ));
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
          this.stakingEnabled = true;
          this.snackbarService.add({
            msg: `You are now staking.`,
            customClass: 'notify-snack-bar',
            action: {
              text: null
            }
          });
        }
      }
    );
  }

  public stopStaking(): void {
    this.stakingService.stopStaking().then(
      stakingStopped => {
        this.stakingEnabled = false;
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
    );
  }
}
