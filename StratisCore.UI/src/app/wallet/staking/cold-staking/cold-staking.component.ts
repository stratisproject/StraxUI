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
  public hasColdStakingSetup: boolean;
  public hasColdStakingAccount: boolean;
  public hasHotStakingAccount: boolean;
  public stakingWalletAccountName: string;
  public coldStakingDeploymentInfo: Observable<DeploymentInfo>;
  public coldStakingBalance: number;
  private coldStakingBalanceSubscription: Subscription;
  public coldStakingHistory: any;
  private coldStakingHistorySubscription: Subscription;

  constructor(public coldStakingService: ColdStakingService, public modalService: NgbModal) { }


  ngOnInit(): void {
    this.hasColdStakingAccount = this.coldStakingService.getHasColdStakingAccount();
    this.hasHotStakingAccount = this.coldStakingService.getHasHotStakingAccount();
    if (this.hasColdStakingAccount || this.hasHotStakingAccount) {
      this.hasColdStakingSetup = true;

      if (this.hasColdStakingAccount) {
        this.stakingWalletAccountName = "coldStakingColdAddresses";
      } else if (this.hasHotStakingAccount) {
        this.stakingWalletAccountName = "coldStakingHotAddresses"
      }

      if (this.stakingWalletAccountName) {
        this.coldStakingService.setStakingAccount(this.stakingWalletAccountName);
        this.startSubscriptions();
      }
    } else {
      this.hasColdStakingSetup = false;
    }
  }

  private startSubscriptions() {
    if (!this.coldStakingBalanceSubscription) {
      this.coldStakingBalanceSubscription = interval(10000).pipe(
        startWith(0),
        switchMap(() => this.coldStakingService.getColdStakingBalance(this.stakingWalletAccountName))
      ).subscribe(res => {
        this.coldStakingBalance = res.balances[0].amountConfirmed;
      });
    }

    if(!this.coldStakingHistorySubscription) {
      this.coldStakingHistorySubscription = interval(10000).pipe(
        startWith(0),
        switchMap(() => this.coldStakingService.getColdStakingHistory(this.stakingWalletAccountName))
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
