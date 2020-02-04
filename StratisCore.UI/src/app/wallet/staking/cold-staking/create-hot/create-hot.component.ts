import { Component, OnInit } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ColdStakingService } from '@shared/services/cold-staking-service';
import { GlobalService } from '@shared/services/global.service';
import { ColdStakingAccount } from '@shared/models/cold-staking-account';
import { ColdStakingAddress } from '@shared/models/cold-staking-address';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-hot',
  templateUrl: './create-hot.component.html',
  styleUrls: ['./create-hot.component.scss']
})
export class CreateHotComponent implements OnInit {
  private passwordForm: FormGroup;
  private subscriptions: Subscription[] = [];
  public copied = false;
  public isConfirming = false;
  public confirmed = false;
  public walletName: string;
  public address: string;

  constructor(public activeModal: NgbActiveModal, private clipboardService: ClipboardService, private globalService: GlobalService, private coldStakingService: ColdStakingService, private fb: FormBuilder) {
    this.buildPasswordForm();
   }

  ngOnInit(): void {
    this.walletName = this.globalService.getWalletName();
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
    this.copied = true;
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
    'password': ''
  };

  private validationMessages = {
    'password': {
      'required': 'Please enter your password.'
    }
  };
}
