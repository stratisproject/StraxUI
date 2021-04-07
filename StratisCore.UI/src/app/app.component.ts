import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { retryWhen, delay, tap } from 'rxjs/operators';
import { ElectronService } from 'ngx-electron';
import { GlobalService } from '@shared/services/global.service';
import { NodeService } from '@shared/services/node-service';
import { FullNodeEventModel } from '@shared/services/interfaces/api.i';
import { SignalRService } from '@shared/services/signalr-service';
import { ApiService } from '@shared/services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private globalService: GlobalService, private apiService: ApiService, private titleService: Title, private electronService: ElectronService, private nodeService: NodeService, private signalRService: SignalRService) {
  }

  public fullNodeEvent: Observable<FullNodeEventModel>;
  public loading = true;
  public loadingFailed = false;
  public currentMessage: string;
  public currentState: string;

  private subscription: Subscription;
  private statusIntervalSubscription: Subscription;
  private readonly MaxRetryCount = 30;
  private readonly TryDelayMilliseconds = 2000;
  private lastFeatureNamespace = 'Stratis.Features.Diagnostic.DiagnosticFeature';
  public errorMessage: string;

  ngOnInit(): void {
    this.setTitle();
    this.fullNodeEvent = this.nodeService.FullNodeEvent();
    setTimeout(() => this.checkResponse(), 5000);

    this.fullNodeEvent.subscribe(response => {
      if (response) {
        this.currentMessage = response.message;
        this.currentState = response.state;

        if (response.state === "Started") {
          this.loading = false;
          this.router.navigate(['login']);
        }

        if (response.state === "Failed") {
          this.loading = false;
          this.loadingFailed = true;
        }
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.statusIntervalSubscription) {
      this.statusIntervalSubscription.unsubscribe();
    }
  }

  private checkResponse() {
    if (!this.currentState) {
      this.getStatusThroughApi()
    }
  }

  private getStatusThroughApi(): void {
    console.log("Getting status from API.");
    let retry = 0;
    const stream$ = this.apiService.getNodeStatus(true).pipe(
      retryWhen(errors =>
        errors.pipe(delay(this.TryDelayMilliseconds)).pipe(
          tap(errorStatus => {
            if (retry++ === this.MaxRetryCount) {
              throw errorStatus;
            }
            console.log(`Retrying ${retry}...`);
          })
        )
      )
    );

    this.subscription = stream$.subscribe(
      () => {
        this.statusIntervalSubscription = this.apiService.getNodeStatusInterval(true)
          .subscribe(
            response => {
              const statusResponse = response.featuresData.filter(x => x.namespace === 'Stratis.Bitcoin.Base.BaseFeature');
              const lastFeatureResponse = response.featuresData.find(x => x.namespace === this.lastFeatureNamespace);
              if (statusResponse.length > 0 && statusResponse[0].state === 'Initialized'
                && lastFeatureResponse && lastFeatureResponse.state === 'Initialized') {
                this.loading = false;
                this.statusIntervalSubscription.unsubscribe();
                this.router.navigate(['login']);
              }
            }
          );
      }, error => {
        this.errorMessage = error.message;
        console.log('Failed to start wallet');
        this.loading = false;
        this.loadingFailed = true;
      }
    );
  }

  private setTitle(): void {
    const applicationName = 'Strax Wallet';
    const testnetSuffix = this.globalService.getTestnetEnabled() ? ' (testnet)' : '';
    const title = `${applicationName} ${this.globalService.getApplicationVersion()}${testnetSuffix} - Community Testing`;
    this.titleService.setTitle(title);
  }

  public openSupport(): void {
    this.electronService.shell.openExternal('https://discord.gg/yb8SbycNQf');
  }
}
