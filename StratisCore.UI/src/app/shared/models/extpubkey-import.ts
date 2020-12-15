export class ExtPubKeyImport {
  constructor(extPubKey: string, accountIndex: number, walletName: string, creationDate: Date) {
    this.extPubKey = extPubKey;
    this.accountIndex = accountIndex;
    this.name = walletName;
    this.creationDate = creationDate;
  }

  extPubKey: string;
  accountIndex: number;
  name: string;
  creationDate: Date;
}
