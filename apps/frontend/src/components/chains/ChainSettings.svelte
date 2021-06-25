<script lang="ts">
  import { getEnumValues } from '@baf-wallet/utils';
  import { Chain } from '@baf-wallet/interfaces';
  import Lazy from '@baf-wallet/base-components/Lazy.svelte';
  import { ChainStores, checkChainInit } from '../../state/chains.svelte';
  import { reinitApp } from '../../config/init.svelte';
  import { SiteKeyStore } from '../../state/keys.svelte';
  import { AccountStore } from '../../state/accounts.svelte';

  const chains = getEnumValues(Chain);
  const ChainDisconnectAccount = (chain: Chain) => () =>
    // TODO: clean up imports, see https://github.com/bafnetwork/baf-wallet-v2/issues/54
    import(`../../../../../libs/${chain}/src/web/DisconnectAccount.svelte`);
</script>

{#each chains as chain}
  {#if checkChainInit($ChainStores, chain)}
    Disconnnect your discord account from your {chain} account: <Lazy
      component={ChainDisconnectAccount(chain)}
      cb={reinitApp}
      oauthInfo={$AccountStore.oauthInfo}
      chainInterface={$ChainStores[chain]}
      keyState={$SiteKeyStore}
    />
  {/if}
{/each}
