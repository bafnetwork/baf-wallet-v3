<script lang="ts">
  import { getEnumValues } from '@baf-wallet/utils';
  import { Chain } from '@baf-wallet/interfaces';
  import Lazy from '@baf-wallet/base-components/Lazy.svelte';
  import { chainStores, checkChainInit } from '../../state/chains.svelte';
  import { initAppState } from '../../state/init.svelte';
  import { apiClient } from '../../config/api';
  import { siteKeyStore } from '../../state/keys.svelte';
  import { accountStore } from '../../state/accounts.svelte';

  const chains = getEnumValues(Chain);
  const ChainDeleteAccountComponent = (chain: Chain) => () =>
    import(`./${chain}/DeleteAccount.svelte`);

  const ChainInitAccountComponent = (chain: Chain) => () =>
    import(`./${chain}/InitAccount.svelte`);
</script>

{#each chains as chain}
  {#if checkChainInit($chainStores, chain)}
    Delete your {chain} initialized account: <Lazy
      component={ChainDeleteAccountComponent(chain)}
      cb={initAppState}
      chainInterface={$chainStores[chain]}
      {apiClient}
      keyState={$siteKeyStore}
      accountState={$accountStore}
    />
  {:else}
    Initialize your {chain} account: <Lazy
      component={ChainInitAccountComponent(chain)}
      cb={initAppState}
      {apiClient}
      keyState={$siteKeyStore}
      accountState={$accountStore}
    />
  {/if}
{/each}
