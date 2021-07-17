import {
  getExplorerUrl,
  getHelperUrl,
  getRPCUrl,
  getWalletUrl,
} from '@baf-wallet/near';
import * as nearAPI from 'near-api-js';
import { WalletConnection } from 'near-api-js';
import { NearNetworkID } from '@baf-wallet/near';
const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();

interface GetNearWalletOpts {
  requestIfNotSignedIn?: boolean;
}

export async function getNearWalletAccount(
  network: NearNetworkID,
  opts: GetNearWalletOpts
): Promise<nearAPI.ConnectedWalletAccount | null> {
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
  else if (opts.requestIfNotSignedIn) {
    wallet.requestSignIn();
  } else {
    return null;
  }
  return wallet.account();
}
