export class ColdStakingWithdrawal {
  constructor(receivingAddress: string, walletName: string, amount: number, fees: number, walletPassword?: string, subtractFeeFromAmount?: boolean) {
    this.receivingAddress = receivingAddress;
    this.walletName = walletName;
    this.amount = amount;
    this.fees = fees;
    this.walletPassword = walletPassword;
    this.subtractFeeFromAmount = subtractFeeFromAmount;
  }
  receivingAddress: string;
  walletName: string;
  walletPassword: string;
  amount: number;
  fees: number;
  subtractFeeFromAmount: boolean;
}
