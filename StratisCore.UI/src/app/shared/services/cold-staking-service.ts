import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GetColdStakingInfo, PostColdStakingAccount, GetColdStakingAddress, PostSetupColdStaking, PostColdStakingWithdrawal } from '@shared/services/interfaces/api.i';
import { RestApi } from '@shared/services/rest-api';
import { GlobalService } from '@shared/services/global.service';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from '@shared/services/error-service';
import { SignalRService } from '@shared/services/signalr-service';
import {
  SignalREvents,
  ColdStakingInfoSignalREvent
} from '@shared/services/interfaces/signalr-events.i';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ColdStakingService extends RestApi {
  private coldStakingInfoUpdatedSubject = new BehaviorSubject<GetColdStakingInfo>(null);
  public hasColdStakingSetup = new BehaviorSubject<boolean>(false);
  public canStake: boolean;

  constructor(
    http: HttpClient,
    globalService: GlobalService,
    signalRService: SignalRService,
    errorService: ErrorService) {
    super(globalService, http, errorService);

    this.canStake = !globalService.getSidechainEnabled();

    signalRService.registerOnMessageEventHandler<ColdStakingInfoSignalREvent>(
      SignalREvents.ColdStakingInfo, (coldStakingInfo) => {
        if (coldStakingInfo.coldWalletAccountExists || coldStakingInfo.hotWalletAccountExists) {
          this.hasColdStakingSetup.next(true);
        }
        this.coldStakingInfoUpdatedSubject.next(coldStakingInfo);
      }
    );
  }

  public coldStakingInfo(): Observable<GetColdStakingInfo> {
    return this.coldStakingInfoUpdatedSubject.asObservable();
  }

  private invokePostColdStakingAccountApiCall(data: PostColdStakingAccount): Observable<any> {
    return this.post('coldstaking/cold-staking-account', data).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }

  private invokePostSetupColdStakingApiCall(data: PostSetupColdStaking): Observable<any> {
    return this.post('coldstaking/setup-cold-staking', data).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }

  private invokePostColdStakingWithdrawalApiCall(data: PostColdStakingWithdrawal): Observable<any> {
    return this.post('coldstaking/cold-staking-withdrawal', data).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }

  private invokeGetColdStakingAddressApiCall(data: GetColdStakingAddress): Observable<any> {
    return this.post('coldstaking/cold-staking-address', data).pipe(
      catchError(err => {
        return this.handleHttpError(err);
      })
    );
  }
}
