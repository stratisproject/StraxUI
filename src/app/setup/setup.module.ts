import { NgModule } from '@angular/core';
import { SetupComponent } from './setup.component';
import { CreateComponent } from './create/create.component';
import { SharedModule } from '@shared/shared.module';
import { SetupRoutingModule } from './setup-routing.module';
import { RecoverComponent } from './recover/recover.component';
import { ShowMnemonicComponent } from './create/show-mnemonic/show-mnemonic.component';
import { ConfirmMnemonicComponent } from './create/confirm-mnemonic/confirm-mnemonic.component';
import { SnackbarModule } from 'ngx-snackbar';

@NgModule({
  imports: [
    SetupRoutingModule,
    SharedModule,
    SnackbarModule
  ],
  declarations: [
    CreateComponent,
    SetupComponent,
    RecoverComponent,
    ShowMnemonicComponent,
    ConfirmMnemonicComponent
  ]
})

export class SetupModule { }
