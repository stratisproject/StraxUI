import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { GlobalService } from '@shared/services/global.service';
import { NodeService } from '@shared/services/node-service';
import { WalletService } from '@shared/services/wallet.service';
import { WalletResync } from '@shared/models/wallet-rescan';
import { SnackbarService } from 'ngx-snackbar';

@Component({
  selector: 'app-resync',
  templateUrl: './resync.component.html',
  styleUrls: ['./resync.component.scss']
})
export class ResyncComponent implements OnInit, OnDestroy {
  @Output() rescanStarted = new EventEmitter<boolean>();
  constructor(
    private globalService: GlobalService,
    private snackbarService: SnackbarService,
    private walletService: WalletService,
    private nodeService: NodeService) {
  }


  private walletName: string;
  private lastBlockSyncedHeight: number;
  private chainTip: number;
  private isChainSynced: boolean;
  public isSyncing = true;
  private generalWalletInfoSubscription: Subscription;

  ngOnInit(): void {
    this.walletName = this.globalService.getWalletName();
    this.startSubscriptions();
  }

  ngOnDestroy(): void {
    this.cancelSubscriptions();
  }

  public onResyncClicked(): void {
    const rescanDate = new Date("2020-01-01");
    rescanDate.setDate(rescanDate.getDate() - 1);

    const rescanData = new WalletResync(
      this.walletName,
      rescanDate,
      false
    );

    this.walletService
      .rescanWallet(rescanData)
      .toPromise().then(
      () => {
        this.rescanStarted.emit(true);
        this.snackbarService.add({
          msg: 'Your wallet is now re-syncing in the background, this may take a few minutes.',
          customClass: 'notify-snack-bar',
          action: {
            text: null
          }
        });
      }
    );
  }

  private getGeneralWalletInfo(): void {
    this.generalWalletInfoSubscription = this.nodeService.generalInfo()
      .subscribe(
        response => {
          const generalWalletInfoResponse = response;
          this.lastBlockSyncedHeight = generalWalletInfoResponse.lastBlockSyncedHeight;
          this.chainTip = generalWalletInfoResponse.chainTip;
          this.isChainSynced = generalWalletInfoResponse.isChainSynced;

          if (this.isChainSynced && this.lastBlockSyncedHeight === this.chainTip) {
            this.isSyncing = false;
          } else {
            this.isSyncing = true;
          }
        },
        () => {
          this.cancelSubscriptions();
        }
      )
    ;
  }

  private cancelSubscriptions(): void {
    if (this.generalWalletInfoSubscription) {
      this.generalWalletInfoSubscription.unsubscribe();
    }
  }

  private startSubscriptions(): void {
    this.getGeneralWalletInfo();
  }

}
