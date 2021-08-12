import { LOGIN_TYPE } from '@toruslabs/torus-direct-web-sdk';

type VerifierInfo = {
  [login_type in LOGIN_TYPE]?: {
    verifier: string;
    clientId: string;
  };
};
export const torusConstants = {
  network: 'ropsten',
  proxyAddress: '0x4023d2a0D330bF11426B12C6144Cfb96B7fa6183',
  verifierInfo: {
    discord: {
      verifier: process.env.TORUS_VERIFIER_NAME,
      clientId: process.env.DISCORD_CLIENT_ID,
    },
  } as VerifierInfo,
};

export type TORUS_LOGIN_TYPE = LOGIN_TYPE;
