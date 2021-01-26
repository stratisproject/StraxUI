import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AddressBookComponent } from './address-book/address-book.component';
import { AddNewAddressComponent } from './address-book/modals/add-new-address/add-new-address.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { AboutComponent } from './advanced/components/about/about.component';
import { ExtPubkeyComponent } from './advanced/components/ext-pubkey/ext-pubkey.component';
import { GenerateAddressesComponent } from './advanced/components/generate-addresses/generate-addresses.component';
import { ResyncComponent } from './advanced/components/resync/resync.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LogoutConfirmationComponent } from './logout-confirmation/logout-confirmation.component';
import { ReceiveComponent } from './receive/receive.component';
import { SendConfirmationComponent } from './send/send-confirmation/send-confirmation.component';
import { SendComponent } from './send/send.component';
import { SmartContractsModule } from './smart-contracts/smart-contracts.module';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { TokensModule } from './tokens/tokens.module';
import { TransactionDetailsComponent } from './transaction-details/transaction-details.component';
import { WalletRoutingModule } from './wallet-routing.module';
import { WalletComponent } from './wallet.component';
import { AccountSelectedGuard } from '@shared/guards/account-selected.guard';
import { TransactionsComponent } from './transactions/transactions.component';
import { WalletSelectorComponent } from './wallet-selector/wallet-selector.component';
import { SnackbarModule } from 'ngx-snackbar';
import { SideBarItemsProvider } from '@shared/components/side-bar/side-bar-items-provider.service';
import { SideBarItem, SimpleSideBarItem } from '@shared/components/side-bar/side-bar-item-base';
import { StakingSidebarItem } from './side-bar-items/staking-sidebar-item';
import { AddressBookCardComponent } from './address-book-card/address-book-card.component';
import { AddNodeComponent } from './advanced/components/add-node/add-node.component';
import { TransactionDetailsModalComponent } from './transaction-details-modal/transaction-details-modal.component';
import { AccountSidebarItem } from './side-bar-items/account-sidebar-item';
import { StakingComponent } from './staking/staking.component';
import { HotStakingComponent } from './staking/hot-staking/hot-staking.component';
// import { ColdStakingComponent } from './staking/cold-staking/cold-staking.component';
import { BroadcastTransactionComponent } from './advanced/components/broadcast-transaction/broadcast-transaction.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ColdStakingSidebarItem } from './side-bar-items/cold-staking-sidebar-item';
import { ColdStakingComponent } from './cold-staking/cold-staking.component';
import { HotWalletComponent } from './cold-staking/hot-wallet/hot-wallet.component';
import { ColdWalletComponent } from './cold-staking/cold-wallet/cold-wallet.component';
import { SendDefaultComponent } from './send/send-default/send-default.component';
import { SendSidechainComponent } from './send/send-sidechain/send-sidechain.component';
import { SendInteroperabilityComponent } from './send/send-interoperability/send-interoperability.component';

@NgModule({
  imports: [
    SnackbarModule,
    SharedModule,
    WalletRoutingModule,
    SmartContractsModule.forRoot(),
    TokensModule,
    BsDatepickerModule.forRoot(),
    TabsModule.forRoot(),
    ScrollingModule
  ],
  declarations: [
    WalletComponent,
    DashboardComponent,
    SendComponent,
    ReceiveComponent,
    SendConfirmationComponent,
    TransactionDetailsComponent,
    LogoutConfirmationComponent,
    StatusBarComponent,
    AdvancedComponent,
    AddressBookComponent,
    AddNewAddressComponent,
    ExtPubkeyComponent,
    AboutComponent,
    GenerateAddressesComponent,
    ResyncComponent,
    TransactionsComponent,
    WalletSelectorComponent,
    AddressBookCardComponent,
    AddNodeComponent,
    TransactionDetailsModalComponent,
    StakingComponent,
    HotStakingComponent,
    BroadcastTransactionComponent,
    ColdStakingComponent,
    HotWalletComponent,
    ColdWalletComponent,
    SendDefaultComponent,
    SendSidechainComponent,
    SendInteroperabilityComponent
  ],
  providers: [
    AccountSelectedGuard,
    AccountSidebarItem,
    StakingSidebarItem,
    ColdStakingSidebarItem
  ]
})

export class WalletModule {
  constructor(private sidebarItems: SideBarItemsProvider,
              accountSidebarItem: AccountSidebarItem,
              stakingSidebarItem: StakingSidebarItem,
              coldStakingSidebarItem: ColdStakingSidebarItem) {

    sidebarItems.registerSideBarItem(accountSidebarItem);

    sidebarItems.registerSideBarItem(new SimpleSideBarItem(
      'Send', '/wallet/send', ['side-bar-item-send']));

    sidebarItems.registerSideBarItem(new SimpleSideBarItem(
      'Receive', '/wallet/receive', ['side-bar-item-receive']));

    sidebarItems.registerSideBarItem(stakingSidebarItem);

    sidebarItems.registerSideBarItem(coldStakingSidebarItem);

    sidebarItems.registerSideBarItem(new SimpleSideBarItem(
      'Contacts', '/wallet/address-book', ['side-bar-item-address']));

    sidebarItems.registerSideBarItem(new SimpleSideBarItem(
      'Advanced', '/wallet/advanced', ['side-bar-item-advanced']));

    sidebarItems.setSelected({
      route : '/wallet/dashboard'
    } as SideBarItem);
  }
}
