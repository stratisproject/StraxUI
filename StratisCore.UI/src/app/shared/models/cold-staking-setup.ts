export class ColdStakingSetup {
  constructor(coldWalletAddress: string, hotWalletAddress: string, walletName: string, walletPassword: string, walletAccount: string, amount: number, fees: number, subtractFeeFromAmount?: boolean) {
    this.coldWalletAddress = coldWalletAddress;
    this.hotWalletAddress = hotWalletAddress;
    this.walletName = walletName;
    this.walletPassword = walletPassword;
    this.walletAccount = walletAccount;
    this.amount = amount;
    this.fees = fees;
    this.subtractFeeFromAmount = subtractFeeFromAmount;
  }

  coldWalletAddress: string;
  hotWalletAddress: string;
  walletName: string;
  walletPassword: string;
  walletAccount: string;
  amount: number;
  fees: number;
  subtractFeeFromAmount: boolean;
}

