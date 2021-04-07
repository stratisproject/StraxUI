import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GetColdStakingInfo, TransactionsHistoryItem, WalletHistory } from '@shared/services/interfaces/api.i';
import { RestApi } from '@shared/services/rest-api';
import { GlobalService } from '@shared/services/global.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '@shared/services/error-service';
import { SignalRService } from '@shared/services/signalr-service';
import {
  SignalREvents,
  ColdStakingInfoSignalREvent
} from '@shared/services/interfaces/signalr-events.i';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ConsensusService } from '@shared/services/consensus-service';
import { DeploymentInfo } from '@shared/models/deployment-info';
import { ColdStakingAccount } from '@shared/models/cold-staking-account';
import { ColdStakingAddress } from '@shared/models/cold-staking-address';
import { ColdStakingSetup } from '@shared/models/cold-staking-setup';
import { ColdStakingWithdrawal } from '@shared/models/cold-staking-withdrawal';
import { TransactionInfo } from '@shared/models/transaction-info';
import { Transaction } from '@shared/models/transaction';
import { AddressBookService } from '@shared/services/address-book-service';
import { LoggerService } from '@shared/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class ColdStakingService extends RestApi {
  private coldStakingHistorySubjects: { [walletName: string]: BehaviorSubject<TransactionInfo[]> } = {};
  private walletName: string;
  private coldStakingAccount: string;
  public hasColdStakingSetup = false;

  constructor(
    http: HttpClient,
    globalService: GlobalService,
    addressBookService: AddressBookService,
    signalRService: SignalRService,
    consensusService: ConsensusService,
    errorService: ErrorService,
    loggerService: LoggerService
    ) {
      super(globalService, http, errorService, loggerService);

      this.getHasColdStakingAccount();
      this.getHasHotStakingAccount();
      this.setStakingAccount(null);
    }

  private getWalletName(): string {
    return this.globalService.getWalletName();
  }

  public getHasColdStakingAccount(): boolean {
    if (localStorage.getItem("hasColdStaking" + this.getWalletName())) {
      return JSON.parse(localStorage.getItem("hasColdStaking" + this.getWalletName()));
    } else {
      localStorage.setItem("hasColdStaking" + this.getWalletName(), "false");
      return JSON.parse(localStorage.getItem("hasColdStaking" + this.getWalletName()));
    }
  }

  public getHasHotStakingAccount(): boolean {
    if (localStorage.getItem("hasHotStaking" + this.getWalletName())) {
      return JSON.parse(localStorage.getItem("hasHotStaking" + this.getWalletName()));
    } else {
      localStorage.setItem("hasHotStaking" + this.getWalletName(), "false");
      return JSON.parse(localStorage.getItem("hasHotStaking" + this.getWalletName()));
    }
  }

  public setHasColdStakingAccount(hasColdStaking: string): void {
    localStorage.setItem("hasColdStaking"  + this.getWalletName(), hasColdStaking);
  }

  public setHasHotStakingAccount(hasHotStaking: string): void {
    localStorage.setItem("hasHotStaking"  + this.getWalletName(), hasHotStaking);
  }

  public getColdStakingAccount(): string {
    return this.coldStakingAccount;
  }

  public setStakingAccount(accountName: string): void {
    this.coldStakingAccount = accountName;
  }

  // public getColdStakingInfo(): Observable<any> {
  //   const params = new HttpParams()
  //     .set('walletName', this.globalService.getWalletName());

  //   return this.get<GetColdStakingInfo>('coldstaking/cold-staking-info', params).pipe(
  //     catchError(err => {
  //       return this.handleHttpError(err);
  //     })
  //   )
  // }

  public getColdStakingBalance(accountName: string): Observable<any> {
    const params = new HttpParams()
      .set('walletName', this.globalService.getWalletName())
      .set('accountName', accountName);

    return this.get('wallet/balance', params).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    )
  }

  public getColdStakingHistory(accountName: string): TransactionInfo[] {
    const params = new HttpParams()
      .set('walletName', this.globalService.getWalletName())
      .set('accountName', accountName);

    const history = this.get<WalletHistory>('wallet/history', params).pipe(
      map(response => {
        return response.history[0].transactionsHistory;
      }),
      catchError(err => {
        return this.handleHttpError(err);
      })
    ).toPromise().then(history => {
      return this.applyHistory(history, accountName);
    })
    return this.applyHistory(history, accountName);
  }

  private applyHistory(history, accountName): TransactionInfo[] {
    const subject = this.getColdStakingHistorySubject(accountName);
    const existingItems = subject.value;
    const newItems = [];
    history.forEach(item => {
      const index = existingItems.findIndex(existing => existing.id === item.id);
      if (index === -1) {
        const mapped = TransactionInfo.mapFromTransactionsHistoryItem(item);
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
    return set.sort((a, b) => b.timestamp - a.timestamp);
  }

  public coldStakingHistory(accountName: string): Observable<TransactionInfo[]> {
    return this.getColdStakingHistorySubject(accountName).asObservable();
  }

  private getColdStakingHistorySubject(accountName: string): BehaviorSubject<TransactionInfo[]> {
    if (!this.coldStakingHistorySubjects[this.globalService.getWalletName(), accountName]) {
      this.coldStakingHistorySubjects[this.globalService.getWalletName(), accountName] = new BehaviorSubject<TransactionInfo[]>([]);
    }
    return this.coldStakingHistorySubjects[this.globalService.getWalletName(), accountName];
  }

  public postColdStakingSetupFeeEstimation(data: ColdStakingSetup) {
    return this.post('coldstaking/estimate-cold-staking-setup-tx-fee', data).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }

  public postColdStakingSetupOfflineFeeEstimation(data: ColdStakingSetup) {
    return this.post('coldstaking/estimate-offline-cold-staking-setup-tx-fee', data).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }

  public postColdStakingWithdrawOfflineFeeEstimation(data: ColdStakingWithdrawal) {
    return this.post('coldStaking/estimate-offline-cold-staking-withdrawal-tx-fee', data).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }

  public invokePostColdStakingAccountApiCall(data: ColdStakingAccount): Observable<any> {
    return this.post('coldstaking/cold-staking-account', data).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }

  public invokePostSetupColdStakingApiCall(data: ColdStakingSetup): Observable<any> {
    return this.post('coldstaking/setup-cold-staking', data).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }

  public invokePostSetupOfflineColdStakingApiCall(data: ColdStakingSetup): Observable<any> {
    return this.post('coldstaking/setup-offline-cold-staking', data).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }

  public invokeOfflineSignRequest(data: any): Observable<any> {
    return this.post('wallet/offline-sign-request', data).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }

  public invokePostColdStakingWithdrawalApiCall(data: ColdStakingWithdrawal): Observable<any> {
    return this.post('coldstaking/cold-staking-withdrawal', data).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }

  public invokePostColdStakingOfflineWithdrawalApiCall(data: ColdStakingWithdrawal): Observable<any> {
    return this.post('coldStaking/offline-cold-staking-withdrawal', data).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }

  public invokeGetColdStakingAddressApiCall(data: ColdStakingAddress): Observable<any> {
    const params = new HttpParams()
      .set('walletName', data.walletName)
      .set('isColdWalletAddress', data.isColdWalletAddress.toString());

    return this.get('coldstaking/cold-staking-address', params).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }
}
