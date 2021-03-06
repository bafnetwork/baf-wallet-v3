import { ed25519, ed25519Marker, Encoding, Env } from '@baf-wallet/interfaces';
import { keyPairFromSk, skFromString } from '@baf-wallet/crypto';
import {
  NearInitParams,
  getNearNetworkID,
  getNearSupportedContractTokens,
} from '@baf-wallet/near';
import { environment, initDotEnv } from '../../environments/environment';

initDotEnv();

export const constants = {
  env: environment.env,
  chainParams: {
    near: {
      keyPair: keyPairFromSk<ed25519>(
        skFromString(process.env.NEAR_SK, ed25519Marker, Encoding.BS58)
      ),
      networkID: getNearNetworkID(environment.env),
      masterAccountID: process.env.NEAR_MASTER_ACCOUNT_ID,
    } as NearInitParams,
  },
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
  },
  torus: {
    verifierName: 'discord',
    network: environment.env === Env.PROD ? 'mainnet' : 'testnet',
    proxyAddress: process.env.TORUS_PROXY_ADDRESS,
  },
};
