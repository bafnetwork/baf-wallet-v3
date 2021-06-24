import 'reflect-metadata';
import { environment } from './environments/environment';
import { Container } from 'typedi';
import { Client } from './Client';
import { getNearChain, initChains } from '@baf-wallet/global-state';
import { constants } from './config/config';
import { setCommunityContract } from '@baf-wallet/community-contract';
import { setGlobalContract } from '@baf-wallet/global-contract';
import { getWrappedInterface } from '@baf-wallet/multi-chain';

// Initialize the Client using the IoC.
const client = Container.get<Client>(Client);

async function main() {
  await initChains(constants.chainParams);
  await setGlobalContract(await getNearChain().getInner().nearMasterAccount);
  await setCommunityContract(await getNearChain().getInner().nearMasterAccount);
  await client.login(environment.DISCORD_BOT_TOKEN);
  console.log('tokenbot happily hodling along');
}

main();
