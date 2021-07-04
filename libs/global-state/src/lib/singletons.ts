/**
 * singletons provides methods to initialize and get the wrapped chain interfaces
 */
import { Chain, Env } from '@baf-wallet/interfaces';
import { BafError } from '@baf-wallet/errors';
import { ChainInitParams, getWrappedInterface } from '@baf-wallet/multi-chain';
import {
  NearChainInterface,
  getNearSupportedContractTokens,
  WrappedNearChainInterface,
} from '@baf-wallet/near';

let nearChain: WrappedNearChainInterface;
let init = false;

export async function initChains(chainParams: ChainInitParams, env: Env) {
  nearChain = await getWrappedInterface<NearChainInterface>(Chain.NEAR, {
    ...chainParams[Chain.NEAR],
  });
  init = true;
}

export function getNearChain(): WrappedNearChainInterface {
  if (!init) throw BafError.UninitChain(Chain.NEAR);
  return nearChain;
}
