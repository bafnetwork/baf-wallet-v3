<script lang="ts">
  import { signMsg } from '@baf-wallet/crypto';

  import { getGlobalContract } from '@baf-wallet/global-contract';

  import { Encoding, KeyState, OAuthState } from '@baf-wallet/interfaces';
  import { createUserVerifyMessage } from '@baf-wallet/utils';
  import Button from '@smui/button';
  import { Account } from 'near-api-js';

  import { NearChainInterface } from '@baf-wallet/near';

  export let keyState: KeyState;
  export let chainInterface: NearChainInterface;
  export let cb: () => void;
  export let oauthInfo: OAuthState;

  let loading = false;

  async function removePKFromAccount(
    account: Account,
    chainInterface: NearChainInterface
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
    const nonce = await getGlobalContract().get_account_nonce({
      secp_pk: keyState.secpPK.format(Encoding.ARRAY) as number[],
    });
    const msg = createUserVerifyMessage(userName, nonce);
    const secpSig = signMsg(keyState.secpSK, msg, true);

    await getGlobalContract().delete_account_info({
      secp_pk: keyState.secpPK.format(Encoding.ARRAY) as number[],
      user_name: userName,
      secp_sig_s: [...secpSig],
    });
    await account.deleteKey(keyState.edPK.format(Encoding.BS58) as string);
    loading = false;
    cb();
  }
</script>

{#if !loading}
  <Button
    variant="raised"
    on:click={() =>
      removePKFromAccount(
        chainInterface.accounts.masterAccount,
        chainInterface
      )}>Disconnect BAF Wallet from your Near Account</Button
  >
{:else}
  loading...
{/if}
