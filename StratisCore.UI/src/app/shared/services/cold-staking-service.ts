import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestApi } from '@shared/services/rest-api';
import { GlobalService } from '@shared/services/global.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '@shared/services/error-service';
import { catchError } from 'rxjs/operators';
import { ColdStakingAccount } from '@shared/models/cold-staking-account';
import { ColdStakingAddress } from '@shared/models/cold-staking-address';
import { ColdStakingSetup } from '@shared/models/cold-staking-setup';
import { ColdStakingWithdrawal } from '@shared/models/cold-staking-withdrawal';
import { LoggerService } from '@shared/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class ColdStakingService extends RestApi {
  private coldStakingAccount: string;
  public hasColdStakingSetup = false;

  constructor(
    http: HttpClient,
    globalService: GlobalService,
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
