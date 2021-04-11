import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddressBookComponent } from './address-book/address-book.component';
import { AdvancedComponent } from './advanced/advanced.component';
import { AboutComponent } from './advanced/components/about/about.component';
import { ExtPubkeyComponent } from './advanced/components/ext-pubkey/ext-pubkey.component';
import { GenerateAddressesComponent } from './advanced/components/generate-addresses/generate-addresses.component';
import { ResyncComponent } from './advanced/components/resync/resync.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WalletComponent } from './wallet.component';
import { ReceiveComponent } from './receive/receive.component';
import { SendComponent } from './send/send.component';
import { StakingComponent } from './staking/staking.component';
import { ColdStakingComponent } from './cold-staking/cold-staking.component';
import { AuthenticationGuard } from '@shared/guards/auth.guard';

const routes: Routes = [
  {
    path: 'wallet', component: WalletComponent, canActivate: [AuthenticationGuard], children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
      {path: 'dashboard', component: DashboardComponent, canActivate: [AuthenticationGuard]},
      {path: 'send', component: SendComponent, canActivate: [AuthenticationGuard]},
      {path: 'send/:address', component: SendComponent, canActivate: [AuthenticationGuard]},
      {path: 'receive', component: ReceiveComponent, canActivate: [AuthenticationGuard]},
      {path: 'staking', component: StakingComponent, canActivate: [AuthenticationGuard]},
      {path: 'coldstaking', component: ColdStakingComponent, canActivate: [AuthenticationGuard]},
      {
        path: 'advanced', component: AdvancedComponent, canActivate: [AuthenticationGuard],
        children: [
          {path: '', redirectTo: 'about', pathMatch: 'full'},
          {path: 'about', component: AboutComponent, canActivate: [AuthenticationGuard]},
          {path: 'extpubkey', component: ExtPubkeyComponent, canActivate: [AuthenticationGuard]},
          {path: 'generate-addresses', component: GenerateAddressesComponent, canActivate: [AuthenticationGuard]},
          {path: 'resync', component: ResyncComponent, canActivate: [AuthenticationGuard]}
        ]
      },
      {path: 'address-book', component: AddressBookComponent, canActivate: [AuthenticationGuard]}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class WalletRoutingModule {
}
