import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TransactionInfo } from '@shared/models/transaction-info';
import { GlobalService } from '@shared/services/global.service';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { WalletService } from '@shared/services/wallet.service';
import { SnackbarService } from 'ngx-snackbar';
import { AddressBookService } from '@shared/services/address-book-service';
import { Animations } from '@shared/animations/animations';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  animations: Animations.collapseExpand
})
export class TransactionsComponent implements OnInit, OnDestroy {
  public transactions: Observable<TransactionInfo[]>;
  private subscriptions: Subscription[] = [];
  public loading = false;
  public state: { [key: number]: string } = {};
  @Input() public enablePagination: boolean;
  @Input() public maxTransactionCount: number;
  @Input() public title: string;
  @Input() public stakingOnly: boolean;
  @Output() public rowClicked: EventEmitter<TransactionInfo> = new EventEmitter();
  private last: TransactionInfo;

  public constructor(
    private globalService: GlobalService,
    private snackBarService: SnackbarService,
    private addressBookService: AddressBookService,
    public walletService: WalletService) {

    this.subscriptions.push(
      this.walletService.loading.subscribe(loading => {
        this.loading = loading;
        this.detectLoading();
      }));
  }

  private detectLoading(): any {
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
      if (this.loading) {
        this.snackBarService.add({
          msg: '',
          customClass: 'loading-snack-bar',
          action: {
            text: null
          }
        });
      } else {
        this.snackBarService.clear();
      }
    }
  }

  public ngOnInit(): void {
    this.transactions = this.walletService.walletHistory()
      .pipe(
        map((items) => {
          return this.stakingOnly ? items.filter(i => i.transactionType === 'staked') : items;
        }),
        tap(items => {
          const history = items;
          this.last = history && history.length > 0 ? history[history.length - 1] : {} as TransactionInfo;
        }));
  }

  public toggleExpandItem(index: number): void {
    this.state[index] = (this.state[index] || 'collapsed') === 'collapsed' ? 'expanded' : 'collapsed'
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
