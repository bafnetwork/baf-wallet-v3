<script lang="ts">
  import { signMsg } from '@baf-wallet/crypto';

  import { getGlobalContract } from '@baf-wallet/global-contract';

  import {
    Encoding,
    KeyState,
    OAuthState,
  } from '@baf-wallet/interfaces';
  import { createUserVerifyMessage } from '@baf-wallet/utils';
  import Button from '@smui/button';
  import { Account } from 'near-api-js';

  import { WrappedNearChainInterface } from '@baf-wallet/near';

  export let keyState: KeyState;
  export let chainInterface: WrappedNearChainInterface;
  export let cb: () => void;
  export let oauthInfo: OAuthState;

  let loading = false;

  async function removePKFromAccount(
    account: Account,
    chainInterface: WrappedNearChainInterface
  ) {
    loading = true;
    const associatedKeys = await chainInterface.accounts.associatedKeys(
      account
    );
    // Return if none of the associated keys for the given account are the ed25519 key specified in KeyState
    if (
      !associatedKeys.some(
        (key) =>
          key.format(Encoding.BS58) === keyState.edPK.format(Encoding.BS58)
      )
    ) {
      loading = false;
      cb();
      return;
    }
    const userName = oauthInfo.name;
    const nonce = await getGlobalContract().getAccountNonce(keyState.secpPK);
    const msg = createUserVerifyMessage(userName, nonce);
    const secpSig = signMsg(keyState.secpSK, msg, true);

    await getGlobalContract().deleteAccountInfo(
      keyState.secpPK,
      userName,
      secpSig
    );
    await account.deleteKey(keyState.edPK.format(Encoding.BS58));
    loading = false;
    cb();
  }
</script>

{#if !loading}
  <Button
    variant="raised"
    on:click={() =>
      removePKFromAccount(
        chainInterface.getInner().nearMasterAccount,
        chainInterface
      )}>Remove Near Account From BAF Wallet</Button
  >
{:else}
  loading...
{/if}
