import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardService } from 'ngx-clipboard';

import { GlobalService } from '@shared/services/global.service';
import { ColdStakingService } from '@shared/services/cold-staking-service';

@Component({
    selector: 'app-create-address',
    templateUrl: './create-address.component.html',
    styleUrls: ['./create-address.component.scss']
})
export class ColdStakingCreateAddressComponent implements OnInit {

    constructor(private globalService: GlobalService, private coldStakingService: ColdStakingService,
        private activeModal: NgbActiveModal, private clipboardService: ClipboardService) { }

    address = '';
    addressCopied = false;

    ngOnInit(): void {
        //this.coldStakingService.GetAddress(this.globalService.getWalletName()).subscribe(x => this.address = x);
    }

    closeClicked(): void {
        this.activeModal.close();
    }

    copyClicked(): void {
        if (this.address) {
            this.addressCopied = this.clipboardService.copyFromContent(this.address);
        }
    }
}
