export class ColdStakingAccount {
  constructor(walletName: string, walletPassword: string, isColdWalletAccount: boolean) {
    this.walletName = walletName;
    this.walletPassword = walletPassword;
    this.isColdWalletAccount = isColdWalletAccount;
  }
  walletName: string;
  walletPassword: string;
  isColdWalletAccount: boolean;
}
