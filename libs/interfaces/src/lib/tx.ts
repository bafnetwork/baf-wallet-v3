import { ed25519, PublicKey, secp256k1 } from './crypto';
import { PLATFORM } from './platforms';

export enum GenericTxSupportedActions {
  TRANSFER = 'transfer',
  TRANSFER_CONTRACT_TOKEN = 'transfer contract token',
  TRANSFER_NFT = 'transfer nft',
  CREATE_ACCOUNT = 'create account'
}

export interface GenericTxParams {
  recipientUserId?: string;
  recipientUserIdReadable?: string;
  oauthProvider?: PLATFORM;
  actions: GenericTxAction[];
}

interface GenericTxActionBase {
  type: GenericTxSupportedActions;
}

export interface GenericTxActionTransfer extends GenericTxActionBase {
  type: GenericTxSupportedActions.TRANSFER;
  // Amount is the quantity of the minimal sendable unit for a currency
  amount: string;
}

// An NFT connotes an ERC721 NFT, NEP 4 NFT, etc
export interface GenericTxActionTransferNFT extends GenericTxActionBase {
  type: GenericTxSupportedActions.TRANSFER_NFT;
  // The token's id
  tokenId: string;
  // Contract Address or Account ID
  contractAddress: string;
  // Amount is the number of NFTs to send if the contract support semi-fungible NFTs,
  // the amount should default to 1
  amount?: string;
  // An optional string with which to associate a transfer. Some chains support this as a feature
  memo?: string;
  // An optional string which is used with approval management standards which some chains have
  // like Near
  approvalId?: string;
}
// A contract token connotes an ERC21 token, SPL token,  NEP 141 token etc
export interface GenericTxActionTransferContractToken
  extends GenericTxActionBase {
  type: GenericTxSupportedActions.TRANSFER_CONTRACT_TOKEN;
  // Contract Address or Account ID
  contractAddress: string;
  // Amount is the quantity of the minimal sendable unit for a currency
  amount: string;
  // An optional string with which to associate a transfer. Some chains support this as a feature
  memo?: string;
}

export interface GenericTxActionCreateAccount extends GenericTxActionBase {
  type: GenericTxSupportedActions.CREATE_ACCOUNT;
  amount?: string;
}

// To be or'd with whatever other actions we use
export type GenericTxAction =
  | GenericTxActionTransfer
  | GenericTxActionTransferContractToken
  | GenericTxActionTransferNFT
  | GenericTxActionCreateAccount;

export enum SupportedTransferTypes {
  NativeToken = 'Native Token',
  ContractToken = 'Contract Token',
}
