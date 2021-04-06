import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { ElectronService } from 'ngx-electron';
import { GlobalService } from '@shared/services/global.service';
import { NodeService } from '@shared/services/node-service';
import { FullNodeEventModel } from '@shared/services/interfaces/api.i';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent implements OnInit {
  constructor(private router: Router, private globalService: GlobalService, private titleService: Title, private electronService: ElectronService, private nodeService: NodeService) {
  }

  public fullNodeEvent: Observable<FullNodeEventModel>;
  public loading = true;
  public loadingFailed = false;
  public currentMessage: string;
  public currentState: string;

  ngOnInit(): void {
    this.setTitle();
    this.fullNodeEvent = this.nodeService.FullNodeEvent();

    this.fullNodeEvent.subscribe(response => {
      if (response) {
        this.currentMessage = response.message;
        this.currentState = response.state;
        console.log("message: " + this.currentMessage + "\nstate: " + this.currentState);
      }

      if (response.state === "Started") {
        this.loading = false;
        this.router.navigate(['login']);
      }

      if (response.state === "Failed") {
        this.loading = false;
        this.loadingFailed = true;
      }
    })
  }

  private setTitle(): void {
    const applicationName = 'Strax Wallet';
    const testnetSuffix = this.globalService.getTestnetEnabled() ? ' (testnet)' : '';
    const title = `${applicationName} ${this.globalService.getApplicationVersion()}${testnetSuffix} - Community Testing`;
    this.titleService.setTitle(title);
  }

  public openSupport(): void {
    this.electronService.shell.openExternal('https://github.com/stratisproject/StraxUI/');
  }
}
