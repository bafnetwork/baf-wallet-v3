import { PublicKey, SecretKey, KeyPair, secp256k1, ed25519 } from './crypto';
import { Pair } from '@baf-wallet/utils';
import { Account as NearAccount, Contract } from 'near-api-js';
import { GenericTxAction, GenericTxParams } from './tx';
import { Env } from './configs';
import { TokenInfo } from '..';

export enum Chain {
  NEAR = 'near',
}

// Or the type with all the supported chain account types
export type ChainAccount = NearAccount;

export type Balance = string;

export interface ChainBalance {
  chain: Chain;
  balance: Balance;
}

export interface CommonInitParams {
  supportedContractTokens: string[];
}

export type ExplorerLink = string;

/**
 * It is encouraged to store mappings from both token symbols to token infos and from
 * token contract addresses to infos
 */
export interface ContractTokensConstant {
  [tokenSymbolOrAddress: string]: () => Promise<TokenInfo>;
}
export interface ChainConstants {
  nativeTokenInfo: () => Promise<TokenInfo>;
  tokens: ContractTokensConstant;
  supportedContractTokenContracts: string[];
}

export interface AccountsInterface<Account, LookupParams, CreateParams> {
  lookup: (params: LookupParams) => Promise<Account>;
  create: (params: CreateParams) => Promise<Account>;
  masterAccount: Account;
  getGenericMasterAccount: () => GenericAccount;
  associatedKeys: <T>(account: Account) => Promise<PublicKey<T>[]>;
}

export type AccountContractTokenBalFn = (
  contractAddress: string
) => Promise<Balance>;

export interface GenericAccount {
  getBalance: () => Promise<Balance>;
  getContractTokenBalance: AccountContractTokenBalFn;
}

// bare minimum interface representing direct RPC methods to the chain
// chains are expected to extend this with their own functions and/or values
export interface RpcInterface<Tx, SignedTx, SendOpts, SendResult> {
  endpoint: (network?: string) => string;
}

// minimum interface representing all transaction-related operations
// chains are expected to extend this with their own functions and/or values
export interface TxInterface<
  Tx,
  BuildTxParams,
  SignedTx,
  SignOpts,
  SendOpts,
  SendResult
> {
  build: (params: BuildTxParams) => Promise<Tx>;
  sign: <Curve>(
    tx: Tx,
    keyPair: KeyPair<Curve>,
    opts?: SignOpts
  ) => Promise<SignedTx>;
  send: (
    tx: Tx | SignedTx,
    opts?: SendOpts
  ) => Promise<Pair<SendResult, ExplorerLink>>;
  buildParamsFromGenericTx: (
    params: GenericTxParams,
    senderPkEd: PublicKey<ed25519>,
    recipientPk?: PublicKey<secp256k1> | null
  ) => Promise<BuildTxParams>;
  extractGenericActionsFromTx: (params: BuildTxParams) => GenericTxAction[];
}

export interface ContractInterface<Contract, ContractInitParams> {
  init: (params: ContractInitParams) => Promise<Contract>;
}

// utility for going to/from key BAF Wallet unified types
// each instance expected to be specific to a particular sdk so that
// we aren't ever locked into using BAF types and reimplementing wheelsA
// chains are expected to extend this with their own functions and/or values
export interface Converter<PK, SK, KP> {
  skFromUnified: <Curve>(unifiedSk: SecretKey<Curve>) => SK;
  skToUnified: <Curve>(sk: SK, curveMarker: Curve) => PublicKey<Curve>;
  pkFromUnified: <Curve>(unifiedPk: PublicKey<Curve>) => PK;
  pkToUnified: <Curve>(pk: PK, curveMarker: Curve) => SecretKey<Curve>;
  keyPairFromUnified: <Curve>(unifiedKeyPair: KeyPair<Curve>) => KP;
  keyPairToUnified: <Curve>(
    unifiedKeyPair: KP,
    curveMaker: Curve
  ) => KeyPair<Curve>;
  // add more methods for converting shit as necessary
}
