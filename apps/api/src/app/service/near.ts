import {
  ed25519,
  Encoding,
  PublicKey,
  secp256k1,
} from '@baf-wallet/interfaces';
import {
  getGlobalContract,
  setGlobalContract,
} from '@baf-wallet/global-contract';
import { createUserVerifyMessage, encodeBytes } from '@baf-wallet/utils';
import { verifySignature } from '@baf-wallet/crypto';
import { BafError } from '@baf-wallet/errors';
import { getNearChain } from '@baf-wallet/global-state';

export interface NearAccountInfo {
  near_id: string | null;
}

// Check the found public key verifies the signature produced by (nonce + userId)
export async function createNearAccount(
  secpPK: PublicKey<secp256k1>,
  edPK: PublicKey<ed25519>,
  userId: string,
  nonce: string,
  secpSig: string,
  rustEncodedSecpSig: string,
  edSig: string,
  accountID: string
) {
  const msg = createUserVerifyMessage(userId, nonce);
  if (!verifySignature(secpPK, msg, encodeBytes(secpSig, Encoding.HEX))) {
    throw BafError.InvalidSignature(secpPK);
  }
  if (!verifySignature(edPK, msg, encodeBytes(edSig, Encoding.HEX))) {
    throw BafError.InvalidSignature(edPK);
  }

  const near = await getNearChain();

  const nearAccount = near.accounts;
  await nearAccount.create({
    accountID,
    newAccountPk: edPK,
  });

  const CommunityContract = await getGlobalContract();
  await CommunityContract.set_account_info({
    secp_pk: secpPK.format(Encoding.ARRAY) as number[],
    user_name: userId,
    secp_sig_s: [...encodeBytes(rustEncodedSecpSig, Encoding.HEX)],
    new_account_id: accountID,
  });
}

export async function getAccountNonce(
  pk: PublicKey<secp256k1>
): Promise<string> {
  return await getGlobalContract().get_account_nonce({
    secp_pk: pk.format(Encoding.ARRAY) as number[],
  });
}

export async function getAccountInfoFromSecpPK(
  pk: PublicKey<secp256k1>
): Promise<NearAccountInfo> {
  return {
    near_id: await getGlobalContract().getAccountId(pk),
  };
}
