export class ColdStakingSetup {
  constructor(coldWalletAddress: string, hotWalletAddress: string, walletName: string, walletAccount: string, amount: number, fees: number, walletPassword?: string, subtractFeeFromAmount?: boolean) {
    this.coldWalletAddress = coldWalletAddress;
    this.hotWalletAddress = hotWalletAddress;
    this.walletName = walletName;
    this.walletAccount = walletAccount;
    this.amount = amount;
    this.fees = fees;
    this.walletPassword = walletPassword
    this.subtractFeeFromAmount = subtractFeeFromAmount;
  }

  coldWalletAddress: string;
  hotWalletAddress: string;
  walletName: string;
  walletAccount: string;
  amount: number;
  fees: number;
  walletPassword: string;
  subtractFeeFromAmount: boolean;
}
