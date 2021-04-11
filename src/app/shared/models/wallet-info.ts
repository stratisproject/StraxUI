export class WalletInfo {
  constructor(
    public walletName: string,
    public account = "account 0"
  ) {}
}

export class WalletInfoRequest extends WalletInfo {
  constructor(
    walletName: string,
    account = "account 0",
    public feeType?: string
  ) {
    super(walletName, account);
  }
}
