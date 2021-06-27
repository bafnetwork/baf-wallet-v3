<script lang="ts">
  import { getEnumValues } from '@baf-wallet/utils';
  import { Chain } from '@baf-wallet/interfaces';
  import Lazy from '@baf-wallet/base-components/Lazy.svelte';
  import { ChainStores, checkChainInit } from '../../state/chains.svelte';
  import { reinitApp } from '../../config/init.svelte';
  import { SiteKeyStore } from '../../state/keys.svelte';
  import { AccountStore } from '../../state/accounts.svelte';
  import { apiClient } from '../../config/api';
  import { constants } from '../../config/constants';

  const chains = getEnumValues(Chain);
  const ChainConnectAccount = (chain: Chain) => () =>
    // TODO: clean up imports, see https://github.com/bafnetwork/baf-wallet-v2/issues/54
    import(`../../../../../libs/${chain}/src/web/ConnectAccount.svelte`);
  const ChainDisconnectAccount = (chain: Chain) => () =>
    // TODO: clean up imports, see https://github.com/bafnetwork/baf-wallet-v2/issues/54
    import(`../../../../../libs/${chain}/src/web/DisconnectAccount.svelte`);
  async function isInit(chain: Chain) {
    return await checkChainInit(
      $ChainStores,
      chain,
      apiClient,
      $SiteKeyStore?.edPK,
      $SiteKeyStore?.secpPK
    );
  }
</script>

{#each chains as chain}
  {#await isInit(chain)}
    <!-- promise is pending -->
  {:then chainInit}
    {#if chainInit}
      Disconnnect your discord account from your {chain} account: <Lazy
        component={ChainDisconnectAccount(chain)}
        cb={reinitApp}
        oauthInfo={$AccountStore.oauthInfo}
        chainInterface={$ChainStores[chain]}
        keyState={$SiteKeyStore}
      />
    {:else}
      Connect your discord account to your {chain} account
      <Lazy
        component={ChainConnectAccount(chain)}
        cb={reinitApp}
        oauthInfo={$AccountStore.oauthInfo}
        chainInterface={$ChainStores[chain]}
        keyState={$SiteKeyStore}
        networkID={constants[chain].network}
      />
    {/if}
    <!-- promise was fulfilled -->
  {/await}
{/each}
