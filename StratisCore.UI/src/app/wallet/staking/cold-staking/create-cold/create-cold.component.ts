import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ColdStakingService } from '@shared/services/cold-staking-service';
import { GlobalService } from '@shared/services/global.service';
import { ColdStakingAccount } from '@shared/models/cold-staking-account';
import { ColdStakingAddress } from '@shared/models/cold-staking-address';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ColdStakingSetup } from '@shared/models/cold-staking-setup';

@Component({
  selector: 'app-create-cold',
  templateUrl: './create-cold.component.html',
  styleUrls: ['./create-cold.component.scss']
})
export class CreateColdComponent implements OnInit, OnDestroy {
  private coldStakingForm: FormGroup;
  private subscriptions: Subscription[] = [];
  public address: string;
  public estimatedFee: number;
  public copied = false;
  public confirmed = false;
  public hasSetup = false;
  public walletName: string;
  public coinUnit: string;
  public transactionHex: string;

  constructor(private globalService: GlobalService, private clipboardService: ClipboardService, private coldStakingService: ColdStakingService, private fb: FormBuilder, public activeModal: NgbActiveModal) {
    this.buildColdStakingForm();
   }

  ngOnInit(): void {
    this.walletName = this.globalService.getWalletName();
    this.coinUnit = this.globalService.getCoinUnit();
  }

  public confirmSetup(): void {
    const data: ColdStakingAccount = new ColdStakingAccount(
      this.walletName,
      this.coldStakingForm.get("password").value,
      true
    )
    this.coldStakingService.invokePostColdStakingAccountApiCall(data).toPromise().then(() => {
      const addressData = new ColdStakingAddress(
        this.walletName,
        true
      )
      this.coldStakingService.invokeGetColdStakingAddressApiCall(addressData).toPromise().then(response => {
        this.address = response.address;
        this.estimateColdStakingSetupFee();
      })
    })
  }

  public invokeSetup(): void {
    // let setupData = new ColdStakingSetup(
    //   this.address,
    //   this.coldStakingForm.get('hotWalletAddress').value,
    //   this.walletName,
    //   this.coldStakingForm.get("password").value,
    //   this.globalService.getWalletAccount(),
    //   this.coldStakingForm.get('amount').value - (this.estimatedFee / 100000000),
    //   this.estimatedFee / 100000000,
    //   true
    // )
    // this.coldStakingService.invokePostSetupColdStakingApiCall(setupData).toPromise().then(response => {
    //   localStorage.setItem("hasColdStaking"  + this.walletName, "true");
    //   this.transactionHex = response.transactionHex;
    //   this.hasSetup = true;
    // })
  }

  private estimateColdStakingSetupFee(): void {
    // const data = new ColdStakingSetup(
    //   this.address,
    //   this.coldStakingForm.get('hotWalletAddress').value,
    //   this.walletName,
    //   this.coldStakingForm.get("password").value,
    //   this.globalService.getWalletAccount(),
    //   this.coldStakingForm.get('amount').value,
    //   0,
    //   true
    // )
    // this.coldStakingService.postColdStakingSetupFeeEstimation(data).toPromise().then(response => {
    //   this.estimatedFee = response;
    //   this.confirmed = true;
    // });
  }

  public copyToClipboardClicked(transactionHex: string): void {
    this.clipboardService.copyFromContent(transactionHex);
    this.copied = true;
  }

  private buildColdStakingForm(): void {
    this.coldStakingForm = this.fb.group({
      amount: ['', Validators.compose([Validators.required, Validators.min(0)])],
      hotWalletAddress: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      password: ['', Validators.required]
    });

    this.subscriptions.push(this.coldStakingForm.valueChanges
      .subscribe(() => this.onValueChanged()));

    this.onValueChanged();
  }

  private onValueChanged(): void {
    if (!this.coldStakingForm) {
      return;
    }
    const form = this.coldStakingForm;
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
    amount: '',
    hotWalletAddress: '',
    password: ''
  };

  private validationMessages = {
    amount: {
      required: 'Please enter an amount.',
      min: 'A negative amount is not allowed.'
    },
    hotWalletAddress: {
      required: 'Please enter your hot wallet address.',
      minlength: 'An address is at least 26 characters long.'
    },
    password: {
      required: 'Please enter your password.'
    }
  };

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
