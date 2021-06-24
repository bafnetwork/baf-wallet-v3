<script lang="ts">
  import { signMsg } from '@baf-wallet/crypto';

  import {
    getGlobalContract,
    setGlobalContract,
  } from '@baf-wallet/global-contract';

  import { ed25519, Encoding, PublicKey } from '@baf-wallet/interfaces';
  import { createUserVerifyMessage } from '@baf-wallet/utils';

  import Button from '@smui/button';
  import {
    getExplorerUrl,
    getHelperUrl,
    getRPCUrl,
    getWalletUrl,
  } from 'libs/near/src/lib/rpc';
  import * as nearAPI from 'near-api-js';
  import { Account as NearAccount, WalletConnection } from 'near-api-js';
  import { constants } from '../config/constants';
  import { SiteKeyStore } from '../state/keys.svelte';

  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  let account: NearAccount;

  async function init() {
    const wallet = await getWallet();
    account = wallet.account();
  }

  async function doesAccountHaveKey(
    pk: PublicKey<ed25519>,
    account: NearAccount
  ) {
    const keys = await account.getAccessKeys();
    console.log(keys, pk.format(Encoding.BS58));
    // return true
    const edPkStrs = keys
      .map((key) => key.public_key as string)
      .filter((keyStr) => keyStr.includes('ed25519:'))
      .map((key) => key.split('ed25519:')[1]);
    return edPkStrs.includes(pk.format(Encoding.BS58));
  }

  async function getWallet() {
    const { connect } = nearAPI;

    const config = {
      networkId: 'testnet',
      keyStore, // optional if not signing transactions
      nodeUrl: getRPCUrl(constants.near.network),
      walletUrl: getWalletUrl(constants.near.network),
      helperUrl: getHelperUrl(constants.near.network),
      explorerUrl: getExplorerUrl(constants.near.network),
    };
    const near = await connect(config);
    console.log(near);
    const wallet = new WalletConnection(near, 'Baf wallet?');
    if (wallet.isSignedIn()) console.log('signed in');
    else {
      wallet.requestSignIn(
        'example-contract.testnet', // contract requesting access
        'BAF Wallet' // optional
      );
    }
    return wallet;
  }

  async function removePKFromAccount(account: NearAccount) {
    if (!(await doesAccountHaveKey($SiteKeyStore.edPK, account))) return;
    account.deleteKey($SiteKeyStore.edPK.format(Encoding.BS58));
  }

  async function associatePKWithAccount(account: NearAccount) {
    if (await doesAccountHaveKey($SiteKeyStore.edPK, account)) return;
    account.addKey($SiteKeyStore.edPK.format(Encoding.BS58));
  }
  async function setGlobalContractAccountInfo(account: NearAccount) {
    await setGlobalContract(account);
    const nonce = await getGlobalContract().getAccountNonce(
      $SiteKeyStore.secpPK
    );
    const userId = 'llll';
    const msg = createUserVerifyMessage(userId, nonce);
    const secpSig = signMsg($SiteKeyStore.secpSK, msg, true);
    await getGlobalContract().setAccountInfo(
      $SiteKeyStore.secpPK,
      userId,
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
  <Button variant="raised" on:click={() => removePKFromAccount(account)}
    >Remove association</Button
  >
  <Button
    variant="raised"
    on:click={() => setGlobalContractAccountInfo(account)}
    >Associate with secp pk</Button
  >
{/await}
