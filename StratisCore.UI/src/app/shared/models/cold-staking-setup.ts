export class ColdStakingSetup {
  constructor(coldWalletAddress: string, hotWalletAddress: string, walletName: string, walletPassword: string, walletAccount: string, amount: number, fees: number) {
    this.coldWalletAddress = coldWalletAddress;
    this.hotWalletAddress = hotWalletAddress;
    this.walletName = walletName;
    this.walletPassword = walletPassword;
    this.walletAccount = walletAccount;
    this.amount = amount;
    this.fees = fees;
  }

  coldWalletAddress: string;
  hotWalletAddress: string;
  walletName: string;
  walletPassword: string;
  walletAccount: string;
  amount: number;
  fees: number;
}

