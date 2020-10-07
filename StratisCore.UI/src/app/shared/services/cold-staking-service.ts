import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GetColdStakingInfo } from '@shared/services/interfaces/api.i';
import { RestApi } from '@shared/services/rest-api';
import { GlobalService } from '@shared/services/global.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '@shared/services/error-service';
import { SignalRService } from '@shared/services/signalr-service';
import {
  SignalREvents,
  ColdStakingInfoSignalREvent
} from '@shared/services/interfaces/signalr-events.i';
import { catchError } from 'rxjs/operators';
import { ConsensusService } from '@shared/services/consensus-service';
import { DeploymentInfo } from '@shared/models/deployment-info';
import { ColdStakingAccount } from '@shared/models/cold-staking-account';
import { ColdStakingAddress } from '@shared/models/cold-staking-address';
import { ColdStakingSetup } from '@shared/models/cold-staking-setup';
import { ColdStakingWithdrawal } from '@shared/models/cold-staking-withdrawal';

@Injectable({
  providedIn: 'root'
})
export class ColdStakingService extends RestApi {
  private coldStakingInfoUpdatedSubject = new BehaviorSubject<GetColdStakingInfo>(null);
  private coldStakingDeploymentInfoSubject: BehaviorSubject<DeploymentInfo> = new BehaviorSubject<DeploymentInfo>({
    deploymentName: '',
    deploymentIndex: 0,
    stateValue: 0,
    thresholdState: '',
    height: 0,
    sinceHeight: 0,
    confirmationPeriod: 0,
    periodStartHeight: 0,
    periodEndHeight: 0,
    votes: 0,
    blocks: 0,
    versions: {
      '': 0
    },
    threshold: 0,
    timeStart: '',
    timeTimeOut: ''
  });
  public coldStakingActivated = false;
  public hasColdStakingSetup = false;
  public canStake: boolean;

  constructor(
    http: HttpClient,
    globalService: GlobalService,
    signalRService: SignalRService,
    consensusService: ConsensusService,
    errorService: ErrorService) {
    super(globalService, http, errorService);

    this.canStake = !globalService.getSidechainEnabled();

    consensusService.getDeploymentFlags().toPromise().then(response => {
      const coldStakingDeploymentInfo: DeploymentInfo = response.filter(x => x.deploymentName === "coldstaking")[0]
      this.coldStakingDeploymentInfoSubject.next(coldStakingDeploymentInfo);
    })

    signalRService.registerOnMessageEventHandler<ColdStakingInfoSignalREvent>(
      SignalREvents.ColdStakingInfo, (coldStakingInfo) => {
        if (coldStakingInfo.coldWalletAccountExists || coldStakingInfo.hotWalletAccountExists) {
          this.hasColdStakingSetup = true;
        }
        this.coldStakingInfoUpdatedSubject.next(coldStakingInfo);
      }
    );
  }

  public coldStakingInfo(): Observable<GetColdStakingInfo> {
    return this.coldStakingInfoUpdatedSubject.asObservable();
  }

  public coldStakingDeploymentInfo(): Observable<any> {
    return this.coldStakingDeploymentInfoSubject.asObservable();
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

  public invokePostColdStakingWithdrawalApiCall(data: ColdStakingWithdrawal): Observable<any> {
    return this.post('coldstaking/cold-staking-withdrawal', data).pipe(
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
