/**
 * singletons provides methods to initialize and get the wrapped chain interfaces
 */
import { Chain } from '@baf-wallet/interfaces';
import { BafError } from '@baf-wallet/errors';
import { ChainInitParams, getWrappedInterface } from '@baf-wallet/multi-chain';
import {
  NearChainInterface,
  WrappedNearChainInterface,
} from '@baf-wallet/near';

let nearChain: WrappedNearChainInterface;
let init = false;
const supportedContractTokens = {
  near: ['ft.levtester.testnet'],
};

export async function initChains(chainParams: ChainInitParams) {
  nearChain = await getWrappedInterface<NearChainInterface>(Chain.NEAR, {
    ...chainParams[Chain.NEAR],
    supportedContractTokens: supportedContractTokens[Chain.NEAR],
  });
  init = true;
}

export function getNearChain(): WrappedNearChainInterface {
  if (!init) throw BafError.UninitChain(Chain.NEAR);
  return nearChain;
}
