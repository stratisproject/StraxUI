import { Component, OnInit } from '@angular/core';
import { ColdStakingService } from '@shared/services/cold-staking-service';
import { GetColdStakingInfo } from '@shared/services/interfaces/api.i';
import { interval, Observable, Subscription } from 'rxjs';
import { DeploymentInfo } from '@shared/models/deployment-info';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateSelectComponent } from './create-select/create-select.component';
import { WithdrawColdFundsComponent } from './withdraw-cold-funds/withdraw-cold-funds.component';
import { switchMap, startWith } from 'rxjs/operators';
import { UnusedAddressComponent } from './unused-address/unused-address.component';

@Component({
  selector: 'app-cold-staking',
  templateUrl: './cold-staking.component.html',
  styleUrls: ['./cold-staking.component.scss']
})
export class ColdStakingComponent implements OnInit {

  public coldStakingInfo: any;
  public coldStakingInfoSubscription: Subscription;
  public hasColdStaking: boolean;
  public stakingWalletAccount: string;
  public coldStakingDeploymentInfo: Observable<DeploymentInfo>;
  public coldStakingBalance: number;
  private coldStakingBalanceSubscription: Subscription;
  public coldStakingHistory: any;
  private coldStakingHistorySubscription: Subscription;

  constructor(public coldStakingService: ColdStakingService, public modalService: NgbModal) { }


  ngOnInit(): void {
    // Todo: async when SignalR is implemented
    // this.coldStakingInfo = this.coldStakingService.coldStakingInfo();
    // this.coldStakingDeploymentInfo = this.coldStakingService.coldStakingDeploymentInfo();
    this.coldStakingInfoSubscription = interval(3000).pipe(
      startWith(0),
      switchMap(() => this.coldStakingService.getColdStakingInfo())
    ).subscribe(res => {
      this.coldStakingInfo = res;
      if (this.coldStakingInfo.coldWalletAccountExists || this.coldStakingInfo.hotWalletAccountExists) {
        this.hasColdStaking = true;
        this.stakingWalletAccount = this.coldStakingInfo.coldWalletAccountExists ? "coldStakingColdAddresses" : "coldStakingHotAddresses";
        this.coldStakingService.setStakingAccount(this.stakingWalletAccount);
        this.startSubscriptions();
      } else {
        this.hasColdStaking = false;
      }
    });
  }

  private startSubscriptions() {
    if (!this.coldStakingBalanceSubscription) {
      this.coldStakingBalanceSubscription = interval(10000).pipe(
        startWith(0),
        switchMap(() => this.coldStakingService.getColdStakingBalance(this.stakingWalletAccount))
      ).subscribe(res => {
        this.coldStakingBalance = res.balances[0].amountConfirmed;
      });
    }

    if(!this.coldStakingHistorySubscription) {
      this.coldStakingHistorySubscription = interval(10000).pipe(
        startWith(0),
        switchMap(() => this.coldStakingService.getColdStakingHistory(this.stakingWalletAccount))
      ).subscribe(res => {
        this.coldStakingHistory = res;
      });
    }
  }

  onSetup(): void {
    this.modalService.open(CreateSelectComponent, {
      backdrop: 'static',
      size: 'lg'
    });
  }

  withdrawClicked(): void {
    this.modalService.open(WithdrawColdFundsComponent, {
      backdrop: 'static',
      size: 'lg'
    });
  }

  unusedAddressClicked(): void {
    this.modalService.open(UnusedAddressComponent, {
      backdrop: 'static',
      size: 'lg'
    });
  }

  cancelSubscriptions() {
    if (this.coldStakingInfoSubscription) {
      this.coldStakingInfoSubscription.unsubscribe();
    }

    if (this.coldStakingBalanceSubscription) {
      this.coldStakingBalanceSubscription.unsubscribe();
    }

    if (this.coldStakingHistorySubscription) {
      this.coldStakingHistorySubscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.cancelSubscriptions();
  }
}
