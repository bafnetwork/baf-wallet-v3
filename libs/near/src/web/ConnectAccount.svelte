<script lang="ts">
  import { signMsg } from '@baf-wallet/crypto';

  import {
    getGlobalContract,
    setGlobalContract,
  } from '@baf-wallet/global-contract';

  import {
    ed25519,
    Encoding,
    KeyState,
    OAuthState,
    PublicKey,
  } from '@baf-wallet/interfaces';
  import { createUserVerifyMessage } from '@baf-wallet/utils';
  import { Account as NearAccount, WalletConnection } from 'near-api-js';
  import { getNearWalletAccount } from '@baf-wallet/near/web';

  import Button from '@smui/button';
  import { NearNetworkID } from '../lib/utils';

  export let keyState: KeyState;
  export let cb: () => void;
  export let oauthInfo: OAuthState;
  export let networkID: NearNetworkID;

  let loading = false;
  let account;

  async function init() {
    account = await getNearWalletAccount(networkID);
  }

  async function associatePKWithAccount(account: NearAccount) {
    loading = true;
    // if (await doesNearAccountHaveKey($SiteKeyStore.edPK, account)) return;
    account.addKey(keyState.edPK.format(Encoding.BS58));
    loading = false;
  }

  async function setGlobalContractAccountInfo(account: NearAccount) {
    loading = true;
    await setGlobalContract(account);
    const currentAssociatedAccount = await getGlobalContract().getAccountId(
      keyState.secpPK
    );
    if (currentAssociatedAccount === account.accountId) {
      loading = false;
      cb();
      return;
    }
    const nonce = await getGlobalContract().getAccountNonce(keyState.secpPK);
    const userName = oauthInfo.name;

    const msg = createUserVerifyMessage(userName, nonce);
    const secpSig = signMsg(keyState.secpSK, msg, true);
    await getGlobalContract().setAccountInfo(
      keyState.secpPK,
      userName,
      secpSig,
      account.accountId
    );
    loading = false;
    cb();
  }
</script>

{#await init()}
  <!-- promise is pending -->
  loading...
{:then _}
  {#if loading}
    loading...
  {:else}
    <Button variant="raised" on:click={() => associatePKWithAccount(account)}
      >Associate Account ID</Button
    >
    <Button
      variant="raised"
      on:click={() => setGlobalContractAccountInfo(account)}
      >Associate with secp pk</Button
    >
    <!-- else content here -->
  {/if}
{/await}
