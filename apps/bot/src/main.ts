import 'reflect-metadata';
import { environment } from './environments/environment';
import { Container } from 'typedi';
import { Client } from './Client';
import { getNearChain, initNearChain } from '@baf-wallet/global-state';
import { constants } from './config/config';
import { setGlobalContract } from '@baf-wallet/global-contract';
import { Chain } from '@baf-wallet/interfaces';

// Initialize the Client using the IoC.

async function main() {
  await initNearChain(constants.chainParams[Chain.NEAR], constants.env);
  const client = Container.get<Client>(Client);
  await setGlobalContract(getNearChain().accounts.masterAccount);
  await client.login(environment.DISCORD_BOT_TOKEN);
  console.log('tokenbot happily hodling along');
}

main();
