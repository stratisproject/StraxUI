export class ColdStakingAddress {
  constructor(walletName: string, isColdWalletAddress: boolean) {
    this.walletName = walletName;
    this.isColdWalletAddress = isColdWalletAddress;
  }
  walletName: string;
  isColdWalletAddress: boolean;
}
