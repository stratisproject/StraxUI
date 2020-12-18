import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColdStakingAccount } from '@shared/models/cold-staking-account';
import { ColdStakingAddress } from '@shared/models/cold-staking-address';
import { ColdStakingSetup } from '@shared/models/cold-staking-setup';
import { WalletInfo } from '@shared/models/wallet-info';
import { ApiService } from '@shared/services/api.service';
import { ColdStakingService } from '@shared/services/cold-staking-service';
import { GlobalService } from '@shared/services/global.service';
import { ClipboardService } from 'ngx-clipboard';
import { SnackbarService } from 'ngx-snackbar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cold-wallet',
  templateUrl: './cold-wallet.component.html',
  styleUrls: ['./cold-wallet.component.scss']
})
export class ColdWalletComponent implements OnInit, OnDestroy {
  public setupColdStakingAccountForm: FormGroup;
  public coldStakingForm: FormGroup;
  public recoveryForm: FormGroup;
  private subscriptions: Subscription[] = [];
  private setupData: ColdStakingSetup;
  public hasColdStakingAccount = false;
  public coldStakingAddress: string;
  public walletName: string;
  public coinUnit: string;
  public extPubKey: string;
  public transactionHex: string;
  public unsignedTransaction: any;
  public decodedTransaction: UnsignedTransaction;
  public coldStakingAmount: number;
  public coldStakingFee: number;
  public coldStakingColdAddress: string;
  public coldStakingHotAddress: string;

  constructor(private globalService: GlobalService, private coldStakingService: ColdStakingService, private clipboardService: ClipboardService, private fb: FormBuilder, private snackbarService: SnackbarService, private apiService: ApiService) {
    this.buildSetupColdStakingAccountForm();
    this.buildColdStakingForm();
    this.buildRecoveryForm();
  }

  ngOnInit() {
    this.walletName = this.globalService.getWalletName();
    this.coinUnit = this.globalService.getCoinUnit();
    this.hasColdStakingAccount = (localStorage.getItem("hasColdStaking" + this.walletName) === "true") ? true : false;
    if (this.hasColdStakingAccount) {
      this.getColdStakingAccountAddress(this.walletName);
      this.getExtPubKey();
    }
  }

  public setupColdStakingAccount(): void {
    const data: ColdStakingAccount = new ColdStakingAccount(
      this.walletName,
      this.setupColdStakingAccountForm.get("password").value,
      true
    )
    this.coldStakingService.invokePostColdStakingAccountApiCall(data).toPromise().then(() => {
      localStorage.setItem("hasColdStaking"  + this.walletName, "true");
      this.getColdStakingAccountAddress(this.walletName);
      this.getExtPubKey();
      this.hasColdStakingAccount = (localStorage.getItem("hasColdStaking" + this.walletName) === "true") ? true : false;
    })

    this.snackbarService.add({
      msg: `This node has been set up as a cold staking wallet.`,
      customClass: 'notify-snack-bar',
      action: {
        text: null
      }
    });
  }

  private getColdStakingAccountAddress(walletName: string): void {
    let addressData = new ColdStakingAddress(
      walletName,
      true
    )

    this.coldStakingService.invokeGetColdStakingAddressApiCall(addressData).toPromise().then(response => {
      this.coldStakingAddress = response.address;
    })
  }

  private getExtPubKey(): void {
    const walletInfo = new WalletInfo(this.walletName, "coldStakingColdAddresses");
    this.apiService.getExtPubkey(walletInfo)
      .toPromise().then(
      response => {
        this.extPubKey = response;
      }
    );
  }

  public decodeUnsignedTransaction(): void {
    this.unsignedTransaction = this.coldStakingForm.get('unsignedTransaction').value;
    this.decodedTransaction = JSON.parse(atob(this.unsignedTransaction));
    this.decodedTransaction.walletName = this.walletName;
    this.decodedTransaction.walletPassword = this.coldStakingForm.get('password').value;
    this.decodedTransaction.fee = this.decodedTransaction.fee.replace(/,/g, '.');
    this.coldStakingService.invokeOfflineSignRequest(this.decodedTransaction).toPromise().then(response => {
      this.transactionHex = response.hex;
    })
  }

  public confirmColdStakingSetup(): void {
    // this.coldStakingService.invokeOfflineSignRequest(this.decodedTransaction).toPromise().then( response => {
    //   this.transactionHex = response;
    // })
  }

  public copyAddressToClipboard(address: string): void {
    this.clipboardService.copyFromContent(address);
    this.snackbarService.add({
      msg: `Address ${address} has been copied to your clipboard.`,
      customClass: 'notify-snack-bar',
      action: {
        text: null
      }
    });
  }

  public copyExtPubKeyToClipboard(extPubKey: string): void {
    this.clipboardService.copyFromContent(extPubKey);
    this.snackbarService.add({
      msg: 'The Extended Public Key has been copied to your clipboard.',
      customClass: 'notify-snack-bar',
      action: {
        text: null
      }
    });
  }

  public copyTransactionHexToClipboard(transactionHex: string): void {
    this.clipboardService.copyFromContent(transactionHex);
    this.snackbarService.add({
      msg: 'The transaction hex has been copied to your clipboard.',
      customClass: 'notify-snack-bar',
      action: {
        text: null
      }
    });
  }

  private buildSetupColdStakingAccountForm(): void {
    this.setupColdStakingAccountForm = this.fb.group({
      password: ['', Validators.required]
    });

    this.subscriptions.push(this.setupColdStakingAccountForm.valueChanges
      .subscribe(() => this.onSetupValueChanged()));

    this.onSetupValueChanged();
  }

  private onSetupValueChanged(): void {
    if (!this.setupColdStakingAccountForm) {
      return;
    }
    const form = this.setupColdStakingAccountForm;
    for (const field in this.formErrorsSetup) {
      this.formErrorsSetup[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessagesSetup[field];
        for (const key in control.errors) {
          this.formErrorsSetup[field] += messages[key] + ' ';
        }
      }
    }
  }

  public formErrorsSetup = {
    password: ''
  };

  public validationMessagesSetup = {
    password: {
      required: 'Please enter your password.'
    }
  };

  private buildColdStakingForm(): void {
    this.coldStakingForm = this.fb.group({
      unsignedTransaction: ['', Validators.required],
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

  public coldStakingFormErrors = {
    unsignedTransaction: '',
    password: ''
  };

  public coldStakingFormValidationMessages = {
    unsignedTransaction: {
      required: 'Your unsigned transaction is required.'
    },
    password: {
      required: 'Please enter your password.'
    }
  };

  private buildRecoveryForm(): void {
    this.recoveryForm = this.fb.group({
      password: ['', Validators.required]
    });

    this.subscriptions.push(this.recoveryForm.valueChanges
      .subscribe(() => this.onRecoveryFormValueChanged()));

    this.onRecoveryFormValueChanged();
  }

  private onRecoveryFormValueChanged(): void {
    if (!this.recoveryForm) {
      return;
    }
    const form = this.recoveryForm;
    for (const field in this.recoveryFormErrors) {
      this.recoveryFormErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.recoveryFormValidationMessages[field];
        for (const key in control.errors) {
          this.recoveryFormErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  public recoveryFormErrors = {
    password: ''
  };

  public recoveryFormValidationMessages = {
    password: {
      required: 'Please enter your password.'
    }
  };

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}

export class UnsignedTransaction {
  walletPassword: string;
  walletName: string;
  walletAccount: string;
  unsignedTransaction: string;
  fee: string;
  utxos: [Utxo];
  addresses: [Address];
}

export class Utxo {
  transactionId: string;
  index: string;
  scriptPubKey: string;
  amount: string;
}

export class Address {
  address: string;
  keyPath: string;
  addressType: string;
}
