import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AddressLabel } from '@shared/models/address-label';
import { GlobalService } from '@shared/services/global.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { AddressBookService } from '@shared/services/address-book-service';
import { FormHelper } from '@shared/forms/form-helper';
import { FeeEstimation } from '@shared/models/fee-estimation';
import { WalletService } from '@shared/services/wallet.service';
import { Transaction } from '@shared/models/transaction';
import { TaskBarService } from '@shared/services/task-bar-service';
import { SendConfirmationComponent } from '../send-confirmation/send-confirmation.component';
import { TransactionResponse } from '@shared/models/transaction-response';
import { Animations } from '@shared/animations/animations';

export interface FeeStatus {
  estimating: boolean;
}

@Component({
  selector: 'app-send-default',
  templateUrl: './send-default.component.html',
  styleUrls: ['./send-default.component.scss'],
  animations: Animations.fadeIn
})
export class SendDefaultComponent implements OnInit, OnDestroy {

  @Input() address: string;

  constructor(private globalService: GlobalService,
      private addressBookService: AddressBookService,
      private activatedRoute: ActivatedRoute,
      private fb: FormBuilder,
      private walletService: WalletService,
      private taskBarService: TaskBarService) {
    this.sendForm = this.buildSendForm(fb,
      () => (this.spendableBalance - this.estimatedFee) / 100000000);

    this.subscriptions.push(this.sendForm.valueChanges.pipe(debounceTime(500))
      .subscribe(data => this.validateForm(data)));
   }

  public sendForm: FormGroup;
  public coinUnit: string;
  public isSending = false;
  public isEstimating = false;
  public estimatedFee = 0;
  public totalBalance = 0;
  public spendableBalance = 0;
  public apiError: string;
  public testnetEnabled: boolean;
  public sidechainEnabled: boolean;
  public contact: AddressLabel;
  public status: BehaviorSubject<FeeStatus> = new BehaviorSubject<FeeStatus>({estimating: false});
  private subscriptions: Subscription[] = [];
  public sendFormErrors: any = {};
  private hasCustomChangeAddress = false;
  private last: FeeEstimation = null;

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.params['address']) {
      this.address = this.activatedRoute.snapshot.params['address'];
      this.getAddressBookContact();
    }

    this.testnetEnabled = this.globalService.getTestnetEnabled();
    this.sidechainEnabled = this.globalService.getSidechainEnabled();

    this.getWalletBalance();
    this.coinUnit = this.globalService.getCoinUnit();
    if (this.address) {
      this.sendForm.patchValue({'address': this.address});
    }
  }

  private validateForm(data: any): void {
    try {
      FormHelper.ValidateForm(this.sendForm, this.sendFormErrors, this.sendValidationMessages);
      this.apiError = '';

      const isValidForFeeEstimate = this.sendForm.get('address').valid && this.sendForm.get('amount').valid && this.sendForm.get('fee').valid;

      if (isValidForFeeEstimate) {
        this.estimateFee();
      }
    } catch (e) {
      console.log(e);
    }
  }

  // NB: This is not currently used
  // public getMaxBalance(): void {
  //   let balanceResponse;
  //   const walletRequest = new WalletInfoRequest(this.globalService.getWalletName(), this.globalService.getWalletAccount(), this.sendForm.get('fee').value);
  //   this.apiService.getMaximumBalance(walletRequest)
  //     .pipe(tap(
  //       response => {
  //         balanceResponse = response;
  //       },
  //       error => {
  //       },
  //       () => {
  //         this.sendForm.patchValue({amount: +new CoinNotationPipe().transform(balanceResponse.maxSpendableAmount)});
  //         this.estimatedFee = balanceResponse.fee;
  //       }
  //     )).toPromise();
  // }

  public estimateFee(): void {
    this.hasCustomChangeAddress = this.sendForm.get('changeAddress').value ? true : false;

    const transaction = new FeeEstimation(
      this.globalService.getWalletName(),
      this.globalService.getWalletAccount(),
      this.sendForm.get('address').value.trim(),
      '',
      this.sendForm.get('amount').value,
      this.sendForm.get('fee').value,
      true,
      null,
      this.hasCustomChangeAddress ? this.sendForm.get('changeAddress').value : null
    );

    if (!transaction.equals(this.last)) {
      this.last = transaction;
      const progressDelay = setTimeout(() =>
        this.status.next({estimating: true}), 100);

      this.walletService.estimateFee(transaction).toPromise()
        .then(response => {
            this.estimatedFee = response;
            this.last.response = response;
            clearTimeout(progressDelay);
            this.status.next({estimating: false});
          },
          error => {
            clearTimeout(progressDelay);
            this.status.next({estimating: false});
            this.apiError = error.error.errors[0].message;
            if (this.apiError == 'Invalid address') {
              this.sendFormErrors.address = this.apiError;
              this.last.error = this.apiError;
            }
          }
        );
    } else if (transaction.equals(this.last) && !this.status.value.estimating) {
      this.estimatedFee = this.last.response;
      this.sendFormErrors.address = this.last.error
    }
  }

  public send(): void {
    this.isSending = true;
    this.walletService.sendTransaction(this.getTransaction())
      .then(transactionResponse => {
        this.resetSendForm();
        this.openConfirmationModal(transactionResponse);
        this.isSending = false;
      }).catch(error => {
      this.isSending = false;
      this.apiError = error.error.errors[0].message;
    });
  }

  private getTransaction(): Transaction {
    return new Transaction(
      this.globalService.getWalletName(),
      this.globalService.getWalletAccount(),
      this.sendForm.get('password').value,
      this.sendForm.get('address').value.trim(),
      this.sendForm.get('amount').value,
      // TO DO: use coin notation
      this.estimatedFee / 100000000,
      true,
      null,
      null,
      null,
      this.hasCustomChangeAddress ? this.sendForm.get('changeAddress').value : null,
      false
    );
  }

  private openConfirmationModal(transactionResponse: TransactionResponse): void {
    this.taskBarService.open(SendConfirmationComponent, {
      transaction: transactionResponse.transaction,
      transactionFee: transactionResponse.transactionFee,
      sidechainEnabled: this.sidechainEnabled,
      hasCustomChangeAddress: this.hasCustomChangeAddress,
      hasOpReturn: transactionResponse.isSideChain
    }, {taskBarWidth: '600px'}).then(ref => {
      ref.closeWhen(ref.instance.closeClicked);
    });
  }

  private resetSendForm(): void {
    this.sendForm.reset();
    this.sendForm.get('fee').patchValue('medium');
    this.estimatedFee = 0;
  }

  private getWalletBalance(): void {
    this.subscriptions.push(this.walletService.wallet()
      .subscribe(
        response => {
          this.totalBalance = response.amountConfirmed + response.amountUnconfirmed;
          this.spendableBalance = response.spendableAmount;
        },
      ));
  }

  private getAddressBookContact(): void {
    this.contact = this.addressBookService.findContactByAddress(this.address);
  }

  public clearContact(): void {
    this.contact = null;
    this.sendForm.controls.address.setValue('');
  }

  private buildSendForm(fb: FormBuilder, balanceCalculator: () => number): FormGroup {
    return fb.group({
      address: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      changeAddressCheckbox: [false],
      changeAddress: ['', Validators.compose([Validators.minLength(26)])],
      amount: ['', Validators.compose([Validators.required,
        Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/),
        Validators.min(0.00001),
        (control: AbstractControl) => Validators.max(balanceCalculator())(control)])],
      fee: ['medium', Validators.required],
      password: ['', Validators.required]
    });
  }

  public sendValidationMessages = {
    address: {
      required: 'An address is required.',
      minlength: 'An address is at least 26 characters long.'
    },
    changeAddress: {
      minlength: 'An address is at least 26 characters long.'
    },
    amount: {
      required: 'An amount is required.',
      pattern: 'Enter a valid transaction amount. Only positive numbers and no more than 8 decimals are allowed.',
      min: 'The amount has to be more or equal to 0.00001.',
      max: 'The total transaction amount exceeds your spendable balance.'
    },
    fee: {
      required: 'A fee is required.'
    },
    password: {
      required: 'Your password is required.'
    }
  };

  public ngOnDestroy(): void {
    this.resetSendForm();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
