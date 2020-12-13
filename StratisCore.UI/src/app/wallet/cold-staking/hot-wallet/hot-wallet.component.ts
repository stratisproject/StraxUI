import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { ColdStakingService } from '@shared/services/cold-staking-service';
import { GlobalService } from '@shared/services/global.service';
import { ColdStakingAccount } from '@shared/models/cold-staking-account';
import { ColdStakingAddress } from '@shared/models/cold-staking-address';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SnackbarService } from 'ngx-snackbar';

@Component({
  selector: 'app-hot-wallet',
  templateUrl: './hot-wallet.component.html',
  styleUrls: ['./hot-wallet.component.scss']
})
export class HotWalletComponent implements OnInit, OnDestroy {
  private passwordForm: FormGroup;
  private importPubKeyForm: FormGroup;
  private subscriptions: Subscription[] = [];
  public hasHotStakingSetup = false;
  public isConfirming = false;
  public confirmed = false;
  public walletName: string;
  public address: string;

  constructor(private clipboardService: ClipboardService, private coldStakingService: ColdStakingService, private globalService: GlobalService, private fb: FormBuilder, private snackbarService: SnackbarService) {
    this.buildPasswordForm();
    this.buildImportPubKeyForm();
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

  private buildPasswordForm(): void {
    this.passwordForm = this.fb.group({
      password: ['', Validators.required]
    });

    this.subscriptions.push(this.passwordForm.valueChanges
      .subscribe(() => this.onValueChanged()));

    this.onValueChanged();
  }

  private onValueChanged(): void {
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
      pubKey: ['', Validators.required],
      creationDate: ['', Validators.required],
      password: ['', Validators.required]
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
    pubKey: '',
    creationDate: '',
    password: ''
  };

  private importPubKeyValidationMessages = {
    walletName: {
      required: 'A wallet name is required'
    },
    pubKey: {
      required: 'The extended public key is required.'
    },
    creationDate: {
      required: 'The creation date is required.'
    },
    password: {
      required: 'Please enter your password.'
    }
  };

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

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
