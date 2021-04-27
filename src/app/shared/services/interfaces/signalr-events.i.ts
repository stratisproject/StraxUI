import { GeneralInfo, StakingInfo, GetColdStakingInfo } from '@shared/services/interfaces/api.i';

export interface SignalREvent {
  nodeEventType: string;
}

export interface BlockConnectedSignalREvent extends SignalREvent {
  hash: string;
  height: number;
}

export interface WalletInfoSignalREvent extends SignalREvent, GeneralInfo {
}

export interface StakingInfoSignalREvent extends SignalREvent, StakingInfo {
}

export interface ColdStakingInfoSignalREvent extends SignalREvent, GetColdStakingInfo {
}

export interface FullNodeEvent extends SignalREvent {
  message: string;
  state: string;
}

export enum SignalREvents {
  BlockConnected = 'BlockConnected',
  TransactionReceived = 'TransactionReceived',
  WalletGeneralInfo = 'WalletGeneralInfo',
  StakingInfo = 'StakingInfo',
  ColdStakingInfo = 'ColdStakingInfo',
  FullNodeEvent = 'FullNodeEvent',
  WalletProcessedTransactionOfInterestEvent = 'WalletProcessedTransactionOfInterestEvent',
}
