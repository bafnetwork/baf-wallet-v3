import { Account, Contract, Near } from 'near-api-js';
import { BafError } from '@baf-wallet/errors';
import ContractConfig from '../../config.json';
import { ec as EC } from 'elliptic';
import {
  PublicKey,
  RustEncodedSecpSig,
  secp256k1,
} from '@baf-wallet/interfaces';
import { NearAccountID } from '@baf-wallet/near';
import { pkToArray } from '@baf-wallet/crypto';

// TODO: the rest of the interface
interface CommunityContract {
  // getAccountId: (pk: PublicKey<secp256k1>) => Promise<NearAccountID | null>;
  // getAccountNonce: (secp_pk: PublicKey<secp256k1>) => Promise<string>;
  // setAccountInfo: (
  //   secp_pk: PublicKey<secp256k1>,
  //   user_id: string,
  //   secp_sig_s: RustEncodedSecpSig,
  //   new_account_id: NearAccountID
  // ) => Promise<void>;
  // deleteAccountInfo: (
  //   secp_pk: PublicKey<secp256k1>,
  //   user_id: string,
  //   secp_sig_s: RustEncodedSecpSig
  // ) => Promise<void>;
  get_default_nft_contract: () => Promise<string>;
}

let communityContract: CommunityContract;

export async function setCommunityContract(
  account: Account
): Promise<CommunityContract> {
  communityContract = await buildCommunityContract(account);
  return communityContract;
}

export function getCommunityContract(): CommunityContract {
  if (communityContract) return communityContract;
  throw BafError.UninitGlobalContract();
}

async function buildCommunityContract(
  account: Account
): Promise<CommunityContract> {
  const contract = new Contract(account, ContractConfig.contractName, {
    viewMethods: [
      // 'get_account_id',
      // 'get_account_nonce',
      'get_admins',
      'get_default_nft_contract',
    ],
    changeMethods: [
      // 'set_account_info',
      // 'delete_account_info',
      'add_admins',
      'remove_admins',
      'set_default_nft_contract',
    ],
  });

  return {
    ...(contract as any),
    /**
     * Below are override functions for the calls
     * Find the contract code in libs/community-contract/contract
     */
    // getAccountId: async (pk) => {
    //   const ret = await (contract as any).get_account_id({
    //     secp_pk: pkToArray(pk),
    //   });
    //   if (!ret || ret === '') return null;
    //   else return ret as NearAccountID;
    // },
    // getAccountNonce: (pk) =>
    //   (contract as any).get_account_nonce({
    //     secp_pk: pkToArray(pk),
    //   }) as Promise<string>,
    // setAccountInfo: (pk, user_id, secp_sig_s, new_account_id) =>
    //   (contract as any).set_account_info({
    //     user_id,
    //     secp_pk: pkToArray(pk),
    //     secp_sig_s: [...secp_sig_s],
    //     new_account_id,
    //   }),
    // deleteAccountInfo: (pk, user_id, secp_sig_s) =>
    //   (contract as any).delete_account_info({
    //     user_id,
    //     secp_pk: pkToArray(pk),
    //     secp_sig_s: [...secp_sig_s],
    //   }),
  };
}
