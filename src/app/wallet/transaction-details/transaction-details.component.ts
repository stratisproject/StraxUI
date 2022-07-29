import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GlobalService } from '@shared/services/global.service';
import { TransactionInfo } from '@shared/models/transaction-info';
import { NodeService } from '@shared/services/node-service';
import { tap } from 'rxjs/operators';
import { SnackbarService } from 'ngx-snackbar';
import { AddNewAddressComponent } from '../address-book/add-new-address/add-new-address.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ElectronService } from '@shared/services/electron.service';

@Component({
  selector: 'transaction-details',
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
})
export class TransactionDetailsComponent implements OnInit, OnDestroy {
  @Input() transaction: TransactionInfo;

  constructor(
    private snackbarService: SnackbarService,
    private nodeService: NodeService,
    private electronService: ElectronService, 
    private globalService: GlobalService,
    private modalService: NgbModal) {
  }

  public coinUnit: string;
  public confirmations: number;
  private generalWalletInfoSubscription: Subscription;
  private lastBlockSyncedHeight: number;
  public transactionIdURL : string;

  public ngOnInit(): void {
    this.coinUnit = this.globalService.getCoinUnit();
    
    if(this.globalService.getTestnetEnabled())
      this.transactionIdURL = "https://chainz.cryptoid.info/strax-test/tx.dws?" + this.transaction.transactionId + ".htm";
    else
      this.transactionIdURL = "https://chainz.cryptoid.info/strax/tx.dws?" + this.transaction.transactionId + ".htm";

    this.subscribeToGeneralWalletInfo();
  }

  public ngOnDestroy(): void {
    if (this.generalWalletInfoSubscription) {
      this.generalWalletInfoSubscription.unsubscribe();
    }
  }

  public onCopiedClick(transactionId: string): void {
    this.snackbarService.add({
      msg: `Transaction Id ${transactionId.substr(0, 20)}... has been copied to your clipboard`,
      customClass: 'notify-snack-bar',
      action: {
        text: null
      }
    });
  }

  public getSentToDetails(): string {
    let addresses = null;
    if (this.transaction.payments) {
      addresses = this.transaction.payments.reduce((s, n) => {
        return `${n.destinationAddress} ${s}`;
      }, '');
    }
    return this.transaction.contact ? `${this.transaction.contact.label} - (${this.transaction.contact.address})` : addresses;
  }

  private subscribeToGeneralWalletInfo(): void {
    this.generalWalletInfoSubscription = this.nodeService.generalInfo().pipe(tap(generalInfo => {
      this.lastBlockSyncedHeight = generalInfo.lastBlockSyncedHeight;
      this.calculateConfirmations();
    })).subscribe();
  }

  private calculateConfirmations(): void {
    if (this.transaction.transactionConfirmedInBlock) {
      this.confirmations = this.lastBlockSyncedHeight - Number(this.transaction.transactionConfirmedInBlock) + 1;
    } else {
      this.confirmations = 0;
    }
  }

  public createNewContact(address: string): void {
    const addressLabel = this.modalService.open(AddNewAddressComponent,
                                                {backdrop: 'static'}).componentInstance;
    addressLabel.addressForm.controls.address.setValue(address.split(' ')[0]);
  }

  public openTransactionId(url: string): void {
    this.electronService.shell.openExternal(url);
  }
}
