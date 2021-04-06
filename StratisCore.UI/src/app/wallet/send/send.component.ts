import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { GlobalService } from '@shared/services/global.service';
import { Observable, Subscription } from 'rxjs';
import { WalletService } from '@shared/services/wallet.service';
import { Animations } from '@shared/animations/animations';
import { WalletBalance } from '@shared/services/interfaces/api.i';

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
  public selectedTab: string;
  public testnetEnabled = false;
  private subscriptions: Subscription[] = [];
  public wallet: Observable<WalletBalance>;

  constructor(private walletService: WalletService, private globalService: GlobalService) { }

  public ngOnInit(): void {
    this.selectedTab = "Standard";
    this.coinUnit = this.globalService.getCoinUnit();
    this.testnetEnabled = this.globalService.getTestnetEnabled();
    this.wallet = this.walletService.wallet();
  }

  public switchForms(selectedTab: string): void {
    this.selectedTab = selectedTab;
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
