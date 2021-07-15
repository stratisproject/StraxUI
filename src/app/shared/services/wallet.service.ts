import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { SignalRService } from '@shared/services/signalr-service';
import { WalletInfo } from '@shared/models/wallet-info';
import { Balances, TransactionsHistoryItem, WalletBalance, WalletHistory, WalletNamesData } from '@shared/services/interfaces/api.i';
import { SignalREvent, SignalREvents, WalletInfoSignalREvent } from '@shared/services/interfaces/signalr-events.i';
import { catchError, map, flatMap, tap } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestApi } from '@shared/services/rest-api';
import { GlobalService } from '@shared/services/global.service';
import { ErrorService } from '@shared/services/error-service';
import { Transaction } from '@shared/models/transaction';
import { InterFluxTransaction } from '@shared/models/interflux-transaction';
import { TransactionSending } from '@shared/models/transaction-sending';
import { BuildTransactionResponse, TransactionResponse } from '@shared/models/transaction-response';
import { FeeEstimation } from '@shared/models/fee-estimation';
import { WalletLoad } from '@shared/models/wallet-load';
import { WalletResync } from '@shared/models/wallet-rescan';
import { AddressBalance } from '@shared/models/address-balance';
import { SnackbarService } from 'ngx-snackbar';
import { NodeService } from '@shared/services/node-service';
import { TransactionInfo } from '@shared/models/transaction-info';
import { AddressBookService } from '@shared/services/address-book-service';
import { OpreturnTransaction } from '@shared/models/opreturn-transaction';
import { ExtPubKeyImport } from '@shared/models/extpubkey-import';
import { LoggerService } from '@shared/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class WalletService extends RestApi {
  public rescanInProgress: boolean;
  private transactionReceivedSubject = new Subject<SignalREvent>();
  private walletUpdatedSubjects: { [walletName: string]: BehaviorSubject<WalletBalance> } = {};
  private walletHistorySubjects: { [walletName: string]: BehaviorSubject<TransactionInfo[]> } = {};
  private loadingSubject = new Subject<boolean>();
  private walletActivitySubject = new Subject<boolean>();
  private currentWallet: WalletInfo;
  private historyPageSize = 40;
  public isSyncing: boolean;
  public ibdMode: boolean;

  public get loading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  public get walletActivityFlag(): Observable<boolean> {
    return this.walletActivitySubject.asObservable();
  }

  public clearWalletActivityFlag(): void {
    this.walletActivitySubject.next(false);
  }

  constructor(
    private snackbarService: SnackbarService,
    private addressBookService: AddressBookService,
    private nodeService: NodeService,
    globalService: GlobalService,
    http: HttpClient,
    errorService: ErrorService,
    signalRService: SignalRService,
    loggerService: LoggerService) {
    super(globalService, http, errorService, loggerService);

    globalService.currentWallet.subscribe(wallet => {
      this.currentWallet = wallet;
    });

    // This covers sending and receiving as well as staking/mining events.
    signalRService.registerOnMessageEventHandler<SignalREvent>(SignalREvents.WalletProcessedTransactionOfInterestEvent,
    () => {
      this.refreshWallet();
    });

    this.nodeService.generalInfo().subscribe(generalInfo => {
      if (generalInfo.percentSynced === 100 && this.rescanInProgress) {
        this.rescanInProgress = false;
        this.snackbarService.add({
          msg: `Wallet rescan completed.`,
          customClass: 'notify-snack-bar',
          action: {
            text: null
          }
        });
      }
    });

    signalRService.registerOnMessageEventHandler<WalletInfoSignalREvent>(SignalREvents.WalletGeneralInfo,
                                                                         (message) => {
                                                                           // Update wallet history after chain is synced or IBD mode completed
                                                                           const syncCompleted = (this.isSyncing && message.lastBlockSyncedHeight === message.chainTip);
                                                                           let historyRefreshed = false;
                                                                           this.isSyncing = message.lastBlockSyncedHeight !== message.chainTip;
                                                                           this.ibdMode = !message.isChainSynced;

                                                                           if (syncCompleted) {
                                                                             historyRefreshed = true;
                                                                           }

                                                                           if (this.currentWallet && message.walletName === this.currentWallet.walletName) {
                                                                             const walletBalance = message.accountsBalances.find(acc => acc.accountName === this.currentWallet.account);
                                                                             this.updateWalletForCurrentAddress(walletBalance, historyRefreshed);
                                                                           }
                                                                         });
  }

  public getWalletNames(): Observable<WalletNamesData> {
    return this.get<WalletNamesData>('wallet/list-wallets').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public loadStratisWallet(data: WalletLoad): Observable<any> {
    return this.post('wallet/load/', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public removeWallet(walletName: string): Observable<any> {
    const params = new HttpParams()
      .set('walletName', walletName);

    return this.delete('wallet/remove-wallet', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public transactionReceived(): Observable<any> {
    return this.transactionReceivedSubject.asObservable();
  }

  public getAllAddressesForWallet(data: WalletInfo): Observable<AddressBalance> {
    return this.get<AddressBalance>('wallet/addresses', this.getWalletParams(data)).pipe(
      map((response => {
        response.addresses = response.addresses.sort((a, b) => b.amountConfirmed - a.amountConfirmed);
        return response;
      })),
      catchError(err => this.handleHttpError(err))
    );
  }

  public getUnusedReceiveAddress(data: WalletInfo): Observable<any> {
    return this.get('wallet/unusedaddress', this.getWalletParams(data)).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public rescanWallet(data: WalletResync): Observable<any> {
    const params = new HttpParams()
      .set('walletName', data.walletName)
      .set('all', data.all.toString())
      .set('reSync', data.reSync.toString());

    return this.delete('wallet/remove-transactions/', params).pipe(
      tap(() => {
        this.rescanInProgress = true;
        this.clearWalletHistory();
        //this.paginateHistory();
        this.getHistory();
      }),
      catchError(err => this.handleHttpError(err))
    );
  }

  public importExtPubKey(data: ExtPubKeyImport): Observable<any> {
    return this.post('wallet/recover-via-extpubkey', data).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public wallet(): Observable<WalletBalance> {
    return this.getWalletSubject().asObservable();
  }

  public walletHistory(): Observable<TransactionInfo[]> {
    return this.getWalletHistorySubject().asObservable();
  }

  public estimateFee(feeEstimation: FeeEstimation): Observable<any> {
    feeEstimation.shuffleOutputs = true;
    return this.post('wallet/estimate-txfee', feeEstimation).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public getHistory(): void {
    this.loadingSubject.next(true);
  
     let extra = Object.assign({}, {
      skip: 0,
      take: 1000
     }) as { [key: string]: any };

    this.get<WalletHistory>('wallet/history', this.getWalletParams(this.currentWallet, extra))
      .pipe(map((response) => {
        return response.history[0].transactionsHistory;
      }),
            catchError((err) => {
              this.loadingSubject.next(false);
              return this.handleHttpError(err);
            })).toPromise().then(history => {
        this.applyHistory(history);
        this.loadingSubject.next(false);
      });
  }

  // public paginateHistory(take?: number, prevOutputTxTime?: number, prevOutputIndex?: number): void {
  //   let extra = Object.assign({}, {
  //     prevOutputTxTime: prevOutputTxTime,
  //     prevOutputIndex: prevOutputIndex,
  //     take: take || this.historyPageSize
  //   }) as { [key: string]: any };

  //   this.loadingSubject.next(true);

  //   this.get<WalletHistory>('wallet/history', this.getWalletParams(this.currentWallet, extra))
  //     .pipe(map((response) => {
  //         return response.history[this.currentWallet.account].transactionsHistory;
  //       }),
  //       catchError((err) => {
  //         this.loadingSubject.next(false);
  //         return this.handleHttpError(err);
  //       })).toPromise().then(history => {
  //     this.applyHistory(history);
  //     this.loadingSubject.next(false);
  //   });
  // }

  private applyHistory(history: TransactionsHistoryItem[]): void {
    const subject = this.getWalletHistorySubject();
    const existingItems = subject.value;
    const newItems = [];
    history.forEach(item => {
      const index = existingItems.findIndex(existing => existing.id === item.id);
      if (index === -1) {
        const mapped = TransactionInfo.mapFromTransactionsHistoryItem(item, this.addressBookService);
        newItems.push(mapped);
      } else {
        if (item.confirmedInBlock && !existingItems[index].transactionConfirmedInBlock) {
          existingItems.filter(existing => existing.id === item.id).forEach(existing => {
            existing.transactionConfirmedInBlock = item.confirmedInBlock;
          });
        }
      }
    });
    const set = existingItems.concat(newItems);
    subject.next(set.sort((a, b) => b.timestamp - a.timestamp));
  }

  public broadcastTransaction(transactionHex: string): Observable<string> {
    return this.post('wallet/send-transaction', new TransactionSending(transactionHex)).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public sendTransaction(transaction: Transaction | OpreturnTransaction | InterFluxTransaction): Promise<TransactionResponse> {
    if(transaction instanceof InterFluxTransaction)
      return this.buildAndSendInterFluxTransaction(transaction).toPromise();

      return this.buildAndSendTransaction(transaction).toPromise();
  }

  public getTransactionCount(): Observable<number> {
    return this.get<any>('wallet/transactionCount', this.getWalletParams(this.currentWallet))
      .pipe(map(result => {
        return result.transactionCount as number;
      }), catchError(err => this.handleHttpError(err)));
  }

  private buildAndSendTransaction(transaction: Transaction | OpreturnTransaction): Observable<TransactionResponse> {
    const observable = this.post<BuildTransactionResponse>('wallet/build-transaction', transaction);

    return observable.pipe(
      map(response => {
        response.isSideChain = transaction.isSideChainTransaction;
        return response;
      }),
      flatMap((buildTransactionResponse) => {
        return this.post('wallet/send-transaction', new TransactionSending(buildTransactionResponse.hex)).pipe(
          map(() => {
            return new TransactionResponse(transaction, buildTransactionResponse.fee, buildTransactionResponse.isSideChain);
          }),
          tap(() => {
            this.refreshWallet();
          })
        );
      }),
      catchError(err => this.handleHttpError(err))
    );
  }

  private buildAndSendInterFluxTransaction(transaction: InterFluxTransaction): Observable<TransactionResponse> {
    const observable = this.post<BuildTransactionResponse>('wallet/build-interflux-transaction', transaction);

    return observable.pipe(

      map(response => {
        response.isSideChain = transaction.isSideChainTransaction;
        return response;
      }),

      flatMap((buildTransactionResponse) => {
        return this.post('wallet/send-transaction', new TransactionSending(buildTransactionResponse.hex)).pipe(
          map(() => {
            return new TransactionResponse(transaction, buildTransactionResponse.fee, buildTransactionResponse.isSideChain);
          }),
          tap(() => {
            this.refreshWallet();
          })
        );
      }),

      catchError(err => this.handleHttpError(err))
    );
  }

  private getWalletSubject(): BehaviorSubject<WalletBalance> {
    if (!this.walletUpdatedSubjects[this.currentWallet.walletName]) {
      this.walletUpdatedSubjects[this.currentWallet.walletName] = new BehaviorSubject<WalletBalance>(null);

      // Initialise the wallet
      this.getWalletBalance(this.currentWallet).toPromise().then(data => {
        if (data.balances.length > 0 && data.balances[this.currentWallet.account]) {
          this.updateWalletForCurrentAddress(data.balances[this.currentWallet.account]);
        }
      });
    }
    return this.walletUpdatedSubjects[this.currentWallet.walletName];
  }

  private getWalletHistorySubject(): BehaviorSubject<TransactionInfo[]> {
    if (!this.walletHistorySubjects[this.currentWallet.walletName, this.currentWallet.account]) {
      this.walletHistorySubjects[this.currentWallet.walletName, this.currentWallet.account] = new BehaviorSubject<TransactionInfo[]>([]);

      // Get initial Wallet History
      //this.paginateHistory(40);
      this.getHistory();
    }
    return this.walletHistorySubjects[this.currentWallet.walletName, this.currentWallet.account];
  }

  private getWalletBalance(data: WalletInfo): Observable<Balances> {
    return this.get<Balances>('wallet/balance', this.getWalletParams(data)).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  private getWalletParams(walletInfo: WalletInfo, extra?: { [key: string]: any }): HttpParams {
    let params = new HttpParams()
      .set('walletName', walletInfo.walletName)
      .set('accountName', walletInfo.account || "account 0");

    if (extra) {
      Object.keys(extra).forEach(key => {
        if (extra[key] != null) {
          params = params.set(key, extra[key]);
        }
      });
    }
    return params;
  }

  private updateWalletForCurrentAddress(walletBalance?: WalletBalance, historyRefreshed?: boolean): void {
    if (!this.currentWallet) {
      return;
    }

    const walletSubject = this.getWalletSubject();
    const newBalance = new WalletBalance(
      walletBalance || walletSubject.value
    );

    if (!historyRefreshed && (walletSubject.value
      && (walletSubject.value.amountConfirmed !== newBalance.amountConfirmed
        || walletSubject.value.amountUnconfirmed !== newBalance.amountUnconfirmed))) {
      if (!this.rescanInProgress && !this.isSyncing) {
        this.walletActivitySubject.next(true);
      }
      //this.paginateHistory();
      this.getHistory();
    }

    walletSubject.next(newBalance);
  }

  private refreshWallet(): void {
    this.getWalletBalance(this.currentWallet).toPromise().then(
      wallet => {
        this.updateWalletForCurrentAddress(wallet.balances[this.currentWallet.account]);
      });
  }

  public clearWalletHistory(): void {
    if (this.currentWallet) {
      const walletHistorySubject = this.getWalletHistorySubject();
      walletHistorySubject.next([]);
    }
  }
}
