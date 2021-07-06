/**
 * singletons provides methods to initialize and get the wrapped chain interfaces
 */
import { Chain, Env } from '@baf-wallet/interfaces';
import { BafError } from '@baf-wallet/errors';
import {
  NearChainInterface,
  NearInitParams,
  getNearChainInterface,
} from '@baf-wallet/near';

let nearChain: NearChainInterface;
let init = false;

export async function initNearChain(params: NearInitParams, env: Env) {
  nearChain = await getNearChainInterface(params);
  init = true;
}

export function getNearChain(): NearChainInterface {
  if (!init) throw BafError.UninitChain(Chain.NEAR);
  return nearChain;
}
