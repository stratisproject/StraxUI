import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { GlobalService } from '@shared/services/global.service';
import { ApiService } from '@shared/services/api.service';
import { WalletLoad } from '@shared/models/wallet-load';
import { Subscription } from 'rxjs';
import { WalletService } from '@shared/services/wallet.service';
import { SideBarItemsProvider } from '@shared/components/side-bar/side-bar-items-provider.service';
import { AccountSidebarItem } from '../wallet/side-bar-items/account-sidebar-item';
import { WalletInfo } from '@shared/models/wallet-info';
import { AuthenticationService } from '@shared/services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit, OnDestroy {
  public openWalletForm: FormGroup;
  public wallets: Wallets[] = [];
  private regularWallets: string[];
  private watchOnlyWallets: string[];
  private subscriptions: Subscription[] = [];

  public formErrors = {
    'password': ''
  };

  public validationMessages = {
    'password': {
      'required': 'Please enter your password.'
    }
  };

  constructor(
    private globalService: GlobalService,
    private apiService: ApiService,
    private walletService: WalletService,
    private router: Router,
    private fb: FormBuilder,
    private sidebarItems: SideBarItemsProvider,
    private accountSidebarItem: AccountSidebarItem,
    private authenticationService: AuthenticationService) {

    this.buildDecryptForm();
  }

  public isDecrypting = false;

  public ngOnInit(): void {
    this.getWalletNames();
    this.getCurrentNetwork();
  }

  private buildDecryptForm(): void {
    this.openWalletForm = this.fb.group({
      // eslint-disable-next-line @typescript-eslint/unbound-method
      selectWallet: [{value: '', disabled: this.isDecrypting}, Validators.required],
      // eslint-disable-next-line @typescript-eslint/unbound-method
      password: [{value: '', disabled: this.isDecrypting}, Validators.required]
    });

    this.subscriptions.push(this.openWalletForm.valueChanges
      .subscribe(() => this.onValueChanged()));

    this.onValueChanged();
  }

  private onValueChanged(): void {
    if (!this.openWalletForm) {
      return;
    }
    const form = this.openWalletForm;
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
  }

  private getWalletNames(): void {
    this.subscriptions.push(this.walletService.getWalletNames()
      .subscribe(
        response => {
          this.regularWallets = response.walletNames.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
          this.watchOnlyWallets = response.watchOnlyWallets.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);

          this.regularWallets.forEach(wallet => {
            if (this.watchOnlyWallets.find(x => x == wallet)) {
              this.wallets.push(new Wallets(wallet, true));
            } else {
              this.wallets.push(new Wallets(wallet, false));
            }
          });
        }
      ));
  }

  public onCreateClicked(): void {
    this.openWalletForm.patchValue({password: "", selectWallet: ""});
    this.router.navigate(['setup']);
  }

  public onDecryptClicked(): void {
    this.isDecrypting = true;
    this.globalService.setWallet(new WalletInfo(this.openWalletForm.get('selectWallet').value));
    const walletLoad = new WalletLoad(
      this.openWalletForm.get('selectWallet').value,
      this.openWalletForm.get('password').value
    );
    this.loadWallet(walletLoad);
  }

  private loadWallet(walletLoad: WalletLoad): void {
    this.walletService.loadStratisWallet(walletLoad)
      .subscribe(
        () => {
          this.router.navigate(['wallet/dashboard']);
          this.sidebarItems.setSelected(this.accountSidebarItem);
          this.walletService.getHistory();
          this.authenticationService.SignIn();
          if (this.watchOnlyWallets.find(x => x == walletLoad.name)) {
            this.globalService.setWalletWatchOnly(true);
          } else {
            this.globalService.setWalletWatchOnly(false);
          }
        },
        () => {
          this.openWalletForm.patchValue({password: ""});
          this.isDecrypting = false;
        }
      )
    ;
  }

  private getCurrentNetwork(): void {
    this.apiService.getNodeStatus()
      .subscribe(
        response => {
          this.globalService.setCoinUnit(response.coinTicker);
          this.globalService.setNetwork(response.network);
        }
      )
    ;
  }

  public ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}

export class Wallets {
  constructor(walletName: string, isWatchOnly: boolean) {
    this.walletName = walletName;
    this.isWatchOnly = isWatchOnly;
  }
  walletName: string;
  isWatchOnly: boolean;
}
