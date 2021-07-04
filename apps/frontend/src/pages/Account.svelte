<script lang="ts">
  import { push } from 'svelte-spa-router';
  import jazzicon from 'jazzicon';
  import Layout from '../components/Layout.svelte';
  import Listbalances from '../components/Listbalances.svelte';
  import History from '../components/History.svelte';
  import { ChainStores, checkChainInit } from '../state/chains.svelte';
  import { Chain } from '@baf-wallet/interfaces';
  import { getEnumValues } from '@baf-wallet/utils';
  import { apiClient } from '../config/api';
  import { SiteKeyStore } from '../state/keys.svelte';
  import Pusher from '@baf-wallet/base-components/Pusher.svelte';

  let viewMode: 'assets' | 'history' = 'assets';

  let displayName: string;
  
  async function getNoChainInit() {
    const chainInits = await Promise.all(
      getEnumValues(Chain).map((chain) =>
        checkChainInit(
          $ChainStores,
          chain,
          apiClient,
          $SiteKeyStore?.edPK,
          $SiteKeyStore?.secpPK
        )
      )
    );
    return !chainInits.every((init) => init === true);
  }

  function hashdisplayName(displayName: string) {
    let hash = 0;
    if (displayName.length == 0) {
      return hash;
    }
    for (var i = 0; i < displayName.length; i++) {
      let char = displayName.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  let displayNameContainer;
  $: _ = (() => {
    if (!displayName) {
      return;
    }
    const icon = jazzicon(40, hashdisplayName(displayName));
    displayNameContainer.prepend(icon);
  })();
</script>

<Layout>
  {#await getNoChainInit()}
    loading...
  {:then noChainInit}
    {#if noChainInit}
      <Pusher route="/welcome"/>
    {:else}
      <h1>Account</h1>
      {#if viewMode === 'assets'}
        <Listbalances />
      {:else}
        <History />
      {/if}
    {/if}
  {/await}
</Layout>
