import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { RestApi } from '@shared/services/rest-api';
import { GlobalService } from '@shared/services/global.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ErrorService } from '@shared/services/error-service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class ConsensusService extends RestApi {
  constructor(
    globalService: GlobalService,
    http: HttpClient,
    errorService: ErrorService
  ) {
    super(globalService, http, errorService);
  }

  public getDeploymentFlags(): Observable<any> {
    return this.get('consensus/deploymentflags').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public getBestBlockHash(): Observable<any> {
    return this.get('consensus/getbestblockhash').pipe(
      catchError(err => this.handleHttpError(err))
    );
  }

  public getBlockHash(height: number) {
    const params = new HttpParams()
      .set('height', height.toString())

    return this.get('consensus/getblockhash', params).pipe(
      catchError(err => this.handleHttpError(err))
    );
  }
}
