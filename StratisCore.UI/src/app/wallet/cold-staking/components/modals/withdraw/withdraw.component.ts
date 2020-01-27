import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalService } from '@shared/services/global.service';
import { ColdStakingService } from '@shared/services/cold-staking-service';

@Component({
    selector: 'app-withdraw',
    templateUrl: './withdraw.component.html',
    styleUrls: ['./withdraw.component.scss']
})
export class ColdStakingWithdrawComponent implements OnInit {
    private _amount;
    private _amountFormatted = '';
    private _amountSpendable = 0;
    private _destinationAddress = '';
    private _password = '';
    amountSpendableFormatted = '';
    passwordValid = false;
    canWithdraw = false;

    constructor(private globalService: GlobalService, private coldStakingService: ColdStakingService, private activeModal: NgbActiveModal) {
    }

    @Input()
    set amount(value: number) {
        this._amount = value;
        this._amountFormatted = this._amount.toString();
        this.setCanWithdraw();
    }
    get amount(): number {
        return this._amount;
    }

    @Input()
    set destinationAddress(value: string) {
        this._destinationAddress = value;
        this.setCanWithdraw();
    }
    get destinationAddress(): string {
        return this._destinationAddress;
    }

    @Input()
    set password(value: string) {
        this._password = value;
        this.passwordValid = this._password.length > 0;
        this.setCanWithdraw();
    }
    get password(): string {
        return this._password;
    }

    private setCanWithdraw(): void {
        this.canWithdraw = this._amountFormatted.length && this._destinationAddress.length && this.passwordValid;
    }

    ngOnInit(): void {
        this.setCanWithdraw();

        // this.coldStakingService.GetInfo(this.globalService.getWalletName()).subscribe(x => {
        //     this._amountSpendable = x.coldWalletAmount;
        //     this.amountSpendableFormatted = this._amountSpendable.toLocaleString();
        // });
    }

    withdrawClicked(): void {
    }

    closeClicked = (): void => this.activeModal.close();
}
