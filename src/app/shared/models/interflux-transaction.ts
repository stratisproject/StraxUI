import { Recipient } from '@shared/models/recipient';

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