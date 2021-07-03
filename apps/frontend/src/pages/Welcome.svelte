
<script lang="ts">
	import Layout from '../components/Layout.svelte';
	import { getNearWalletAccount } from '../components/chains/near/wallet-connect';
	import { NearNetworkID } from '@baf-wallet/near';
  	import { signMsg } from '@baf-wallet/crypto';
	import { Encoding } from  '@baf-wallet/interfaces';
	import {
		getGlobalContract,
		setGlobalContract,
	} from '@baf-wallet/global-contract';
  	import { Account as NearAccount } from 'near-api-js';
	import { SiteKeyStore } from '../state/keys.svelte';
	import { AccountStore } from '../state/accounts.svelte';
	import { reinitApp } from '../state/init.svelte';
  	import { createUserVerifyMessage } from '@baf-wallet/utils';
	import Button from '@smui/button';
	import NearIcon from '@baf-wallet/base-components/NearIcon.svelte';
import { pop } from 'svelte-spa-router';

	export let networkID: NearNetworkID;

	async function connectNearAccount() {
		const account = await getNearWalletAccount(networkID);
		account.addKey($SiteKeyStore.edPK.format(Encoding.BS58))
		await setGlobalContractAccountInfo(account);
	}

	async function setGlobalContractAccountInfo(account: NearAccount) {
		await setGlobalContract(account);
		const currentAssociatedAccount = await getGlobalContract().getAccountId(
			$SiteKeyStore.secpPK
		);
		if (currentAssociatedAccount === account.accountId) {
			pop().then(reinitApp);
			return;
		}

		const nonce = await getGlobalContract().getAccountNonce($SiteKeyStore.secpPK);
		const userName = $AccountStore.oauthInfo.name;

		const msg = createUserVerifyMessage(userName, nonce);
		const secpSig = signMsg($SiteKeyStore.secpSK, msg, true);
		await getGlobalContract().setAccountInfo(
			$SiteKeyStore.secpPK,
			userName,
			secpSig,
			account.accountId
		);
		pop().then(reinitApp);
	}
  
</script>

<Layout>
	<div class="row center">
		<h1>Welcome to BAF Wallet!</h1>
	</div>
	<div class="row">
		<span>To get set up, you simply need to connect your Discord account to your Near Account. Currently, your Discord account wil have full access to the funds in the Near account you choose, so we reccomend choosing one that doesn't have a lot of funds in it. In a later version we will instead use a sub-account so this isn't a problem.</span>
	</div>
	<div class="row">
		<span>
			If you don't already have a NEAR wallet, create one now: <a href="https://wallet.near.org/" target="_blank">https://wallet.near.org/</a>
		</span>
	</div>
	<div class="row">
		<Button variant="outlined" on:click={connectNearAccount} >
			Connect your Discord account to your NEAR account.
		</Button>
	</div>
</Layout>

<style>
	.center {
		text-align: center;
	}

	.row {
		padding-top: 2rem;
		
	}
	

</style>
