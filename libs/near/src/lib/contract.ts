import { ContractInterface } from '@baf-wallet/interfaces';
import BN from 'bn.js';
import { Account, Contract as NearNativeContract } from 'near-api-js';
import { NearAccountID } from './accounts';

import { NearState } from './near';

interface NearNFTToken {
  id: string;
  owner_id: string;
}

export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}

/**
 * The following are definitions for standard Near Contracts
 */
export interface NEP141Contract extends NearContract {
  // TODO: fill in, see https://github.com/bafnetwork/baf-wallet-v2/issues/69
  ft_balance_of: (args: { account_id: NearAccountID }) => Promise<string>;
  ft_total_supply: () => Promise<string>;
  storage_balance_of: (args: { account_id: NearAccountID }) => Promise<string>;
  // 1 Yocto Near is the standard accepted attached deposit for ft_transfer
  ft_transfer: (
    args: {
      receiver_id: NearAccountID;
      amount: string;
      memo?: string;
    },
    gas: string,
    attachedDeposit: string
  ) => Promise<void>;
  ft_metadata: () => Promise<TokenMetadata>;
}

export interface NEP171Contract extends NearContract {
  nft_transfer: (
    args: {
      receiver_id: NearAccountID;
      token_id: string;
      approval_id: BN | null;
      memo?: string;
    },
    gas: string,
    attachedDeposit: string
  ) => Promise<void>;
  nft_transfer_call: (
    args: {
      receiver_id: NearAccountID;
      token_id: string;
      approval_id: BN | null;
      memo?: string;
      msg: string;
    },
    gas: string,
    attachedDeposit: string
  ) => Promise<void>;
  nft_token: (args: { token_id: string }) => Promise<NearNFTToken>;
}

type contractViewMethod = (args: any) => Promise<any>;
type contractChangeMethod = (
  args: any,
  gas?: string,
  attachedDeposit?: string
) => Promise<any>;

/**
 * End definitions for standard Near Contracts
 */
export type NearContract = {
  [fn_name: string]: contractViewMethod | contractChangeMethod;
};

export interface NearInitContractParams {
  callerAccount?: Account;
  viewMethods: string[];
  changeMethods: string[];
}

export const initContract = (
  nearMasterAccount: Account,
  contractAccountID
) => async <Contract>(params: NearInitContractParams) => {
  const contract = new NearNativeContract(
    params.callerAccount ?? nearMasterAccount,
    contractAccountID,
    {
      viewMethods: params.viewMethods,
      changeMethods: params.changeMethods,
    }
  );
  return (contract as unknown) as Contract;
};

export function getContract<
  Contract,
  ContractInitParams extends NearInitContractParams
>(
  nearState: NearState,
  contractAccountID: string
): ContractInterface<Contract, ContractInitParams> {
  return {
    init: initContract(nearState.nearMasterAccount, contractAccountID),
  };
}
