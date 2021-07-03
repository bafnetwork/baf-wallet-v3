import { RpcInterface } from '@baf-wallet/interfaces';
import { transactions } from 'near-api-js';
import { NearNetworkID, stringToNetworkID } from './utils';
import { NearState } from './near';
import { network } from 'near-api-js/lib/utils';

export type NearRpcInterface = RpcInterface<
  transactions.Transaction,
  transactions.SignedTransaction,
  NearSendOpts,
  NearSendResult
>;

// TODO: go spelunking in near's jsonRpcProvider and see what options it takes
// and see what kind of stuff it actually returns so we can do better than 'any'
// eslint-disable-next-line
export interface NearSendOpts {}

export type NearSendResult = any;

// * add more RPC methods as they are needed

export function nearRpc(_innerSdk: NearState): NearRpcInterface {
  return {
    endpoint: getRPCUrl,
  };
}

export function getWalletUrl(network?: string): string {
  const networkID: NearNetworkID = stringToNetworkID(network ?? 'mainnet');
  return `https://wallet.${networkID}.near.org`;
}

export function getRPCUrl(network?: string): string {
  const networkID: NearNetworkID = stringToNetworkID(network ?? 'mainnet');
  return `https://rpc.${networkID}.near.org`;
}

export const getHelperUrl = (networkID: string) =>
  `https://helper.${networkID}.near.org`;

export const getExplorerUrl = (networkID: string) =>
  `https://explorer.${networkID}.near.org`;
