import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalService } from '@shared/services/global.service';
import { WalletBalance } from '@shared/services/interfaces/api.i';
import { WalletService } from '@shared/services/wallet.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Animations } from '@shared/animations/animations';

@Component({
  selector: 'dashboard-component',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: Animations.fadeIn
})
export class DashboardComponent implements OnInit {

  private subscriptions: Subscription[] = [];
  public amountConfirmed: number;
  public amountUnconfirmed: number;

  constructor(
    public walletService: WalletService,
    public globalService: GlobalService) {
  }

  public ngOnInit(): void {
    this.subscriptions.push(this.walletService.wallet().subscribe(
      response => {
        if (response) {
          this.amountConfirmed = response.amountConfirmed;
          this.amountUnconfirmed = response.amountUnconfirmed;
        }
      }
    ))
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
