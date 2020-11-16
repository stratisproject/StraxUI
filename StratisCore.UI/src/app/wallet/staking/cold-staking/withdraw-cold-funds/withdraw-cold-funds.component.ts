import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardService } from 'ngx-clipboard';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ColdStakingService } from '@shared/services/cold-staking-service';
import { ColdStakingWithdrawal } from '@shared/models/cold-staking-withdrawal';
import { GlobalService } from '@shared/services/global.service';
import { WalletService } from '@shared/services/wallet.service';
import { FeeEstimation } from '@shared/models/fee-estimation';

@Component({
  selector: 'app-withdraw-cold-funds',
  templateUrl: './withdraw-cold-funds.component.html',
  styleUrls: ['./withdraw-cold-funds.component.scss']
})
export class WithdrawColdFundsComponent implements OnInit, OnDestroy {
  public copied = false;
  public transactionHex: string;
  public fee = 0; //Stratoshi
  public generated = false;
  public isGenerating = false;
  public walletName: string;
  public coinUnit: string;
  private withdrawColdFundsForm: FormGroup;
  private subscriptions: Subscription[] = [];
  constructor(private fb: FormBuilder, private clipboardService: ClipboardService, private coldStakingService: ColdStakingService,
      private globalService: GlobalService, public activeModal: NgbActiveModal, private walletService: WalletService) {
    this.buildWithdrawColdFundsForm();
    this.walletName = globalService.getWalletName();
    this.coinUnit = globalService.getCoinUnit();
   }

  ngOnInit(): void {
  }

  public copyToClipboardClicked(transactionHex: string): void {
    this.clipboardService.copyFromContent(transactionHex);
    this.copied = true;
  }

  public createWithdrawTx(): void {
    this.isGenerating = true;
    const withdrawData = new ColdStakingWithdrawal(
      this.withdrawColdFundsForm.get("receiveAddress").value,
      this.walletName,
      this.withdrawColdFundsForm.get("password").value,
      this.withdrawColdFundsForm.get("amount").value - (this.fee / 100000000),
      this.fee / 100000000
    );
    console.log(withdrawData);
    this.coldStakingService.invokePostColdStakingWithdrawalApiCall(withdrawData).toPromise().then(response => {
      this.transactionHex = response.transactionHex;
      this.isGenerating = false;
      this.generated = true;
    }, () => {
      this.isGenerating = false;
      this.generated = false;
    })
  }

  private estimateFee() {
    const feeEstimation = new FeeEstimation(
      this.walletName,
      this.coldStakingService.getColdStakingAccount(),
      this.withdrawColdFundsForm.get("receiveAddress").value,
      "",
      this.withdrawColdFundsForm.get("amount").value,
      "medium",
      true
    )

    this.walletService.estimateFee(feeEstimation).toPromise().then(response => {
      this.fee = response;
    })
  }

  private buildWithdrawColdFundsForm(): void {
    this.withdrawColdFundsForm = this.fb.group({
      amount: ['', Validators.required],
      receiveAddress: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.subscriptions.push(this.withdrawColdFundsForm.valueChanges
      .subscribe(() => this.onValueChanged()));

    this.onValueChanged();
  }

  private onValueChanged(): void {
    if (!this.withdrawColdFundsForm) {
      return;
    }
    const form = this.withdrawColdFundsForm;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }

    if (this.withdrawColdFundsForm.valid) {
      this.estimateFee();
    }
  }

  private formErrors = {
    password: ''
  };

  private validationMessages = {
    password: {
      required: 'Please enter your password.'
    }
  };

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
