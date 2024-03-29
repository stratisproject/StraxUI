import { EventEmitter, Injectable } from '@angular/core';
import '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';
import { HttpClient } from '@angular/common/http';
import { ISignalRService } from '@shared/services/interfaces/services.i';
import { GlobalService } from '@shared/services/global.service';
import { RestApi } from '@shared/services/rest-api';
import { ErrorService } from '@shared/services/error-service';
import { interval, Observable, Subscription } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';
import { LoggerService } from '@shared/services/logger.service';

export interface SignalRConnectionInfo {
  signalRUri: string;
  signalRPort: string;
}

export interface SignalRMessageHandler {
  messageType: string;
  onEventMessageDelegate: (message: any) => void;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService extends RestApi implements ISignalRService {

  constructor(http: HttpClient,
              globalService: GlobalService,
              errorService: ErrorService,
              loggerService: LoggerService) {
    super(globalService, http, errorService, loggerService);
    this.connectToSignalR();
  }

  private connection: signalR.HubConnection;
  private onMessageReceivedHandlers: Array<SignalRMessageHandler> = [];
  private connecting = false;
  private connectSubscription: Subscription;
  private connectInterval: Observable<number> = interval(1000).pipe(startWith(0), tap(() => {
    // TODO: consider multiple Hub support
    this.connect('events');
  }));

  public onConnectionFailed: EventEmitter<Error> = new EventEmitter<Error>();

  public registerOnMessageEventHandler<TMessage>(messageType: string, onEventMessageReceivedHandler: (message: TMessage) => void): void {
    this.onMessageReceivedHandlers.push({
      messageType: messageType,
      onEventMessageDelegate: onEventMessageReceivedHandler
    });
  }

  public connect(hubName: string): void {
    this.getConnectionInfo().then((con: SignalRConnectionInfo) => {

      if (this.connection && this.connection.state && this.connection.state !== 4) {
        this.loggerService.warn('signalR connection abort');
        this.connection.stop();
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`http://${this.globalService.getDaemonIP()}:${con.signalRPort}/${hubName}-hub`, {})
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.on('receiveEvent',
                         (message) => {
                           try {
                             this.executeMessageReceivedHandlers(message);
                           } catch (e) {
                             this.errorService.handleError(e, true);
                           }
                         });

      this.connection.onclose((error: Error) => {
        this.onConnectionFailed.emit(error);
        this.loggerService.warn(`disconnected ${error.message}`);
        this.connectToSignalR();
      });

      this.loggerService.info('connecting...');

      this.connection.start()
        .then(() => {
          this.markAsConnected();
        })
        .catch(console.error);
    });
  }

  public hasConnection(): boolean {
    if (this.connection.state === 1) {
      return true;
    } else {
      return false;
    }
  }

  private executeMessageReceivedHandlers(message: any): void {
    this.onMessageReceivedHandlers.forEach(handler => {
      if (message.nodeEventType) {
        const typeParts = message.nodeEventType.split(',');
        if (typeParts[0].endsWith(handler.messageType)) {
          handler.onEventMessageDelegate(message);
        }
      }
    });
  }

  private markAsConnected(): void {
    this.loggerService.info('Connected!');
    if (this.connectSubscription) {
      this.connectSubscription.unsubscribe();
      this.connectSubscription = null;
      this.connecting = false;
    }
  }

  private connectToSignalR(): void {
    if (!this.connecting) {
      this.connecting = true;
      this.connectSubscription = this.connectInterval.subscribe();
    }
  }

  private getConnectionInfo(): Promise<SignalRConnectionInfo> {
    return this.get<SignalRConnectionInfo>('signalR/getConnectionInfo')
      .toPromise();
  }
}
