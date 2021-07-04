import { PublicKey, SecretKey, KeyPair, secp256k1, ed25519 } from './crypto';
import { Pair } from '@baf-wallet/utils';
import { Account as NearAccount, Contract } from 'near-api-js';
import { GenericTxAction, GenericTxParams } from './tx';
import { TokenInfo } from '..';
import { InternalError } from 'near-api-js/lib/generated/rpc_error_types';

export enum Chain {
  NEAR = 'near',
}

// export interface ChainInterface {
//   chain: Chain;
//   rpc: RpcInterface<any, any, any, any>;
//   tx: TxInterface<any, any, any, any, any, any>;
//   accounts: AccountsInterface<any, any, any>;
//   convert: Converter<any, any, any>;
//   constants: ChainConstants;
//   contracts: ContractInterface<any, any>;
// }

// export interface ChainInterface {
//   chain: Chain;
//   init: (params: any) => Promise<any>;
//   rpc: (innerSdk: any) => RpcInterface<any, any, any, any>;
//   tx: (innerSdk: any) => TxInterface<any, any, any, any, any, any>;
//   accounts: (innerSdk: any) => AccountsInterface<any, any, any>;
//   convert: Converter<any, any, any>;
//   constants: (innerSdk: any) => ChainConstants;
//   contracts: (innerSdk: any) => ContractInterface<any, any>;
// }

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

// interface that every chain implementation is expected to implement
// the 'innerSdk' HOF's are the way they are because most SDK's tend to be stateful (booooo)
// which we need to be able to keep track of.
// Since every SDK is probably going to be stateful, if at all, in a slightly different way,
// we need to decouple the sdk's state from the actual functionality. If the 'Inner' type is expected
// to contain all of the SDK's state, partial application affords us the flexibility we need to deal with
// any kind of statefulness. Note that Inner can theoretically be void in the case that the underlying
// SDK is stateless
export interface ChainInterface<
  PK,
  SK,
  KP,
  InitParams,
  Inner,
  Tx,
  BuildTxParams,
  SignedTx,
  SignOpts,
  SendOpts,
  SendResult,
  Account,
  AccountLookupParams,
  AccountCreateParams,
  ContractInitParams
> {
  init: (params: InitParams) => Promise<Inner>;
  rpc: (innerSdk: Inner) => RpcInterface<Tx, SignedTx, SendOpts, SendResult>;
  tx: (
    innerSdk: Inner
  ) => TxInterface<Tx, BuildTxParams, SignedTx, SignOpts, SendOpts, SendResult>;
  accounts: (
    innerSdk: Inner
  ) => AccountsInterface<Account, AccountLookupParams, AccountCreateParams>;
  convert: Converter<PK, SK, KP>;
  constants: (innerSdk: Inner) => Promise<ChainConstants>;
  contracts: <Contract>(
    innerSdk: Inner,
    address: string
  ) => ContractInterface<Contract, ContractInitParams>;
  // Types marked under score are used for internal type checking within the multi-chain library
  _initParams?: InitParams
}

export interface WrappedChainInterface<
  PK,
  SK,
  KP,
  Inner,
  Tx,
  BuildTxParams,
  SignedTx,
  SignOpts,
  SendOpts,
  SendResult,
  Account,
  AccountLookupParams,
  AccountCreateParams,
  ContractInitParams
> {
  rpc: RpcInterface<Tx, SignedTx, SendOpts, SendResult>;
  tx: TxInterface<Tx, BuildTxParams, SignedTx, SignOpts, SendOpts, SendResult>;
  accounts: AccountsInterface<
    Account,
    AccountLookupParams,
    AccountCreateParams
  >;
  convert: Converter<PK, SK, KP>;
  constants: ChainConstants;
  contracts: <Contract>(
    address: string
  ) => ContractInterface<Contract, ContractInitParams>;
  getInner: () => Inner
}

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
    recipientPk: PublicKey<secp256k1> | null,
    senderPkSecp: PublicKey<secp256k1>,
    senderPkEd: PublicKey<ed25519>
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

export type InferChainInterface<T> = T extends ChainInterface<
  infer PK,
  infer SK,
  infer KP,
  infer InitParams,
  infer Inner,
  infer Tx,
  infer BuildTxParams,
  infer SignedTx,
  infer SignOpts,
  infer SendOpts,
  infer SendResult,
  infer Account,
  infer AccountLookupParams,
  infer AccountCreateParams,
  infer ContractInitParamsBase
>
  ? ChainInterface<
      PK,
      SK,
      KP,
      InitParams,
      Inner,
      Tx,
      BuildTxParams,
      SignedTx,
      SignOpts,
      SendOpts,
      SendResult,
      Account,
      AccountLookupParams,
      AccountCreateParams,
      ContractInitParamsBase
    >
  : never;

export type InferWrapChainInterface<T> = T extends ChainInterface<
  infer PK,
  infer SK,
  infer KP,
  infer _,
  infer Inner,
  infer Tx,
  infer BuildTxParams,
  infer SignedTx,
  infer SignOpts,
  infer SendOpts,
  infer SendResult,
  infer Account,
  infer AccountLookupParams,
  infer AccountCreateParams,
  infer ContractInitParamsBase
>
  ? WrappedChainInterface<
      PK,
      SK,
      KP,
      Inner,
      Tx,
      BuildTxParams,
      SignedTx,
      SignOpts,
      SendOpts,
      SendResult,
      Account,
      AccountLookupParams,
      AccountCreateParams,
      ContractInitParamsBase
    >
  : never;
