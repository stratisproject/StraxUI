import { Injectable } from '@angular/core';
import { ElectronService } from '@shared/services/electron.service';
import { WalletInfo } from '@shared/models/wallet-info';
import { BehaviorSubject, Observable } from 'rxjs';
import { VERSION } from '../../../environments/version';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  constructor(private electronService: ElectronService) {
    this.setApplicationVersion();
    this.setGitCommit();
    this.setTestnetEnabled();
    this.setApiPort();
    this.setDaemonIP();
  }

  private applicationVersion = '1.6.0';
  private gitCommit = "";
  private testnet = false;
  private mainApiPort = 17103;
  private testApiPort = 27103;
  private apiPort: number;
  private walletPath: string;
  private currentWalletName: string;
  private currentWalletAccount: string;
  private watchOnlySubject = new BehaviorSubject<boolean>(false);
  private network: string;
  private daemonIP: string;
  private version = VERSION;

  public coinUnit: string;

  public currentWallet: Observable<WalletInfo> = new BehaviorSubject<WalletInfo>(null);

  public getApplicationVersion(): string {
    return this.applicationVersion;
  }

  public setApplicationVersion(): void {
    if (this.electronService.isElectron) {
      this.applicationVersion = this.electronService.remote.app.getVersion();
    }

    this.watchOnlySubject.next(false);
  }

  public getGitCommit(): string {
    return this.gitCommit;
  }

  public setGitCommit(): void {
    this.gitCommit = this.version.hash;
  }

  public getTestnetEnabled(): boolean {
    return this.testnet;
  }

  public setTestnetEnabled(): void {
    if (this.electronService.isElectron) {
      this.testnet = this.electronService.ipcRenderer.sendSync('get-testnet');
    }
  }

  public getApiPort(): number {
    return this.apiPort;
  }

  public setApiPort(): void {
    if (this.electronService.isElectron) {
      this.apiPort = this.electronService.ipcRenderer.sendSync('get-port');
    } else if (this.testnet) {
      this.apiPort = this.testApiPort;
    } else if (!this.testnet) {
      this.apiPort = this.mainApiPort;
    }
  }

  public getWalletPath(): string {
    return this.walletPath;
  }

  public setWalletPath(walletPath: string): void {
    this.walletPath = walletPath;
  }

  public getNetwork(): string {
    return this.network;
  }

  public setNetwork(network: string): void {
    this.network = network;
  }

  public getWalletName(): string {
    return this.currentWalletName;
  }

  public setWalletName(currentWalletName: string): void {
    this.currentWalletName = currentWalletName;
  }

  public getWallet(): Observable<WalletInfo> {
    return this.currentWallet;
  }

  public setWallet(wallet: WalletInfo): void {
    this.setWalletName(wallet.walletName);
    this.setWalletAccount(wallet.account);
    (this.currentWallet as BehaviorSubject<WalletInfo>).next(new WalletInfo(this.getWalletName(), this.getWalletAccount()));
  }

  public getWalletAccount(): string {
    return this.currentWalletAccount;
  }

  public setWalletAccount(walletAccount?: string): void {
    this.currentWalletAccount = walletAccount || "account 0";
  }

  public isWatchOnly(): Observable<boolean> {
    return this.watchOnlySubject.asObservable();
  }

  public setWalletWatchOnly(isWatchOnly: boolean): void {
    this.watchOnlySubject.next(isWatchOnly);
  }

  public getCoinUnit(): string {
    return this.coinUnit;
  }

  public setCoinUnit(coinUnit: string): void {
    this.coinUnit = coinUnit;
  }

  public getDaemonIP(): string {
    return this.daemonIP;
  }

  public setDaemonIP(): void {
    if (this.electronService.isElectron) {
      this.daemonIP = this.electronService.ipcRenderer.sendSync('get-daemonip');
    } else {
      this.daemonIP = 'localhost';
    }
  }
}
