import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { ColdStakingService } from '@shared/services/cold-staking-service';
import { GlobalService } from '@shared/services/global.service';
import { ColdStakingAccount } from '@shared/models/cold-staking-account';
import { ColdStakingAddress } from '@shared/models/cold-staking-address';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SnackbarService } from 'ngx-snackbar';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ExtPubKeyImport } from '@shared/models/extpubkey-import';
import { WalletService } from '@shared/services/wallet.service';
import { ColdStakingSetup } from '@shared/models/cold-staking-setup';

@Component({
  selector: 'app-hot-wallet',
  templateUrl: './hot-wallet.component.html',
  styleUrls: ['./hot-wallet.component.scss']
})
export class HotWalletComponent implements OnInit, OnDestroy {
  private passwordForm: FormGroup;
  private importPubKeyForm: FormGroup;
  private coldStakingForm: FormGroup;
  private subscriptions: Subscription[] = [];
  public hasHotStakingSetup = false;
  public isConfirming = false;
  public confirmed = false;
  public walletName: string;
  public address: string;
  public creationDate: Date;
  public minDate = new Date("2016-01-01");
  public maxDate = new Date();
  public bsConfig: Partial<BsDatepickerConfig>;
  public estimatedFee: number;
  public hasEstimatedSetupFee = false;
  public hasColdStakingSetup = false;
  public unsignedTransactionEncoded: any;

  constructor(private clipboardService: ClipboardService, private coldStakingService: ColdStakingService, private globalService: GlobalService, private fb: FormBuilder, private snackbarService: SnackbarService, private walletService: WalletService) {
    this.buildPasswordForm();
    this.buildImportPubKeyForm();
    this.buildColdStakingForm();
    this.bsConfig = Object.assign({}, {showWeekNumbers: false, containerClass: 'theme-dark-blue'});
  }

  ngOnInit(): void {
    this.walletName = this.globalService.getWalletName();
    this.hasHotStakingSetup = (localStorage.getItem("hasHotStaking" + this.walletName) === "true") ? true : false;
    if (this.hasHotStakingSetup) {
      const addressData = new ColdStakingAddress(
        this.walletName,
        false
      )
      this.coldStakingService.invokeGetColdStakingAddressApiCall(addressData).toPromise().then(response => {
        this.address = response.address;
      })
    }
  }

  public confirmSetup(): void {
    this.isConfirming = true;
    const data: ColdStakingAccount = new ColdStakingAccount(
      this.walletName,
      this.passwordForm.get("password").value,
      false
    )
    this.coldStakingService.invokePostColdStakingAccountApiCall(data).toPromise().then(response => {
      if (response) {
        const addressData = new ColdStakingAddress(
          this.walletName,
          false
        )
        this.coldStakingService.invokeGetColdStakingAddressApiCall(addressData).toPromise().then(response => {
          if (response) {
            this.address = response.address;
            this.confirmed = true;
            localStorage.setItem("hasHotStaking" + this.walletName, "true");
            this.snackbarService.add({
              msg: `This node has been set up as a hot staking node`,
              customClass: 'notify-snack-bar',
              action: {
                text: null
              }
            });
          } else {
            this.isConfirming = false;
          }
        })
      } else {
        this.isConfirming = false;
      }
    });
  }

  public onImportClicked(): void {
    const recoveryDate = new Date(this.importPubKeyForm.get("creationDate").value);
    recoveryDate.setDate(recoveryDate.getDate() - 1);

    const extPubKeyImportData = new ExtPubKeyImport(
      this.importPubKeyForm.get("extPubKey").value,
      0, // account 0
      this.importPubKeyForm.get("walletName").value,
      recoveryDate
    )

    this.walletService.importExtPubKey(extPubKeyImportData).toPromise().then(
      response => {
        this.snackbarService.add({
          msg: `Succesfully imported your cold wallet extended public key.`,
          customClass: 'notify-snack-bar',
          action: {
            text: null
          }
        });
      }
    );
  }

  public onColdStakingSetupClicked(): void {
    this.estimateColdStakingSetupFee();
  }

  public confirmColdStakingSetup(): void {
    let setupData = new ColdStakingSetup(
      this.coldStakingForm.get('coldWalletAddress').value,
      this.coldStakingForm.get('hotWalletAddress').value,
      this.coldStakingForm.get('coldWalletName').value,
      "account 0",
      this.coldStakingForm.get('amount').value - (this.estimatedFee / 100000000),
      this.estimatedFee / 100000000,
      null,
      true
    )
    this.coldStakingService.invokePostSetupOfflineColdStakingApiCall(setupData).toPromise().then(response => {
      let objJsonStr = JSON.stringify(response);
      this.unsignedTransactionEncoded = Buffer.from(objJsonStr).toString("base64");
      this.hasColdStakingSetup = true;
    })
  }

  private estimateColdStakingSetupFee(): void {
    const data = new ColdStakingSetup(
      this.coldStakingForm.get('coldWalletAddress').value,
      this.coldStakingForm.get('hotWalletAddress').value,
      this.coldStakingForm.get('coldWalletName').value,
      "account 0",
      this.coldStakingForm.get('amount').value,
      0,
      null,
      true
    )
    this.coldStakingService.postColdStakingSetupOfflineFeeEstimation(data).toPromise().then(response => {
      this.estimatedFee = response;
      this.hasEstimatedSetupFee = true;
    });
  }

  public recoverHotStakingWallet() {
    const data: ColdStakingAccount = new ColdStakingAccount(
      this.walletName,
      this.passwordForm.get("password").value,
      false
    )
    this.coldStakingService.invokePostColdStakingAccountApiCall(data).toPromise().then(response => {
      if (response) {
        const addressData = new ColdStakingAddress(
          this.walletName,
          false
        )
        this.coldStakingService.invokeGetColdStakingAddressApiCall(addressData).toPromise().then(response => {
          localStorage.setItem("hasHotStaking" + this.walletName, "true");
          this.snackbarService.add({
            msg: `This node has been set up as a hot staking node`,
            customClass: 'notify-snack-bar',
            action: {
              text: null
            }
          });
        })
      }
    });

    this.hasHotStakingSetup = true;
  }

  public copyToClipboardClicked(address: string): void {
    this.clipboardService.copyFromContent(address);
    this.snackbarService.add({
      msg: `Address ${address} has been copied to your clipboard.`,
      customClass: 'notify-snack-bar',
      action: {
        text: null
      }
    });
  }

  public copyUnsignedTransactionToClipboardClicked(unsignedTransaction: string): void {
    this.clipboardService.copyFromContent(unsignedTransaction);
    this.snackbarService.add({
      msg: `The transaction has been copied to your clipboard.`,
      customClass: 'notify-snack-bar',
      action: {
        text: null
      }
    });
  }

  private buildPasswordForm(): void {
    this.passwordForm = this.fb.group({
      password: ['', Validators.required]
    });

    this.subscriptions.push(this.passwordForm.valueChanges
      .subscribe(() => this.onPasswordFormValueChanged()));

    this.onPasswordFormValueChanged();
  }

  private onPasswordFormValueChanged(): void {
    if (!this.passwordForm) {
      return;
    }
    const form = this.passwordForm;
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

  private buildImportPubKeyForm(): void {
    this.importPubKeyForm = this.fb.group({
      walletName: ['', Validators.required],
      extPubKey: ['', Validators.required],
      creationDate: ['', Validators.required]
    });

    this.subscriptions.push(this.importPubKeyForm.valueChanges
      .subscribe(() => this.onImportPubKeyValueChanged()));

    this.onImportPubKeyValueChanged();
  }

  private onImportPubKeyValueChanged(): void {
    if (!this.importPubKeyForm) {
      return;
    }
    const form = this.importPubKeyForm;
    for (const field in this.importPubKeyFormErrors) {
      this.importPubKeyFormErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.importPubKeyValidationMessages[field];
        for (const key in control.errors) {
          this.importPubKeyFormErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  private importPubKeyFormErrors = {
    walletName: '',
    extPubKey: '',
    creationDate: ''
  };

  private importPubKeyValidationMessages = {
    walletName: {
      required: 'A wallet name is required'
    },
    extPubKey: {
      required: 'The extended public key is required.'
    },
    password: {
      required: 'Please enter your password.'
    }
  };

  private buildColdStakingForm(): void {
    this.coldStakingForm = this.fb.group({
      coldWalletName: ['', Validators.required],
      amount: ['', Validators.compose([Validators.required, Validators.min(0)])],
      coldWalletAddress: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      hotWalletAddress: ['', Validators.compose([Validators.required, Validators.minLength(26)])]
    });

    this.subscriptions.push(this.coldStakingForm.valueChanges
      .subscribe(() => this.onColdStakingFormValueChanged()));

    this.onColdStakingFormValueChanged();
  }

  private onColdStakingFormValueChanged(): void {
    if (!this.coldStakingForm) {
      return;
    }
    const form = this.coldStakingForm;
    for (const field in this.coldStakingFormErrors) {
      this.coldStakingFormErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.coldStakingFormValidationMessages[field];
        for (const key in control.errors) {
          this.coldStakingFormErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  private coldStakingFormErrors = {
    coldWalletName: '',
    amount: '',
    coldWalletAddress: '',
    hotWalletAddress: ''
  };

  private coldStakingFormValidationMessages = {
    coldWalletName: {
      required: 'The name of your imported cold wallet is required.'
    },
    amount: {
      required: 'Please enter an amount.',
      min: 'A negative amount is not allowed.'
    },
    coldWalletAddress: {
      required: 'Please enter your cold wallet address.',
      minlength: 'An address is at least 26 characters long.'
    },
    hotWalletAddress: {
      required: 'Please enter your hot wallet address.',
      minlength: 'An address is at least 26 characters long.'
    }
  };

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
