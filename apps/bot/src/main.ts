import 'reflect-metadata';
import { environment } from './environments/environment';
import { Container } from 'typedi';
import { Client } from './Client';
import { initChains } from '@baf-wallet/global-state';
import { constants } from './config/config';

// Initialize the Client using the IoC.
const client = Container.get<Client>(Client);

async function main() {
  await initChains(constants.chainParams);
  await client.login(environment.DISCORD_BOT_TOKEN);
  console.log('tokenbot happily hodling along');
}

main();
