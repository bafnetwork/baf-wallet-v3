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
    network: process.env.TORUS_NETWORK ?? "testnet", 
    discord: {
      verifier: process.env.TORUS_VERIFIER_NAME,
      clientId: process.env.DISCORD_CLIENT_ID,
    },
  },
};
