import { Env } from '@baf-wallet/interfaces';
import * as dotenv from 'dotenv';

if (!process.env.NON_LOCAL) dotenv.config({ path: './env/.env.dev' });

export const environment = {
  production: false,
  apiUrl: 'localhost:',
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  BASE_WALLET_URL: process.env.BASE_WALLET_URL ?? 'https://localhost:4200',
  env: Env.DEV,
};
