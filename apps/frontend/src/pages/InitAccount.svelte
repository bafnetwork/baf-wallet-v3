<script lang="ts">
  import { signMsg } from '@baf-wallet/crypto';

  import {
    getGlobalContract,
    setGlobalContract,
  } from '@baf-wallet/global-contract';

  import { ed25519, Encoding, PublicKey } from '@baf-wallet/interfaces';
  import { createUserVerifyMessage } from '@baf-wallet/utils';
  import { Account as NearAccount, WalletConnection } from 'near-api-js';
  import { getNearWalletAccount } from '@baf-wallet/near/web';
  import { doesNearAccountHaveKey } from '@baf-wallet/near';

  import Button from '@smui/button';

  import { constants } from '../config/constants';
  import { getOauthState } from '../state/accounts.svelte';
  import { SiteKeyStore } from '../state/keys.svelte';
  let account: NearAccount;

  async function init() {
    account = await getNearWalletAccount(constants.near.network);
  }


  async function associatePKWithAccount(account: NearAccount) {
    if (await doesNearAccountHaveKey($SiteKeyStore.edPK, account)) return;
    account.addKey($SiteKeyStore.edPK.format(Encoding.BS58));
  }
  async function setGlobalContractAccountInfo(account: NearAccount) {
    await setGlobalContract(account);
    const currentAssociatedAccount = await getGlobalContract().getAccountId(
      $SiteKeyStore.secpPK
    );
    if (currentAssociatedAccount === account.accountId) return;
    const nonce = await getGlobalContract().getAccountNonce(
      $SiteKeyStore.secpPK
    );
    const oauthInfo = getOauthState();
    const userName = oauthInfo.name;

    const msg = createUserVerifyMessage(userName, nonce);
    const secpSig = signMsg($SiteKeyStore.secpSK, msg, true);
    await getGlobalContract().setAccountInfo(
      $SiteKeyStore.secpPK,
      userName,
      secpSig,
      account.accountId
    );
  }
</script>

{#await init()}
  <!-- promise is pending -->
  loading...
{:then _}
  <Button variant="raised" on:click={() => associatePKWithAccount(account)}
    >Associate Account ID</Button
  >
  <Button
    variant="raised"
    on:click={() => setGlobalContractAccountInfo(account)}
    >Associate with secp pk</Button
  >
{/await}
