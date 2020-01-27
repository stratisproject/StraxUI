import { Component, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { GlobalService } from '@shared/services/global.service';
import { ColdStakingService } from '@shared/services/cold-staking-service';
import { ColdStakingCreateSuccessComponent } from '../create-success/create-success.component';

enum HotColdWallet { Hot = 1, Cold }

@Component({
    selector: 'app-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class ColdStakingCreateComponent {
    private _amount;
    private _amountFormatted = '';
    private _destinationAddress = '';
    private _password = '';
    passwordValid = false;
    canCreate = false;
    opacity = 1;
    HotColdWalletEnum = HotColdWallet;
    hotColdWalletSelection = HotColdWallet.Hot;

    constructor(private globalService: GlobalService, private coldStakingService: ColdStakingService,
        private activeModal: NgbActiveModal, private modalService: NgbModal, private routerService: Router) {
        this.setCanCreate();
    }

    @Input()
    set amount(value: number) {
        this._amount = value;
        this._amountFormatted = this._amount.toString();
        this.setCanCreate();
    }
    get amount(): number {
        return this._amount;
    }

    @Input()
    set destinationAddress(value: string) {
        this._destinationAddress = value;
        this.setCanCreate();
    }
    get destinationAddress(): string {
        return this._destinationAddress;
    }

    @Input()
    set password(value: string) {
        this._password = value;
        this.passwordValid = this._password.length > 0;
        this.setCanCreate();
    }
    get password(): string {
        return this._password;
    }

    private setCanCreate(): void {
        this.canCreate = this._amountFormatted.length && this._destinationAddress.length && this.passwordValid;
    }

    public createClicked(): void {
        // this.coldStakingService.CreateColdstaking(this.globalService.getWalletName())
        //     .subscribe(success => {
        //         if (success) {
        //             this.opacity = .5;
        //             this.modalService.open(ColdStakingCreateSuccessComponent, { backdrop: 'static' }).result
        //                 .then(() => this.activeModal.close());
        //         }
        //     });
    }

    closeClicked = (): void => this.activeModal.close();
}
