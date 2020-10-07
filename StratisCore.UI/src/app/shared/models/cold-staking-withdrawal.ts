export class ColdStakingWithdrawal {
  constructor(receivingAddress: string, walletName: string, walletPassword: string, amount: number, fees: number) {
    this.receivingAddress = receivingAddress;
    this.walletName = walletName;
    this.walletPassword = walletPassword;
    this.amount = amount;
    this.fees = fees;
  }
  receivingAddress: string;
  walletName: string;
  walletPassword: string;
  amount: number;
  fees: number;
}
