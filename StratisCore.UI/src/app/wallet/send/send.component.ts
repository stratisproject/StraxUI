import { Component, OnInit, OnDestroy } from '@angular/core';
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
  public coinUnit: string;
  public selectedTab = "Standard";
  public amountConfirmed: number;
  private subscriptions: Subscription[] = [];

  constructor(private walletService: WalletService, private globalService: GlobalService) { }

  public ngOnInit(): void {
    this.coinUnit = this.globalService.getCoinUnit();
    this.startWalletSubscription();
  }

  public switchForms(selectedTab: string): void {
    this.selectedTab = selectedTab;
  }

  private startWalletSubscription(): void {
    this.subscriptions.push(this.walletService.wallet().subscribe(
      response => {
        if (response) {
          this.amountConfirmed = response.amountConfirmed;
        }
      }
    ));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
