import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TransactionInfo } from '@shared/models/transaction-info';
import { GlobalService } from '@shared/services/global.service';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { WalletService } from '@shared/services/wallet.service';
import { SnackbarService } from 'ngx-snackbar';
import { Animations } from '@shared/animations/animations';
import { TaskBarService } from '@shared/services/task-bar-service';
import { TransactionDetailsComponent } from '../transaction-details/transaction-details.component';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  animations: Animations.collapseExpand
})
export class TransactionsComponent implements OnInit, OnDestroy {
  public transactions: TransactionInfo[];
  private subscriptions: Subscription[] = [];
  public loading = false;
  public paginationConfig: any;
  @Input() public enablePagination: boolean;
  @Input() public maxTransactionCount: number;
  @Input() public title: string;
  @Input() public stakingOnly: boolean;
  @Input() public coldStaking = false;
  @Output() public rowClicked: EventEmitter<TransactionInfo> = new EventEmitter();

  public constructor(
    public globalService: GlobalService,
    private snackBarService: SnackbarService,
    private taskBarService: TaskBarService,
    public walletService: WalletService) {

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

  public ngOnInit(): void {
    this.startTransactionSubscription();
  }

  private startTransactionSubscription(): void {
    this.subscriptions.push(this.walletService.walletHistory()
      .pipe(
        map((items) => {
          return this.stakingOnly ? items.filter(i => i.transactionType === 'staked') : items;
        }))

      .subscribe(response => {
        if (response) {
          this.transactions = response;
        }
      }));
  }

  public pageChanged(event: any): void {
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

  public showTransactionDetails(transaction: TransactionInfo): void {
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
