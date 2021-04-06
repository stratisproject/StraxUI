import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { GlobalService } from '@shared/services/global.service';
import { WalletService } from '@shared/services/wallet.service';
import { WalletResync } from '@shared/models/wallet-rescan';
import { SnackbarService } from 'ngx-snackbar';
@Component({
  selector: 'app-resync',
  templateUrl: './resync.component.html',
  styleUrls: ['./resync.component.scss']
})
export class ResyncComponent implements OnInit {
  @Output() rescanStarted = new EventEmitter<boolean>();

  constructor(
    private globalService: GlobalService,
    private snackbarService: SnackbarService,
    public walletService: WalletService) {
  }

  private walletName: string;

  ngOnInit(): void {
    this.walletName = this.globalService.getWalletName();
  }

  public onResyncClicked(): void {
    const rescanData = new WalletResync(
      this.walletName,
      true,
      true
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
}
