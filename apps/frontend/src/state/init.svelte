<script lang="ts" context="module">
  import { setGlobalContract } from '@baf-wallet/global-contract';
  import { Chain } from '@baf-wallet/interfaces';
  import { initAccount } from '../state/accounts.svelte';
  import { checkChainInit } from '../state/chains.svelte';
  import { apiClient } from '../config/api';

  interface InitAppRet {
    initNear: boolean;
  }
  // TODO: we have to improve this to not require a reload, please see
  // https://github.com/bafnetwork/baf-wallet-v2/issues/29
  export async function reinitAppState() {
    await initApp()
  }
  export async function initApp(): Promise<InitAppRet> {
    const { chainsState, keys } = await initAccount();

    if (
      keys &&
      (await checkChainInit(
        chainsState,
        Chain.NEAR,
        apiClient,
        keys.edPK,
        keys.secpPK
      ))
    )
      await setGlobalContract(
        chainsState[Chain.NEAR].accounts.masterAccount
      );
    return { initNear: true };
  }
</script>
