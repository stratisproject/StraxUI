export class MaxBalance {
  constructor(
    public walletName: string,
    public account: string
  ) {}
}

export class MaxBalanceRequest extends MaxBalance {
  constructor(
    walletName: string,
    account:string,
    public opReturnData?: string,
    public opReturnAmount?: string,
    public burnFullBalance?: string,
    public feeType?: string
  ) {
    super(walletName, account);
  }
}
