import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ColdStakingInfo } from '@shared/services/interfaces/api.i';
import { RestApi } from '@shared/services/rest-api';
import { GlobalService } from '@shared/services/global.service';
import { HttpClient } from '@angular/common/http';
import { ErrorService } from '@shared/services/error-service';
import { SignalRService } from '@shared/services/signalr-service';
import {
  SignalREvents,
  ColdStakingInfoSignalREvent
} from '@shared/services/interfaces/signalr-events.i';

@Injectable({
  providedIn: 'root'
})
export class ColdStakingService extends RestApi {
  private coldStakingInfoUpdatedSubject = new BehaviorSubject<ColdStakingInfo>(null);
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

  public coldStakingInfo(): Observable<ColdStakingInfo> {
    return this.coldStakingInfoUpdatedSubject.asObservable();
  }
}
