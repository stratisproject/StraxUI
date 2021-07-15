export class Recipient {
    constructor(destinationAddress: string, amount: string) {
      this.destinationAddress = destinationAddress;
      this.amount = amount;
    }
  
    destinationAddress: string;
    amount: string;
  }