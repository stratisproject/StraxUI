import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClipboardService } from 'ngx-clipboard';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ColdStakingService } from '@shared/services/cold-staking-service';
import { ColdStakingWithdrawal } from '@shared/models/cold-staking-withdrawal';
import { GlobalService } from '@shared/services/global.service';

@Component({
  selector: 'app-withdraw-cold-funds',
  templateUrl: './withdraw-cold-funds.component.html',
  styleUrls: ['./withdraw-cold-funds.component.scss']
})
export class WithdrawColdFundsComponent implements OnInit, OnDestroy {
  public copied = false;
  public transactionHex: string;
  public fee = 20000; //Stratoshi
  public generated = false;
  private withdrawColdFundsForm: FormGroup;
  private subscriptions: Subscription[] = [];
  constructor(private fb: FormBuilder, private clipboardService: ClipboardService, private coldStakingService: ColdStakingService, private globalService: GlobalService, public activeModal: NgbActiveModal) {
    this.buildWithdrawColdFundsForm();
   }

  ngOnInit(): void {
  }

  public copyToClipboardClicked(transactionHex: string): void {
    this.clipboardService.copyFromContent(transactionHex);
    this.copied = true;
  }

  public createWithdrawTx(): void {
    const withdrawData = new ColdStakingWithdrawal(
      this.withdrawColdFundsForm.get("receiveAddress").value,
      this.globalService.getWalletName(),
      this.withdrawColdFundsForm.get("password").value,
      this.withdrawColdFundsForm.get("amount").value,
      this.fee / 100000000
    );
    this.coldStakingService.invokePostColdStakingWithdrawalApiCall(withdrawData).toPromise().then(response => {
      this.transactionHex = response.transactionHex;
      this.generated = true;
    }, () => this.generated = false);
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
