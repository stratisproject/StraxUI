import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TransactionInfo } from '@shared/models/transaction-info';
import { GlobalService } from '@shared/services/global.service';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { WalletService } from '@shared/services/wallet.service';
import { SnackbarService } from 'ngx-snackbar';
import { AddressBookService } from '@shared/services/address-book-service';
import { Animations } from '@shared/animations/animations';
import { TaskBarService } from '@shared/services/task-bar-service';
import { TransactionDetailsComponent } from '../transaction-details/transaction-details.component';
import { ColdStakingService } from '@shared/services/cold-staking-service';

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
  public paginationConfig: any;
  public expandedElement: TransactionInfo | null;
  @Input() public enablePagination: boolean;
  @Input() public maxTransactionCount: number;
  @Input() public title: string;
  @Input() public stakingOnly: boolean;
  @Input() public coldStaking = false;
  @Output() public rowClicked: EventEmitter<TransactionInfo> = new EventEmitter();
  private last: TransactionInfo;

  public constructor(
    public globalService: GlobalService,
    private snackBarService: SnackbarService,
    private addressBookService: AddressBookService,
    private taskBarService: TaskBarService,
    public walletService: WalletService,
    public coldStakingService: ColdStakingService) {

    this.paginationConfig = {
      itemsPerPage: 7,
      currentPage: 1
    };

    this.subscriptions.push(
      this.walletService.loading.subscribe(loading => {
        this.loading = loading;
        this.detectLoading();
      }));
  }

  public pageChanged(event){
    this.paginationConfig.currentPage = event;
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
    if(!this.coldStaking) {
      this.transactions = this.walletService.walletHistory()
      .pipe(
        map((items) => {
          return this.stakingOnly ? items.filter(i => i.transactionType === 'staked') : items;
        }),
        tap(items => {
          const history = items;
          this.last = history && history.length > 0 ? history[history.length - 1] : {} as TransactionInfo;
        }));
    } else {
      this.transactions = this.coldStakingService.coldStakingHistory(this.coldStakingService.getColdStakingAccount())
      .pipe(
        map((items) => {
          return items;
        }),
        tap(items => {
          const history = items;
          this.last = history && history.length > 0 ? history[history.length - 1] : {} as TransactionInfo;
        }));
    }
  }

  // public toggleExpandItem(index: number): void {
  //   this.state[index] = (this.state[index] || 'collapsed') === 'collapsed' ? 'expanded' : 'collapsed'
  // }

  public showTransactionDetails(transaction: TransactionInfo) {
    this.taskBarService.open(TransactionDetailsComponent, {transaction: transaction}, {
      showCloseButton: true,
      taskBarWidth: '600px',
      title: 'Transaction Details',
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
