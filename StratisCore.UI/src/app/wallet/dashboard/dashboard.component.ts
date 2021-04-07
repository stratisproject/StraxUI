import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalService } from '@shared/services/global.service';
import { WalletService } from '@shared/services/wallet.service';
import { Subscription } from 'rxjs';
import { Animations } from '@shared/animations/animations';
import { LoggerService } from '@shared/services/logger.service';

@Component({
  selector: 'dashboard-component',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: Animations.fadeIn
})
export class DashboardComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  public amountConfirmed: number;
  public amountUnconfirmed: number;

  constructor(private walletService: WalletService, private logger: LoggerService, public globalService: GlobalService) { }

  public ngOnInit(): void {
    this.subscriptions.push(this.walletService.wallet().subscribe(
      response => {
        if (response) {
          this.amountConfirmed = response.amountConfirmed;
          this.amountUnconfirmed = response.amountUnconfirmed;
        }
      }, error => {
        this.logger.error(error);
      }
    ))
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
