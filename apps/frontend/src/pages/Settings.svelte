<script lang="ts">
  import Layout from '../components/Layout.svelte';
  import { Chain } from '@baf-wallet/interfaces';
  import Pusher from '@baf-wallet/base-components/Pusher.svelte';
  import Button from '@smui/button';
  import { ChainStores, checkChainInit } from '../state/chains.svelte';
  import { AccountStore } from '../state/accounts.svelte';
  import { packKey, SiteKeyStore } from '../state/keys.svelte';
  import { reinitApp } from '../state/init.svelte';
  import { apiClient } from '../config/api';
  import { saveAs } from 'file-saver';
  import DisconnectNearAccount from '../components/chains/near/DisconnectAccount.svelte';

  function downloadKeys() {
    const key = packKey($SiteKeyStore);
    const fileToSave = new Blob([JSON.stringify(key)], {
      type: 'application/json',
    });
    saveAs(fileToSave, 'baf-wallet.json');
  }

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

{#await isInit(Chain.NEAR)}
<!-- promise is pending -->
{:then chainInit}
  {#if chainInit}
    <Layout>
      <DisconnectNearAccount
        cb={reinitApp}
        oauthInfo={$AccountStore.oauthInfo}
        chainInterface={$ChainStores[Chain.NEAR]}
        keyState={$SiteKeyStore}
      />
      <div>
        <h3>Danger Zone</h3>
        <div>
          <Button on:click={downloadKeys}>Download your keys</Button>
        </div>
      </div>
    </Layout>
  {:else}
    <Pusher route="/welcome"/>
  {/if}
{/await}

