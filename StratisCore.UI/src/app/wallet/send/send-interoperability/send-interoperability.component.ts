import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Animations } from '@shared/animations/animations';
import { FormHelper } from '@shared/forms/form-helper';
import { AddressLabel } from '@shared/models/address-label';
import { FeeEstimation } from '@shared/models/fee-estimation';
import { Network } from '@shared/models/network';
import { Transaction } from '@shared/models/transaction';
import { TransactionResponse } from '@shared/models/transaction-response';
import { AddressBookService } from '@shared/services/address-book-service';
import { GlobalService } from '@shared/services/global.service';
import { TaskBarService } from '@shared/services/task-bar-service';
import { WalletService } from '@shared/services/wallet.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { SendConfirmationComponent } from '../send-confirmation/send-confirmation.component';

export interface FeeStatus {
  estimating: boolean;
}


@Component({
  selector: 'app-send-interoperability',
  templateUrl: './send-interoperability.component.html',
  styleUrls: ['./send-interoperability.component.scss'],
  animations: Animations.fadeIn
})
export class SendInteroperabilityComponent implements OnInit, OnDestroy {

  @Input() address: string;

  public interoperabilityForm: FormGroup;
  public networks: Network[]
  public totalBalance = 0;
  public spendableBalance = 0;
  public estimatedSidechainFee = 0;
  public testingText: string;
  public confirmationText: string;
  public contact: AddressLabel;
  public status: BehaviorSubject<FeeStatus> = new BehaviorSubject<FeeStatus>({estimating: false});
  public coinUnit: string;
  public apiError: string;
  public isSending = false;
  private hasCustomChangeAddress = false;
  private testnetEnabled;
  private subscriptions: Subscription[] = [];
  public interoperabilityFormErrors: any = {};
  private last: FeeEstimation = null;

  constructor(private fb: FormBuilder,
    private globalService: GlobalService,
    private walletService: WalletService,
    private addressBookService: AddressBookService,
    private taskBarService: TaskBarService,
    private activatedRoute: ActivatedRoute) {
  this.interoperabilityForm = this.buildInteroperabilityForm(fb,
    () => (this.spendableBalance - this.estimatedSidechainFee) / 100000000);

  this.subscriptions.push(this.interoperabilityForm.valueChanges.pipe(debounceTime(500))
    .subscribe(data => this.validateForm(data)));

  this.subscriptions.push(this.interoperabilityForm.get('networkSelect').valueChanges.subscribe(data => this.networkSelectChanged(data)));
}

  ngOnInit(): void {
    this.coinUnit = this.globalService.getCoinUnit();

    this.testingText = `${this.coinUnit} Tokens will be issued to the defined Ethereum address via the wSTRAX (ERC20) Token. This initial release is in a testing phase, please check the following box to accept responsibility for any transfers made to and from the Ethereum Ropsten Blockchain.`;
    this.confirmationText = `Amounts less than 50 ${this.coinUnit} clear in 25 confirmations<br>Amounts between 50 and 1000 ${this.coinUnit} clear in 80 confirmations<br>Amounts more than 1000 ${this.coinUnit} clear in 500 confirmations`;

    if (this.activatedRoute.snapshot.params['address']) {
      this.address = this.activatedRoute.snapshot.params['address'];
      this.getAddressBookContact();
    }

    if (this.address) {
      this.interoperabilityForm.patchValue({'address': this.address});
    }

    this.getWalletBalance();

    if (this.address) {
      this.interoperabilityForm.patchValue({'address': this.address});
    }

    this.testnetEnabled = this.globalService.getTestnetEnabled();
    if (this.testnetEnabled) {
      this.networks = this.stratisTestInteropabilityNetworks;
    } else {
      this.networks = this.stratisInteropabilityNetworks;
    }
  }

  private validateForm(data: any): void {
    try {
      FormHelper.ValidateForm(this.interoperabilityForm, this.interoperabilityFormErrors, this.interoperabilityFormValidationMessages);
      this.apiError = '';
      const isValidForFeeEstimate = this.interoperabilityForm.get('amount').valid && this.interoperabilityForm.get('destinationAddress').valid && this.interoperabilityForm.get('federationAddress').valid && this.interoperabilityForm.get('fee').valid
      if (isValidForFeeEstimate) {
        this.estimateFee(this.interoperabilityForm);
      }
    } catch (e) {
      console.log(e);
    }
  }

  private networkSelectChanged(data: any): void {
    if (this.interoperabilityForm.get('networkSelect').value && this.interoperabilityForm.get('networkSelect').value !== 'customNetwork') {
      this.interoperabilityForm.patchValue({'federationAddress': this.interoperabilityForm.get('networkSelect').value})
    } else if (this.interoperabilityForm.get('networkSelect').value && this.interoperabilityForm.get('networkSelect').value === 'customNetwork') {
      this.interoperabilityForm.patchValue({'federationAddress': ''})
    }
  }

  public estimateFee(form: FormGroup): void {
    this.hasCustomChangeAddress = this.interoperabilityForm.get('changeAddress').value ? true : false;

    const transaction = new FeeEstimation(
      this.globalService.getWalletName(),
      this.globalService.getWalletAccount(),
      form.get('federationAddress').value.trim(),
      form.get('destinationAddress').value.trim(),
      form.get('amount').value,
      form.get('fee').value,
      true,
      null,
      this.hasCustomChangeAddress ? this.interoperabilityForm.get('changeAddress').value : null
    );


    if (!transaction.equals(this.last)) {
      this.last = transaction;
      const progressDelay = setTimeout(() =>
        this.status.next({estimating: true}), 100);

      this.walletService.estimateFee(transaction).toPromise()
        .then(response => {
            this.estimatedSidechainFee = response;
            this.last.response = response;
            clearTimeout(progressDelay);
            this.status.next({estimating: false});
          },
          error => {
            clearTimeout(progressDelay);
            this.status.next({estimating: false});
            this.apiError = error.error.errors[0].message;
            if (this.apiError == 'Invalid address') {
              this.interoperabilityFormErrors.destinationAddress = this.apiError
              this.last.error = this.apiError;
            }
          }
        );
    } else if (transaction.equals(this.last) && !this.status.value.estimating) {
      // Use the cached value
      this.estimatedSidechainFee = this.last.response;
      this.interoperabilityFormErrors.destinationAddress = this.last.error;
    }
  }

  public send(): void {
    this.isSending = true;
    this.walletService.sendTransaction(this.getTransaction())
      .then(transactionResponse => {
        this.resetInteroperabilityForm();
        this.openConfirmationModal(transactionResponse);
        this.isSending = false;
      }).catch(error => {
      this.isSending = false;
      this.apiError = error.error.errors[0].message;
    });
  }

  private getTransaction(): Transaction {
    const form = this.interoperabilityForm;
    this.hasCustomChangeAddress = form.get('changeAddress').value ? true : false;

    return new Transaction(
      this.globalService.getWalletName(),
      this.globalService.getWalletAccount(),
      form.get('password').value,
      form.get('federationAddress').value.trim(),
      form.get('amount').value,
      // TO DO: use coin notation
      this.estimatedSidechainFee / 100000000,
      true,
      null, // Shuffle Outputs
      this.interoperabilityForm.get('destinationAddress').value.trim(),
      null,
      this.hasCustomChangeAddress ? form.get('changeAddress').value : null,
      true
    );
  }

  private openConfirmationModal(transactionResponse: TransactionResponse): void {
    this.taskBarService.open(SendConfirmationComponent, {
      transaction: transactionResponse.transaction,
      transactionFee: transactionResponse.transactionFee,
      sidechainEnabled: false,
      hasCustomChangeAddress: this.hasCustomChangeAddress,
      hasOpReturn: transactionResponse.isSideChain
    }, {taskBarWidth: '600px'}).then(ref => {
      ref.closeWhen(ref.instance.closeClicked);
    });
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
    this.interoperabilityForm.controls.address.setValue('');
  }

  private resetInteroperabilityForm(): void {
    this.interoperabilityForm.reset();
    this.interoperabilityForm.get('networkSelect').patchValue('');
    this.interoperabilityForm.get('fee').patchValue('medium');
    this.estimatedSidechainFee = 0;
  }

  public buildInteroperabilityForm(fb: FormBuilder, balanceCalculator: () => number): FormGroup {
    return fb.group({
      tacAgreed: ['', Validators.required],
      federationAddress: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      networkSelect: ['', Validators.compose([Validators.required])],
      destinationAddress: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      changeAddressCheckbox: [false],
      changeAddress: ['', Validators.compose([Validators.minLength(26)])],
      amount: ['', Validators.compose([Validators.required,
        Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/),
        Validators.min(1),
        Validators.max(10),
        // (control: AbstractControl) => Validators.max(balanceCalculator())(control)
      ])],
      fee: ['medium', Validators.required],
      password: ['', Validators.required]
    });
  }

  public stratisInteropabilityNetworks: Network[] = [
    { destinationName: 'Ropsten', federationAddress: 'yU2jNwiac7XF8rQvSk2bgibmwsNLkkhsHV', description: 'Ethereum Ropsten Testnet'}
  ];

  public stratisTestInteropabilityNetworks: Network[] = [
    { destinationName: 'Ropsten', federationAddress: 'yU2jNwiac7XF8rQvSk2bgibmwsNLkkhsHV', description: 'Ethereum Ropsten Testnet'}
  ];

  public interoperabilityFormValidationMessages = {
    tacAgreed: {
      required: 'Please accept responsibility for any transfers made to and from the Ethereum Ropsten Blockchain.'
    },
    destinationAddress: {
     required: 'An address is required.',
     minlength: 'An address is at least 26 characters long.'
   },
   networkSelect: {
     required: 'Please select a network to send to.'
   },
   federationAddress: {
     required: 'An address is required.',
     minlength: 'An address is at least 26 characters long.'
   },
   changeAddress: {
     minlength: 'An address is at least 26 characters long.'
   },
   amount: {
     required: 'An amount is required.',
     pattern: 'Enter a valid transaction amount. Only positive numbers and no more than 8 decimals are allowed.',
     min: 'The amount has to be more or equal to 1.',
     max: 'We do not allow transfers larger than 10 STRAX while testing.'
    //  max: 'The total transaction amount exceeds your spendable balance.'
   },
   fee: {
     required: 'A fee is required.'
   },
   password: {
     required: 'Your password is required.'
   }
 };

  ngOnDestroy() {
    this.resetInteroperabilityForm();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
