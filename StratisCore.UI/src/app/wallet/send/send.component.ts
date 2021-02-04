import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { GlobalService } from '@shared/services/global.service';
import { Subscription } from 'rxjs';
import { WalletService } from '@shared/services/wallet.service';
import { Animations } from '@shared/animations/animations';

export interface FeeStatus {
  estimating: boolean;
}

@Component({
  selector: 'send-component',
  templateUrl: './send.component.html',
  styleUrls: ['./send.component.scss'],
  animations: Animations.fadeIn
})
export class SendComponent implements OnInit, OnDestroy {

  public totalBalance = 0;
  public spendableBalance = 0;
  public coinUnit: string;
  public selectedTab: string;
  public testnetEnabled = false;
  private subscriptions: Subscription[] = [];

  constructor(private walletService: WalletService, private globalService: GlobalService) { }

  public ngOnInit(): void {
    this.selectedTab = "Standard";
    this.getWalletBalance();
    this.coinUnit = this.globalService.getCoinUnit();
    this.testnetEnabled = this.globalService.getTestnetEnabled();
  }

  public switchForms(selectedTab: string): void {
    this.selectedTab = selectedTab;
  }

  private getWalletBalance(): void {
    this.subscriptions.push(this.walletService.wallet()
      .subscribe(
        response => {
          this.totalBalance = response.amountConfirmed + response.amountUnconfirmed;
          this.spendableBalance = response.spendableAmount;
        },
      ));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
