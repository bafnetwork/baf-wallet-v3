<script lang="ts">
  import Layout from '../components/Layout.svelte';
  import { getNearWalletAccount } from '../components/chains/near/wallet-connect';
  import { NearNetworkID } from '@baf-wallet/near';
  import { signMsg } from '@baf-wallet/crypto';
  import { Encoding } from '@baf-wallet/interfaces';
  import { Icon } from '@smui/common';
  import {
    getGlobalContract,
    setGlobalContract,
  } from '@baf-wallet/global-contract';
  import { Account as NearAccount } from 'near-api-js';
  import { SiteKeyStore } from '../state/keys.svelte';
  import { AccountStore } from '../state/accounts.svelte';
  import { createUserVerifyMessage } from '@baf-wallet/utils';
  import Button from '@smui/button';
  import Pusher from '@baf-wallet/base-components/Pusher.svelte';
  import { initApp, reinitAppState } from '../state/init.svelte';

  let account;
  let discordAccountConnected = false;
  let done = false;

  async function init() {
    account = await getNearWalletAccount(NearNetworkID.TESTNET, {
      requestIfNotSignedIn: false,
    });
    if (!account) return;
    const currentPubKeys = await account.getAccessKeys();
    const discordPK = $SiteKeyStore.edPK.format(Encoding.BS58);
    const discordPKStr = `ed25519:${discordPK}`;
    discordAccountConnected = currentPubKeys.some(
      ({ public_key }) => public_key === discordPKStr
    );
    if (discordAccountConnected) {
      await setGlobalContract(account);
      const currentAssociatedAccount = await getGlobalContract().getAccountId(
        $SiteKeyStore.secpPK
      );
      done = !!currentAssociatedAccount;
      await reinitAppState();
    }
  }

  async function connectNearAccount() {
    account = await getNearWalletAccount(NearNetworkID.TESTNET, {
      requestIfNotSignedIn: true,
    });
    const discordPK = $SiteKeyStore.edPK.format(Encoding.BS58);
    const discordPKStr = `ed25519:${discordPK}`;
    const currentPubKeys = await account.getAccessKeys();
    if (!currentPubKeys.some(({ public_key }) => public_key === discordPKStr)) {
      await account.addKey(discordPK);
    }
    discordAccountConnected = true;
    await reinitAppState();
  }

  async function setGlobalContractAccountInfo(account: NearAccount) {
    await setGlobalContract(account);

    const currentAssociatedAccount = await getGlobalContract().getAccountId(
      $SiteKeyStore.secpPK
    );
    if (currentAssociatedAccount === account.accountId) {
      done = true;
      return;
    }

    const nonce = await getGlobalContract().get_account_nonce({
      secp_pk: $SiteKeyStore.secpPK.format(Encoding.ARRAY) as number[],
    });
    const userName = $AccountStore.oauthInfo.name;
    console.log(userName);

    const msg = createUserVerifyMessage(userName, nonce);
    const secpSig = signMsg($SiteKeyStore.secpSK, msg, true);

    console.log('howdy');
    await getGlobalContract().set_account_info({
      secp_pk: $SiteKeyStore.secpPK.format(Encoding.ARRAY) as number[],
      user_name: userName,
      secp_sig_s: [...secpSig],
      new_account_id: account.accountId,
    });
    console.log('ho');

    await reinitAppState();
    done = true;
  }
</script>

<Layout>
  {#await init()}
    Loading...
  {:then _}
    <div class="row center">
      <h1>Welcome to BAF Wallet!</h1>
    </div>
    <div class="row">
      <span
        >To get set up, you need a NEAR wallet account and a Discord account.</span
      >
      <span>
        If you don't already have a NEAR wallet, create one now at <a
          href="https://wallet.testnet.near.org/"
          target="_blank">https://wallet.testnet.near.org/</a
        >
      </span>
      <ol>
        <li>Connect your Discord account to your Near Account</li>
        <li>Connect your Discord account to BAF Wallet</li>
      </ol>

      <span
        >Currently, your Discord account wil have full access to the funds in
        the Near account you choose, so we reccomend choosing one that doesn't
        have a lot of funds in it. In a later version we will limit the
        permissions of your discord account so it can't touch any of your funds
        unless you explicitly allow it to.</span
      >
    </div>
    <div class="row">
      <Button
        variant="outlined"
        on:click={connectNearAccount}
        disabled={discordAccountConnected}
      >
        Connect your Discord account to your NEAR account.
      </Button>
      {#if discordAccountConnected}
        <Icon class="material-icons">done</Icon>
      {/if}
    </div>
    <div class="row">
      <Button
        disabled={!account}
        variant="outlined"
        on:click={() => setGlobalContractAccountInfo(account)}
      >
        Connect your Discord account to BAF Wallet
      </Button>
    </div>
    {#if done}
      <Pusher route="/" />
    {/if}
  {/await}
</Layout>

<style>
  .center {
    text-align: center;
  }

  .row {
    padding-top: 2rem;
  }
</style>
