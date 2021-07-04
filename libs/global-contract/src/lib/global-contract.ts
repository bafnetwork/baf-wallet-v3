import { Account, Contract } from 'near-api-js';
import { BafError } from '@baf-wallet/errors';
import ContractConfig from '../../config.json';
import {
  Encoding,
  PublicKey,
  RustEncodedSecpSig,
  secp256k1,
} from '@baf-wallet/interfaces';
import { NearAccountID } from '@baf-wallet/near';
import { initContract, NearContract } from 'libs/near/src/lib/contract';

export const GlobalContractConfig = { ...ContractConfig };

interface GlobalContract extends NearContract {
  getAccountId: (pk: PublicKey<secp256k1>) => Promise<string>;
  get_account_info: (args: {
    secp_pk: number[];
  }) => Promise<{
    user_name: string;
    account_id: string;
  }>;
  get_account_nonce: (args: { secp_pk: number[] }) => Promise<string>;
  set_account_info: (args: {
    secp_pk: number[];
    user_name: string;
    secp_sig_s: RustEncodedSecpSig;
    new_account_id: NearAccountID;
  }) => Promise<void>;
  delete_account_info: (args: {
    secp_pk: number[];
    user_name: string;
    secp_sig_s: RustEncodedSecpSig;
  }) => Promise<void>;
  get_community_contract: (args: { server: string }) => Promise<string>;
  get_community_default_nft_contract: (args: {
    server: string;
  }) => Promise<string>;
  set_community_default_nft_contract: (args: {
    server: string;
    nft_contract: string;
  }) => Promise<void>;
}

let globalContract: GlobalContract;

export async function setGlobalContract(
  account: Account
): Promise<GlobalContract> {
  globalContract = await buildGlobalContract(account);
  return globalContract;
}

export function getGlobalContract(): GlobalContract {
  if (globalContract) return globalContract;
  throw BafError.UninitGlobalContract();
}

async function buildGlobalContract(account: Account): Promise<GlobalContract> {
  const contract = await initContract(
    account,
    ContractConfig.contractName
  )<GlobalContract>({
    viewMethods: [
      'get_account_info',
      'get_account_nonce',
      'get_community_contract',
      'get_community_default_nft_contract',
    ],
    changeMethods: [
      'set_account_info',
      'delete_account_info',
      'set_community_default_nft_contract',
    ],
  });
  return {
    ...contract,
    getAccountId: async (pk) =>
      (
        await contract.get_account_info({
          secp_pk: pk.format(Encoding.ARRAY) as number[],
        })
      )?.account_id,
  };
}
