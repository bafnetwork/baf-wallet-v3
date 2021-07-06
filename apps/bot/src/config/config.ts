import { keyPairFromSk, skFromString } from '@baf-wallet/crypto';
import { GlobalContractConfig } from '@baf-wallet/global-contract';
import { ed25519, ed25519Marker, Encoding } from '@baf-wallet/interfaces';
import {
  getNearNetworkID,
  getNearSupportedContractTokens,
  NearInitParams,
} from '@baf-wallet/near';
import { environment } from '../environments/environment';
import { BotSettings } from '../types';

export const settings: BotSettings = {
  presence: {
    activity: {
      name: 'Axie Infinity',
      type: 'PLAYING',
    },
  },
  prefix: '%',
};

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
  globalContractAddress: GlobalContractConfig.contractName,
};
