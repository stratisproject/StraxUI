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
import { SnackbarService } from 'ngx-snackbar';
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
  public explanatoryText: string;
  public confirmationText: string;
  public contractText: string;
  public ercContractAddress = "0xa3c22370de5f9544f0c4de126b1e46ceadf0a51b";
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
  private minimumInteroperabilityAmount = 1000;

  constructor(private fb: FormBuilder,
    private globalService: GlobalService,
    public walletService: WalletService,
    private addressBookService: AddressBookService,
    private taskBarService: TaskBarService,
    private activatedRoute: ActivatedRoute,
    private snackbarService: SnackbarService) {
  this.interoperabilityForm = this.buildInteroperabilityForm(fb);

  this.subscriptions.push(this.interoperabilityForm.valueChanges.pipe(debounceTime(500))
    .subscribe(data => this.validateForm(data)));

  this.subscriptions.push(this.interoperabilityForm.get('networkSelect').valueChanges.subscribe(data => this.networkSelectChanged(data)));
}

  ngOnInit(): void {
    this.coinUnit = this.globalService.getCoinUnit();

    this.explanatoryText = `${this.coinUnit} Tokens will be released to the defined Ethereum address via the wSTRAX (ERC20) Token on the Ethereum blockchain.`;
    this.confirmationText = `Amounts clear in 500 confirmations`;
    this.contractText = `The official wSTRAX contract address on Ethereum is ${this.ercContractAddress}`


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
          if (response) {
            this.totalBalance = response.amountConfirmed + response.amountUnconfirmed;
            this.spendableBalance = response.spendableAmount;
          }
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

  public onCopiedClick(): void {
    this.snackbarService.add({
      msg: `ERC-20 contract address has been copied to your clipboard`,
      customClass: 'notify-snack-bar',
      action: {
        text: null
      }
    });
  }

  private resetInteroperabilityForm(): void {
    this.interoperabilityForm.reset();
    this.interoperabilityForm.get('networkSelect').patchValue('');
    this.interoperabilityForm.get('fee').patchValue('medium');
    this.estimatedSidechainFee = 0;
  }

  public buildInteroperabilityForm(fb: FormBuilder): FormGroup {
    return fb.group({
      tacAgreed: ['', Validators.requiredTrue],
      federationAddress: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      networkSelect: ['', Validators.compose([Validators.required])],
      destinationAddress: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      changeAddressCheckbox: [false],
      changeAddress: ['', Validators.compose([Validators.minLength(26)])],
      amount: ['', Validators.compose([Validators.required,
        Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/),
        Validators.min(this.minimumInteroperabilityAmount),
        (control: AbstractControl) => Validators.max(this.spendableBalance - this.estimatedSidechainFee)(control)
      ])],
      fee: ['medium', Validators.required],
      password: ['', Validators.required]
    });
  }

  public stratisInteropabilityNetworks: Network[] = [
    { destinationName: 'Ethereum', federationAddress: 'yU2jNwiac7XF8rQvSk2bgibmwsNLkkhsHV', description: 'Ethereum'}
  ];

  public stratisTestInteropabilityNetworks: Network[] = [
    { destinationName: 'Ethereum Ropsten', federationAddress: 'tGWegFbA6e6QKZP7Pe3g16kFVXMghbSfY8', description: 'Ethereum Ropsten Testnet'}
  ];

  public interoperabilityFormValidationMessages = {
    tacAgreed: {
      required: 'Please accept responsibility for any transfers made to and from the Ethereum Blockchain.'
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
     min: `The amount has to be more or equal to ${this.minimumInteroperabilityAmount}.`,
     max: 'The total transaction amount exceeds your spendable balance.'
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
