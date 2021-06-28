import {
  getExplorerUrl,
  getHelperUrl,
  getRPCUrl,
  getWalletUrl,
} from 'libs/near/src/lib/rpc';
import * as nearAPI from 'near-api-js';
import { Account, WalletConnection } from 'near-api-js';
import { NearNetworkID } from '../lib/utils';
const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();

export async function getNearWalletAccount(network: NearNetworkID) {
  const { connect } = nearAPI;

  const config = {
    networkId: 'testnet',
    keyStore,
    nodeUrl: getRPCUrl(network),
    walletUrl: getWalletUrl(network),
    helperUrl: getHelperUrl(network),
    explorerUrl: getExplorerUrl(network),
  };
  const near = await connect(config);
  const wallet = new WalletConnection(near, 'Baf Wallet');
  if (wallet.isSignedIn()) console.log('signed in');
  else {
    wallet.requestSignIn();
  }
  return wallet.account();
}
