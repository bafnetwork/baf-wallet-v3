<script lang="ts">
  import { getEnumValues } from '@baf-wallet/utils';
  import { Chain } from '@baf-wallet/interfaces';
  import Lazy from '@baf-wallet/base-components/Lazy.svelte';
  import { chainStores, checkChainInit } from '../../state/chains.svelte';
  import { reinitApp } from '../../state/init.svelte';
  import { apiClient } from '../../config/api';
  import { siteKeyStore } from '../../state/keys.svelte';
  import { accountStore } from '../../state/accounts.svelte';

  const chains = getEnumValues(Chain);
  // TODO: clean up imports, see https://github.com/bafnetwork/baf-wallet-v2/issues/54
  const ChainDeleteAccountComponent = (chain: Chain) => () =>
    import(`./${chain}/DeleteAccount.svelte`);

  const ChainInitAccountComponent = (chain: Chain) => () =>
    import(`./${chain}/InitAccount.svelte`);
</script>

{#each chains as chain}
  {#if checkChainInit($chainStores, chain)}
    <!-- content here -->
    Delete your {chain} initialized account: <Lazy
      component={ChainDeleteAccountComponent(chain)}
      cb={reinitApp}
      chainInterface={$chainStores[chain]}
      {apiClient}
      keyState={$siteKeyStore}
      accountState={$accountStore}
    />
  {:else}
    Initialize your {chain} account: <Lazy
      component={ChainInitAccountComponent(chain)}
      cb={reinitApp}
      {apiClient}
      keyState={$siteKeyStore}
      accountState={$accountStore}
    />
  {/if}
{/each}
