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
  selector: 'app-send-sidechain',
  templateUrl: './send-sidechain.component.html',
  styleUrls: ['./send-sidechain.component.scss'],
  animations: Animations.fadeIn
})
export class SendSidechainComponent implements OnInit, OnDestroy {

  @Input() address: string;

  constructor(private fb: FormBuilder,
    private globalService: GlobalService,
    public walletService: WalletService,
    private addressBookService: AddressBookService,
    private taskBarService: TaskBarService,
    private activatedRoute: ActivatedRoute) {
    this.sendToSidechainForm = this.buildSendToSidechainForm(fb);

    this.subscriptions.push(this.sendToSidechainForm.valueChanges.pipe(debounceTime(500))
      .subscribe(() => this.validateForm()));

    this.subscriptions.push(this.sendToSidechainForm.get('networkSelect').valueChanges.subscribe(() => this.networkSelectChanged()));
  }

  public sendToSidechainForm: FormGroup;
  public networks: Network[];
  public totalBalance = 0;
  public spendableBalance = 0;
  public estimatedSidechainFee = 0;
  public confirmationText: string;
  public contact: AddressLabel;
  public status: BehaviorSubject<FeeStatus> = new BehaviorSubject<FeeStatus>({ estimating: false });
  public coinUnit: string;
  public apiError: string;
  public isSending = false;
  private hasCustomChangeAddress = false;
  private testnetEnabled;
  private subscriptions: Subscription[] = [];
  public sendToSidechainFormErrors: any = {};
  private last: FeeEstimation = null;

  ngOnInit(): void {
    this.coinUnit = this.globalService.getCoinUnit();
    this.confirmationText = `Amounts less than 50 ${this.coinUnit} clear in 25 confirmations<br>Amounts between 50 and 1000 ${this.coinUnit} clear in 80 confirmations<br>Amounts more than 1000 ${this.coinUnit} clear in 500 confirmations`;

    if (this.activatedRoute.snapshot.params['address']) {
      this.address = this.activatedRoute.snapshot.params['address'];
      this.getAddressBookContact();
    }

    if (this.address) {
      this.sendToSidechainForm.patchValue({ 'address': this.address });
    }

    this.getWalletBalance();

    this.testnetEnabled = this.globalService.getTestnetEnabled();
    if (this.testnetEnabled) {
      this.networks = this.stratisTestNetworks;
    } else {
      this.networks = this.stratisNetworks;
    }
  }

  private validateForm(): void {
    try {
      FormHelper.ValidateForm(this.sendToSidechainForm, this.sendToSidechainFormErrors, this.sendToSidechainValidationMessages);
      this.apiError = '';
      const isValidForFeeEstimate = this.sendToSidechainForm.get('amount').valid && this.sendToSidechainForm.get('destinationAddress').valid && this.sendToSidechainForm.get('federationAddress').valid && this.sendToSidechainForm.get('fee').valid;
      if (isValidForFeeEstimate) {
        this.estimateFee(this.sendToSidechainForm);
      }
    } catch (e) {
      console.log(e);
    }
  }

  private networkSelectChanged(): void {
    if (this.sendToSidechainForm.get('networkSelect').value && this.sendToSidechainForm.get('networkSelect').value !== 'customNetwork') {
      this.sendToSidechainForm.patchValue({ 'federationAddress': this.sendToSidechainForm.get('networkSelect').value });
    } else if (this.sendToSidechainForm.get('networkSelect').value && this.sendToSidechainForm.get('networkSelect').value === 'customNetwork') {
      this.sendToSidechainForm.patchValue({ 'federationAddress': '' });
    }
  }

  public estimateFee(form: FormGroup): void {
    this.hasCustomChangeAddress = this.sendToSidechainForm.get('changeAddress').value ? true : false;

    const transaction = new FeeEstimation(
      this.globalService.getWalletName(),
      this.globalService.getWalletAccount(),
      form.get('federationAddress').value.trim(),
      form.get('destinationAddress').value.trim(),
      form.get('amount').value,
      form.get('fee').value,
      true,
      null,
      this.hasCustomChangeAddress ? this.sendToSidechainForm.get('changeAddress').value : null
    );


    if (!transaction.equals(this.last)) {
      this.last = transaction;
      const progressDelay = setTimeout(() =>
        this.status.next({ estimating: true }), 100);

      this.walletService.estimateFee(transaction).toPromise()
        .then(response => {
          this.estimatedSidechainFee = response;
          this.last.response = response;
          clearTimeout(progressDelay);
          this.status.next({ estimating: false });
        },
          error => {
            clearTimeout(progressDelay);
            this.status.next({ estimating: false });
            this.apiError = error.error.errors[0].message;
            if (this.apiError == 'Invalid address') {
              this.sendToSidechainFormErrors.destinationAddress = this.apiError;
              this.last.error = this.apiError;
            }
          }
        );
    } else if (transaction.equals(this.last) && !this.status.value.estimating) {
      // Use the cached value
      this.estimatedSidechainFee = this.last.response;
      this.sendToSidechainFormErrors.destinationAddress = this.last.error;
    }
  }

  public send(): void {
    this.isSending = true;
    this.walletService.sendTransaction(this.getTransaction())
      .then(transactionResponse => {
        this.openConfirmationModal(transactionResponse);
        this.resetSendToSidechainForm();
        this.isSending = false;
      }).catch(error => {
        this.isSending = false;
        this.apiError = error.error.errors[0].message;
      });
  }

  private getTransaction(): Transaction {
    const form = this.sendToSidechainForm;
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
      this.sendToSidechainForm.get('destinationAddress').value.trim(),
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
      hasOpReturn: transactionResponse.isSideChain,
      destinationAddress: this.sendToSidechainForm.get('destinationAddress').value.trim()
    }, { taskBarWidth: '600px' }).then(ref => {
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
    this.sendToSidechainForm.controls.address.setValue('');
  }

  public clearChangeAddress(): void {
    if (this.sendToSidechainForm.get('changeAddressCheckbox').value == false)
      this.sendToSidechainForm.controls.changeAddress.setValue('');
  }

  private resetSendToSidechainForm(): void {
    this.sendToSidechainForm.reset();
    this.sendToSidechainForm.get('networkSelect').patchValue('');
    this.sendToSidechainForm.get('fee').patchValue('medium');
    this.estimatedSidechainFee = 0;
  }

  private buildSendToSidechainForm(fb: FormBuilder): FormGroup {

    var changeAddressStraxPattern = Validators.compose([Validators.pattern(/^X[1-9A-Za-z][^OIl]{26,40}/)]);
    var destinationAddressCirrusPattern = Validators.compose([Validators.required, Validators.pattern(/^C[1-9A-Za-z][^OIl]{26,40}/)]);

    this.testnetEnabled = this.globalService.getTestnetEnabled();
    if (this.testnetEnabled) {
      changeAddressStraxPattern = Validators.compose([Validators.pattern(/^q[1-9A-Za-z][^OIl]{26,40}/)]);
      destinationAddressCirrusPattern = Validators.compose([Validators.required, Validators.pattern(/^t[1-9A-Za-z][^OIl]{26,40}/)]);
    }

    return fb.group({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      federationAddress: ['', Validators.compose([Validators.required, Validators.minLength(26)])],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      networkSelect: ['', Validators.compose([Validators.required])],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      destinationAddress: ['', destinationAddressCirrusPattern],
      changeAddressCheckbox: [false],
      changeAddress: ['', changeAddressStraxPattern],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      amount: ['', Validators.compose([Validators.required,
      Validators.pattern(/^([0-9]+)?(\.[0-9]{0,8})?$/),
      Validators.min(1),
      (control: AbstractControl) => Validators.max(this.spendableBalance - this.estimatedSidechainFee)(control)])],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      fee: ['medium', Validators.required],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      password: ['', Validators.required]
    });
  }

  public stratisNetworks: Network[] = [
    { destinationName: 'Cirrus', federationAddress: 'yU2jNwiac7XF8rQvSk2bgibmwsNLkkhsHV', description: 'Cirrus Sidechain' }
  ];

  public stratisTestNetworks: Network[] = [
    { destinationName: 'CirrusTest', federationAddress: 'tGWegFbA6e6QKZP7Pe3g16kFVXMghbSfY8', description: 'Cirrus Test Sidechain' }
  ];

  public sendToSidechainValidationMessages = {
    destinationAddress: {
      required: 'An address is required.',
      //minlength: 'An address is at least 26 characters long.'
      pattern: 'Invalid Address'
    },
    networkSelect: {
      required: 'Please select a network to send to.'
    },
    federationAddress: {
      required: 'An address is required.',
      minlength: 'An address is at least 26 characters long.'
    },
    changeAddress: {
      //minlength: 'An address is at least 26 characters long.'
      pattern: 'Invalid Address'
    },
    amount: {
      required: 'An amount is required.',
      pattern: 'Enter a valid transaction amount. Only positive numbers and no more than 8 decimals are allowed.',
      min: 'The amount has to be more or equal to 1.',
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
    this.resetSendToSidechainForm();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
