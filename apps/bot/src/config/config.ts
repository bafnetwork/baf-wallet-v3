import { keyPairFromSk, skFromString } from '@baf-wallet/crypto';
import { ed25519, ed25519Marker, Encoding } from '@baf-wallet/interfaces';
import { getNearNetworkID, NearInitParams } from '@baf-wallet/near';
import { environment } from '../environments/environment';
import { BotSettings } from '../types';

export const settings: BotSettings = {
  presence: {
    activity: {
      name: 'Demon Slayer',
      type: 'WATCHING',
    },
  },
  prefix: '%%',
};

export const constants = {
  chainParams: {
    near: {
      keyPair: keyPairFromSk<ed25519>(
        skFromString(process.env.NEAR_SK, ed25519Marker, Encoding.BS58)
      ),
      networkID: getNearNetworkID(environment.env),
      masterAccountID: process.env.NEAR_MASTER_ACCOUNT_ID,
    } as NearInitParams,
  },
};
