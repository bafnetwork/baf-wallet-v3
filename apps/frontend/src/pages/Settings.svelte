<script lang="ts">
  import Layout from '../components/Layout.svelte';
  import { Chain } from '@baf-wallet/interfaces';
  import Pusher from '@baf-wallet/base-components/Pusher.svelte';
  import Button from '@smui/button';
  import { ChainStores, checkChainInit } from '../state/chains.svelte';
  import { AccountStore } from '../state/accounts.svelte';
  import { packKey, SiteKeyStore } from '../state/keys.svelte';
  import { reinitAppState } from '../state/init.svelte';
  import { apiClient } from '../config/api';
  import { saveAs } from 'file-saver';
  import DisconnectNearAccount from '../components/chains/near/DisconnectAccount.svelte';
  import { push } from 'svelte-spa-router';

  function downloadKeys() {
    const key = packKey($SiteKeyStore);
    const fileToSave = new Blob(
      [
        JSON.stringify({
          privateKey: key,
        }),
      ],
      {
        type: 'application/json',
      }
    );
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

{#await isInit(Chain.NEAR) then chainInit}
  {#if chainInit}
    <Layout>
      <div class="wrapper">
        <div class="row center">
          <h1>Welcome to BAF Wallet!</h1>
        </div>
        <DisconnectNearAccount
          cb={async () => {
            reinitAppState();
            push('/welcome');
          }}
          oauthInfo={$AccountStore.oauthInfo}
          chainInterface={$ChainStores[Chain.NEAR]}
          keyState={$SiteKeyStore}
        />
        <Button on:click={downloadKeys} variant="raised"
          >Download your keys</Button
        >
      </div>
    </Layout>
  {:else}
    <Pusher route="/welcome" />
  {/if}
{/await}

<style>
  .wrapper {
    display: grid;
    gap: 2rem;
  }
</style>
