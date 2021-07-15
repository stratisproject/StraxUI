import { Recipient } from '@shared/models/recipient';

export class Transaction {
  constructor(
    public walletName: string,
    public accountName: string,
    public password: string,
    destinationAddress: string,
    public amount: string,
    public feeAmount: number,
    public allowUnconfirmed: boolean,
    public shuffleOutputs: boolean,
    public opReturnData?: string,
    public opReturnAmount?: string,
    public changeAddress?: string,
    public isSideChainTransaction?: boolean) {
    this.recipients = [new Recipient(destinationAddress, amount)];
  }

  public recipients: Recipient[];
  public sender: string;
}

export class InterFluxTransaction {
  constructor(
    public walletName: string,
    public accountName: string,
    public password: string,
    public federationAddress: string,
    public destinationChain : number,
    public destinationAddress: string,    
    public amount: string,
    public feeAmount: number,
    public allowUnconfirmed: boolean,
    public shuffleOutputs: boolean,
    public changeAddress?: string,
    public isSideChainTransaction?: boolean) {
    this.recipients = [new Recipient(federationAddress, amount)];
  }

  public recipients: Recipient[];
}

export class FeeTransaction extends Transaction {
  feeType: string;
}
