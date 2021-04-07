import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AddressLabel } from '@shared/models/address-label';
import { ClipboardService } from 'ngx-clipboard';
import { SnackbarService } from 'ngx-snackbar';

@Component({
  selector: 'app-address-book-card',
  templateUrl: './address-book-card.component.html',
  styleUrls: ['./address-book-card.component.scss']
})
export class AddressBookCardComponent {

  @Output() removeClicked: EventEmitter<AddressLabel> = new EventEmitter<AddressLabel>();
  @Output() sendClicked: EventEmitter<AddressLabel> = new EventEmitter<AddressLabel>();
  @Input() address: AddressLabel;
  @Input() showButtons: boolean;

  constructor(
    private clipboardService: ClipboardService,
    private snackbarService: SnackbarService) {
  }

  public copyToClipboardClicked(address: AddressLabel): void {
    if (this.clipboardService.copyFromContent(address.address)) {
      this.snackbarService.add({
        msg: `Address ${address.label} ${address.address} copied to clipboard`,
        customClass: 'notify-snack-bar',
        action: {
          text: null
        }
      });
    }
  }
}
