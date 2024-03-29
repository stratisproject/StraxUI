import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ApiService } from '@shared/services/api.service';
import { ModalService } from '@shared/services/modal.service';

import { WalletCreation } from '@shared/models/wallet-creation';
import { SecretWordIndexGenerator } from './secret-word-index-generator';
import { GlobalService } from '@shared/services/global.service';

@Component({
  selector: 'app-confirm-mnemonic',
  templateUrl: './confirm-mnemonic.component.html',
  styleUrls: ['./confirm-mnemonic.component.scss']
})
export class ConfirmMnemonicComponent implements OnInit, OnDestroy {

  constructor(
    private apiService: ApiService,
    private genericModalService: ModalService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private globalService: GlobalService) {
    this.buildMnemonicForm();
  }

  public secretWordIndexGenerator = new SecretWordIndexGenerator();
  private newWallet: WalletCreation;
  private mnemonicForm$: Subscription;
  private queryParams$: Subscription;
  public mnemonicForm: FormGroup;
  public matchError = '';
  public isCreating: boolean;

  formErrors = {
    'word1': '',
    'word2': '',
    'word3': ''
  };

  validationMessages = {
    'word1': {
      'required': 'This secret word is required.',
      'minlength': 'A secret word must be at least one character long',
      'maxlength': 'A secret word can not be longer than 24 characters',
      'pattern': 'Please enter a valid scret word. [a-Z] are the only characters allowed.'
    },
    'word2': {
      'required': 'This secret word is required.',
      'minlength': 'A secret word must be at least one character long',
      'maxlength': 'A secret word can not be longer than 24 characters',
      'pattern': 'Please enter a valid scret word. [a-Z] are the only characters allowed.'
    },
    'word3': {
      'required': 'This secret word is required.',
      'minlength': 'A secret word must be at least one character long',
      'maxlength': 'A secret word can not be longer than 24 characters',
      'pattern': 'Please enter a valid scret word. [a-Z] are the only characters allowed.'
    }
  };

  ngOnInit(): void {
    this.queryParams$ = this.route.queryParams.subscribe(params => {
      this.newWallet = new WalletCreation(
        params['name'],
        params['mnemonic'],
        params['password'],
        params['passphrase']
      );
    });
  }

  private buildMnemonicForm(): void {
    this.mnemonicForm = this.fb.group({
      'word1': ['',
        Validators.compose([
          // eslint-disable-next-line @typescript-eslint/unbound-method
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(24),
          Validators.pattern(/^[a-zA-Z]*$/)
        ])
      ],
      'word2': ['',
        Validators.compose([
          // eslint-disable-next-line @typescript-eslint/unbound-method
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(24),
          Validators.pattern(/^[a-zA-Z]*$/)
        ])
      ],
      'word3': ['',
        Validators.compose([
          // eslint-disable-next-line @typescript-eslint/unbound-method
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(24),
          Validators.pattern(/^[a-zA-Z]*$/)
        ])
      ]
    });

    this.mnemonicForm$ = this.mnemonicForm.valueChanges
      .subscribe(() => this.onValueChanged());

    this.onValueChanged();
  }

  onValueChanged(): void {
    if (!this.mnemonicForm) {
      return;
    }
    const form = this.mnemonicForm;
    for (const field in this.formErrors) {
      this.formErrors[field] = '';
      const control = form.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          this.formErrors[field] += `${String(messages[key])} `;
        }
      }
    }

    this.matchError = '';
  }

  public onConfirmClicked(): void {
    this.checkMnemonic();
    if (this.checkMnemonic()) {
      this.isCreating = true;
      this.createWallet(this.newWallet);
    }
  }

  public onBackClicked(): void {
    this.router.navigate(['/setup/create/show-mnemonic'], {
      queryParams: {
        name: this.newWallet.name,
        mnemonic: this.newWallet.mnemonic,
        password: this.newWallet.password,
        passphrase: this.newWallet.passphrase
      }
    });
  }

  private checkMnemonic(): boolean {
    const mnemonic = this.newWallet.mnemonic;
    const mnemonicArray = mnemonic.split(' ');

    if (this.mnemonicForm.get('word1').value.trim() === mnemonicArray[this.secretWordIndexGenerator.index1] &&
      this.mnemonicForm.get('word2').value.trim() === mnemonicArray[this.secretWordIndexGenerator.index2] &&
      this.mnemonicForm.get('word3').value.trim() === mnemonicArray[this.secretWordIndexGenerator.index3]) {
      return true;
    } else {
      this.matchError = 'The secret words do not match.';
      return false;
    }
  }

  private createWallet(wallet: WalletCreation): void {
    this.apiService.createStratisWallet(wallet)
      .toPromise()
      .then(
        () => {
          this.isCreating = false;
          this.genericModalService.openModal(
            'Wallet Created', 'Your wallet has been created.<br>Keep your secret words, password and passphrase safe!');
          this.router.navigate(['']);
        },
        () => {
          this.isCreating = false;
        }
      );
  }

  ngOnDestroy(): void {
    this.queryParams$.unsubscribe();
    this.mnemonicForm$.unsubscribe();
  }
}
