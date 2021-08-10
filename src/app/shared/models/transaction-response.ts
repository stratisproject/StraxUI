import { Transaction } from '@shared/models/transaction';
import { InterFluxTransaction } from '@shared/models/interflux-transaction';
import { OpreturnTransaction } from './opreturn-transaction';

export class TransactionResponse {
  constructor(public transaction: Transaction | OpreturnTransaction, public transactionFee: number, public isSideChain: boolean) { }
}

export class InterFluxTransactionResponse {
  constructor(public transaction: InterFluxTransaction, public transactionFee: number, public isSideChain: boolean) { }
}

export class BuildTransactionResponse {
  constructor(public fee: number, public hex: string, public  isSideChain: boolean) { }
}
