import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GlobalService } from '@shared/services/global.service';
import { CoinNotationPipe } from '@shared/pipes/coin-notation.pipe';

@Component({
  selector: 'app-send-confirmation',
  templateUrl: './send-confirmation.component.html',
  styleUrls: ['./send-confirmation.component.scss']
})
export class SendConfirmationComponent implements OnInit {

  @Input() transaction: any;
  @Input() transactionFee: any;
  @Input() hasOpReturn: boolean;
  @Input() hasCustomChangeAddress: boolean;
  @Input() destinationAddress: string;
  @Output() closeClicked: EventEmitter<boolean> = new EventEmitter<boolean>();
  constructor(private globalService: GlobalService) {
  }

  public showDetails = false;
  public coinUnit: string;

  ngOnInit(): void {
    this.coinUnit = this.globalService.getCoinUnit();
    this.transactionFee = new CoinNotationPipe().transform(this.transactionFee);
    this.transaction.amount = +this.transaction.recipients[0].amount + +this.transactionFee;
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}
