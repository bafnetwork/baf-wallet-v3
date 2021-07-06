<script lang="ts" context="module">
  import {
    Chain,
    ed25519,
    Encoding,
    KeyState,
    PublicKey,
    secp256k1,
  } from '@baf-wallet/interfaces';
  import {
    getNearNetworkID,
    NearChainInterface,
    getNearSupportedContractTokens,
getNearChainInterface,
  } from '@baf-wallet/near';
  import { keyPairFromSk } from '@baf-wallet/crypto';
  import { writable } from 'svelte/store';
  import { environment } from '../environments/environment';
  import { apiClient } from '../config/api';
  import { DefaultApi } from '@baf-wallet/api-client';
  import { constants } from '../config/constants';

  export type ChainsState = {
    [Chain.NEAR]?: NearChainInterface;
  };

  export async function checkChainInit(
    chainState: ChainsState,
    chain: Chain,
    apiClient: DefaultApi,
    edPK: PublicKey<ed25519> | null,
    secpPK: PublicKey<secp256k1> | null
  ): Promise<boolean> {
    if (!chainState || !chainState[chain] || !edPK || !secpPK) return false;
    const associatedAccountId = await apiClient.getAccountInfo({
      secpPubkeyB58: secpPK.format(Encoding.BS58) as string,
    });
    if (!associatedAccountId?.nearId) return false;
    const chainAccount = await chainState[chain].accounts.lookup(
      associatedAccountId.nearId
    );
    const associatedKeys = await chainState[chain].accounts.associatedKeys(
      chainAccount
    );
    return associatedKeys.some(
      (key) => key.format(Encoding.BS58) === edPK.format(Encoding.BS58)
    );
  }

  export const ChainStores = writable<ChainsState | null>(null);

  export async function initChains(keys: KeyState): Promise<ChainsState> {
    const nearAccountInfo = await apiClient.getAccountInfo({
      secpPubkeyB58: keys.secpPK.format(Encoding.BS58) as string,
    });

    let chainInfos: ChainsState = {};
    if (nearAccountInfo.nearId && nearAccountInfo.nearId !== '') {
      const near: NearChainInterface = await getNearChainInterface(
        {
          networkID: getNearNetworkID(environment.env),
          masterAccountID: nearAccountInfo.nearId,
          keyPair: keyPairFromSk(keys.edSK),
        }
      );
      chainInfos[Chain.NEAR] = near;
    }
    ChainStores.set(chainInfos);
    return chainInfos;
  }
</script>
