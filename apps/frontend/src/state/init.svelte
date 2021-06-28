<script lang="ts" context="module">
  import { setCommunityContract } from '@baf-wallet/community-contract';
  import { Chain } from '@baf-wallet/interfaces';
  import { initAccountState } from './accounts.svelte';
  import { checkChainInit } from './chains.svelte';

  export async function initAppState() {
    const { chainsState } = await initAccountState();

    if (checkChainInit(chainsState, Chain.NEAR)) {
      await setCommunityContract(
        chainsState[Chain.NEAR].getInner().nearMasterAccount
      );
    }
  }
</script>
