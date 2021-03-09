import { Transaction } from '@shared/models/transaction';
import { OpreturnTransaction } from './opreturn-transaction';

export class TransactionResponse {
  constructor(public transaction: Transaction | OpreturnTransaction, public transactionFee: number) {
  }
}

export class BuildTransactionResponse {
  constructor(public fee: number, public hex: string) {
  }

}
