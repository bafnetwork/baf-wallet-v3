import { Env } from '@baf-wallet/interfaces';

export const environment = {
  production: false,
  env: Env.TEST,
  baseUrl: process.env.BASE_URL
    ? process.env.BASE_URL
    : 'https://baf-wallet.netlify.app',
  basePathApi: 'https://baf-wallet-testnet.herokuapp.com',
};
