export class ColdStakingWithdrawal {
  constructor(receivingAddress: string, walletName: string, accountName: string, amount: number, fees: string, walletPassword?: string, subtractFeeFromAmount?: boolean) {
    this.receivingAddress = receivingAddress;
    this.walletName = walletName;
    this.accountName = accountName;
    this.amount = amount;
    this.fees = fees;
    this.walletPassword = walletPassword;
    this.subtractFeeFromAmount = subtractFeeFromAmount;
  }
  receivingAddress: string;
  walletName: string;
  accountName: string;
  walletPassword: string;
  amount: number;
  fees: string;
  subtractFeeFromAmount: boolean;
}
