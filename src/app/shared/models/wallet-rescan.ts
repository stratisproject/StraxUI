export class WalletResync {
  constructor(walletName: string, all: boolean, reSync: boolean) {
    this.walletName = walletName;
    this.all = all;
    this.reSync = reSync;
  }

  walletName: string;
  all: boolean;
  reSync: boolean;
}
