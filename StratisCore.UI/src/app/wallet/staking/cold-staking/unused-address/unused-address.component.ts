import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ColdStakingAddress } from '@shared/models/cold-staking-address';
import { ColdStakingService } from '@shared/services/cold-staking-service';
import { GlobalService } from '@shared/services/global.service';
import { ClipboardService } from 'ngx-clipboard';
import { SnackbarService } from 'ngx-snackbar';

@Component({
  selector: 'app-unused-address',
  templateUrl: './unused-address.component.html',
  styleUrls: ['./unused-address.component.scss']
})
export class UnusedAddressComponent implements OnInit {
  public address: string;

  constructor(public globalService: GlobalService, public coldStakingService: ColdStakingService, public activeModal: NgbActiveModal, public clipboardService: ClipboardService, public snackbarService: SnackbarService) { }

  ngOnInit() {
    const data = new ColdStakingAddress(this.globalService.getWalletName(), false);
    this.coldStakingService.invokeGetColdStakingAddressApiCall(data).toPromise().then(res => {
      this.address = res.address;
    });
  }

  public copyToClipboardClicked(address): void {
    if (this.clipboardService.copyFromContent(address)) {
      this.snackbarService.add({
        msg: `Address ${address} copied to clipboard`,
        customClass: 'notify-snack-bar',
        action: {
          text: null
        }
      });
    }
  }
}
