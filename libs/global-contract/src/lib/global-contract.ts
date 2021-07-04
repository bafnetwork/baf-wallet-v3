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

export const GlobalContractConfig = { ...ContractConfig };
interface GlobalContract {
  getAccountId: (pk: PublicKey<secp256k1>) => Promise<NearAccountID | null>;
  getAccountNonce: (secp_pk: PublicKey<secp256k1>) => Promise<string>;
  setAccountInfo: (
    secp_pk: PublicKey<secp256k1>,
    user_name: string,
    secp_sig_s: RustEncodedSecpSig,
    new_account_id: NearAccountID
  ) => Promise<void>;
  deleteAccountInfo: (
    secp_pk: PublicKey<secp256k1>,
    user_name: string,
    secp_sig_s: RustEncodedSecpSig
  ) => Promise<void>;
  getCommunityContract: (server: string) => Promise<string>;
  [fn_name: string]: (...args: any) => Promise<any>;
}

let globalContract: GlobalContract;

export async function setGlobalContract(
  account: Account
): Promise<GlobalContract> {
  globalContract = await buildGlobalContract(account);
  return globalContract;
}

export function getGlobalContract(): GlobalContract & any {
  if (globalContract) return globalContract;
  throw BafError.UninitGlobalContract();
}

async function buildGlobalContract(
  account: Account
): Promise<GlobalContract & any> {
  const contract = new Contract(account, ContractConfig.contractName, {
    viewMethods: [
      'get_account_info',
      'get_account_nonce',
      'get_community_contract',
      'get_community_default_nft_contract',
    ],
    changeMethods: [
      'set_account_info',
      'delete_account_info',
      'set_community_contract',
    ],
  });

  return {
    ...(contract as any),
    /**
     * Below are override functions for the calls
     * Find the contract code in libs/global-contract/contract
     */
    getAccountId: async (pk) => {
      const ret = await (contract as any).get_account_info({
        secp_pk: pk.format(Encoding.ARRAY),
      });
      if (!ret || ret === '') return null;
      else return ret.account_id as NearAccountID;
    },
    getAccountNonce: (pk) =>
      (contract as any).get_account_nonce({
        secp_pk: pk.format(Encoding.ARRAY),
      }) as Promise<string>,
    setAccountInfo: (pk, user_name, secp_sig_s, new_account_id) =>
      (contract as any).set_account_info({
        user_name,
        secp_pk: pk.format(Encoding.ARRAY),
        secp_sig_s: [...secp_sig_s],
        new_account_id,
      }),
    deleteAccountInfo: (pk, user_name, secp_sig_s) =>
      (contract as any).delete_account_info({
        user_name,
        secp_pk: pk.format(Encoding.ARRAY),
        secp_sig_s: [...secp_sig_s],
      }),
    getCommunityContract: (server) =>
      (contract as any).get_community_contract(server),
  } as any;
}
