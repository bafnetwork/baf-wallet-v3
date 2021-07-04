import { Env } from '@baf-wallet/interfaces';
import { environment } from '../environments/environment';
import { TORUS_NETWORK_TYPE } from '@toruslabs/torus-direct-web-sdk';
import { NearNetworkID } from '@baf-wallet/near';

export const constants = {
  env: environment.env,
  baseUrl: environment.baseUrl,
  basePathApi: environment.basePathApi,
  near: {
    network: NearNetworkID.TESTNET,
  },
  torus: {
    // TODO: have a unifying function for environment
    network: (environment.env === Env.PROD
      ? 'mainnet'
      : 'testnet') as TORUS_NETWORK_TYPE,
    discord: {
      verifier: 'baf wallet-discord-testnet',
      clientId: '821890148198776874',
    },
  },
};
