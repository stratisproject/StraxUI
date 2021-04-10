import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GeneralInfo, WalletBalance } from '@shared/services/interfaces/api.i';
import { NodeService } from '@shared/services/node-service';
import { WalletService } from '@shared/services/wallet.service';
import { GlobalService } from '@shared/services/global.service';

@Component({
  selector: 'status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss']
})
export class StatusBarComponent implements OnInit, OnDestroy {
  public amountConfirmed: number;
  public amountUnconfirmed: number;
  public percentSynced: string;
  public connectedNodes: number;
  public toolTip = '';
  public connectedNodesTooltip = '';
  private subscriptions: Subscription[] = [];

  constructor(
    public globalService: GlobalService,
    private walletService: WalletService,
    private nodeService: NodeService) {
  }

  public ngOnInit(): void {
    this.startWalletInfoSubscription();
    this.startGeneralInfoSubscription();
  }

  private startWalletInfoSubscription(): void {
    this.subscriptions.push(this.walletService.wallet().subscribe(
      response => {
        if (response) {
          this.amountConfirmed = response.amountConfirmed;
          this.amountUnconfirmed = response.amountUnconfirmed;
        }
      }
    ))
  }

  private startGeneralInfoSubscription(): void {
    this.subscriptions.push(this.nodeService.generalInfo().subscribe(
      response => {
        if (response) {
          this.connectedNodes = response.connectedNodes;

          // Don't show if wallet is ahead of chainTip
          if (response.lastBlockSyncedHeight > response.chainTip) {
            response.chainTip = response.lastBlockSyncedHeight;
          }

          this.percentSynced = (response.percentSynced || 0).toFixed(0) + '%';
          const processedText = `Processed ${response.lastBlockSyncedHeight || '0'} out of ${response.chainTip} blocks.`;

          this.toolTip = `Synchronizing. ${processedText}`;

          if (response.connectedNodes === 1) {
            this.connectedNodesTooltip = '1 connection';
          } else if (response.connectedNodes >= 0) {
            this.connectedNodesTooltip = `${response.connectedNodes} connections`;
          }

          if (response.percentSynced === 100) {
            this.toolTip = `Up to date.  ${processedText}`;
          }
        }
      }
    ));
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
