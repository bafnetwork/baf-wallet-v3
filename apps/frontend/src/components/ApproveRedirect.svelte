<script lang="ts">
  import Card, { Content, Actions } from '@smui/card';
  import Button from '@smui/button';
  import { Icon } from '@smui/common';
  import AmountFormatter from '@baf-wallet/base-components/AmountFormatter.svelte';
  import { BafError } from '@baf-wallet/errors';
  import Spinner from 'svelte-spinner';

  //TODO: Change to global color vairable. See https://github.com/bafnetwork/baf-wallet-v2/issues/53
  let size = 25;
  let speed = 750;
  let color = '#A82124';
  let thickness = 2.0;
  let gap = 40;

  import { SiteKeyStore } from '../state/keys.svelte';
  import { ChainStores, checkChainInit } from '../state/chains.svelte';
  import { deserializeTxParams } from '@baf-wallet/redirect-generator';
  import {
    Chain,
    Encoding,
    GenericTxAction,
    GenericTxParams,
    GenericTxSupportedActions,
    PublicKey,
    secp256k1,
    TokenInfo,
  } from '@baf-wallet/interfaces';
  import { getGlobalContract } from '@baf-wallet/global-contract';
  import { getTorusPublicAddress } from '@baf-wallet/torus';
  import { keyPairFromSk } from '@baf-wallet/crypto';
  import BN from 'bn.js';
  import { apiClient } from '../config/api';

  export let params = {} as any;
  export let chain: Chain = params ? params.chain : null;
  export let txParams: GenericTxParams;
  export let tokenInfos: (TokenInfo | null)[];
  export let onCancel = () => window.close();

  let tx: any;
  let actions: GenericTxAction[];
  let isLoading = false;
  let explorerUrl: string;
  let error: string;
  let attemptedApprove = false;
  let txSuccess = false;
  let recipientUserName: string;

  async function initGenericTx() {
    if (
      (!txParams.recipientUserId && !txParams.recipientAddress) ||
      !txParams.oauthProvider
    ) {
      throw BafError.GenericTxRequiresOauthInfo();
    }
    let recipientPubkey: PublicKey<secp256k1> | undefined
    if (txParams.recipientUserId) {
      recipientPubkey = await getTorusPublicAddress(
        txParams.recipientUserId,
        txParams.oauthProvider
      );

      const account_info = await getGlobalContract().get_account_info({
        secp_pk: recipientPubkey.format(Encoding.ARRAY) as number[],
      });
      if (!account_info) throw BafError.SecpPKNotAssociatedWithAccount(chain);
      txParams.recipientAddress = account_info.account_id;
      recipientUserName = account_info.user_name;
    }

    const nearTxParams = await $ChainStores[
      Chain.NEAR
    ].tx.buildParamsFromGenericTx(
      txParams,
      $SiteKeyStore.edPK,
      recipientPubkey,
    );
    actions = txParams.actions;
    tx = await $ChainStores[Chain.NEAR].tx.build(nearTxParams);
  }

  async function initTokenInfos() {
    const tokenInfoProms = txParams.actions.map((action) => {
      if (action.type === GenericTxSupportedActions.TRANSFER)
        return $ChainStores[chain].constants.nativeTokenInfo();
      else if (
        action.type === GenericTxSupportedActions.TRANSFER_CONTRACT_TOKEN
      ) {
        return (
          $ChainStores[chain].constants.tokens[action.contractAddress]?.() ??
          null
        );
      } else null;
    });
    tokenInfos = await Promise.all(tokenInfoProms);
  }

  async function init() {
    if (
      !(await checkChainInit(
        $ChainStores,
        chain,
        apiClient,
        $SiteKeyStore?.edPK,
        $SiteKeyStore?.secpPK
      ))
    ) {
      // TODO: redirect to login
      // See Github issue: https://github.com/bafnetwork/baf-wallet-v3/issues/6
      throw BafError.UninitChain(chain);
    }
    txParams = deserializeTxParams(params.txParams);
    await initTokenInfos();
    await initGenericTx();
  }

  console.log(process.env.TORUS_VERIFIER_NAME);

  async function onApprove() {
    attemptedApprove = true;
    isLoading = true;
    try {
      const signed = await $ChainStores[chain].tx.sign(
        tx,
        keyPairFromSk($SiteKeyStore.edSK)
      );
      BN.prototype.toString = undefined;
      const ret = await $ChainStores[chain].tx.send(signed);
      console.log(ret.fst);
      explorerUrl = ret.snd;
      txSuccess = true;
    } catch (e) {
      console.error(e);
      error = e;
    }
    isLoading = false;
  }
</script>

{#await init()}
  Loading...
{:then signer}
  {#if !txSuccess}
    <Card padded>
      <Content>
        <h2>Looks like you are trying to...</h2>
        <h3>Note: only approve transactions from a trusted source</h3>
        {#each actions as action, i}
          {#if action.type === GenericTxSupportedActions.TRANSFER}
            <p>
              transfer <AmountFormatter
                bal={action.amount}
                {chain}
                tokenInfo={tokenInfos[i]}
              />
              to {recipientUserName}
            </p>
          {:else if action.type === GenericTxSupportedActions.TRANSFER_CONTRACT_TOKEN}
            {#if $ChainStores[chain].constants.supportedContractTokenContracts.includes(action.contractAddress)}
              <p>
                transfer <AmountFormatter
                  bal={action.amount}
                  {chain}
                  isNativeToken={false}
                  tokenInfo={tokenInfos[i]}
                /> to {recipientUserName} for contract
                {action.contractAddress}
              </p>
            {:else}
              An error occured, an unsupported contract token was passed in!
            {/if}
          {:else if action.type === GenericTxSupportedActions.TRANSFER_NFT}
            <p>
              Transfer {action.amount || 1}
              {action.tokenId} to {tx.recipientAddress} for contract {action.contractAddress}
            </p>
          {:else if action.type === GenericTxSupportedActions.CONTRACT_CALL}
            <p>
              Call action {action.functionName} for contract {txParams.recipientAddress}
              with parameters {JSON.stringify(action.functionArgs)}
            </p>
          {:else}
            An error occured, an unsupported action type was passed in!
          {/if}
        {/each}
      </Content>
      <Actions>
        <Button
          variant="raised"
          on:click={() => (!isLoading ? onApprove() : null)}>Approve</Button
        >
        <!-- TODO action -->
        <Button styleType="danger" on:click={onCancel}>Decline</Button>
      </Actions>
    </Card>
  {/if}
{:catch e}
  {#if e.toString() === 'not-logged-in'}
    Please login to approve or reject this transactiocofoundingn
  {:else}
    The following error occured: {e && console.error(e)}
  {/if}
{/await}
<div>
  {#if attemptedApprove}
    {#if isLoading}
      <p>Beep bop beep boop, trying to send your transaction</p>
      <Spinner {size} {speed} {color} {thickness} {gap} />
    {:else if error}
      <Icon class="material-icons">error</Icon>
    {:else}
      <p>Success!</p>
      <Icon class="material-icons">check</Icon>
      <span
        >Explorer: <a
          target="_blank"
          rel="noopener noreferrer"
          href={explorerUrl}>{explorerUrl}</a
        ></span
      >
    {/if}
  {/if}
</div>
