import { Chain, ChainConstants } from '@baf-wallet/interfaces';
import { getTokenInfo } from '@baf-wallet/chain-info';
import thunky from 'thunky';
import { arrayToObject } from '@baf-wallet/utils';

export async function initChainConstants(
  chain: Chain,
  tokenContracts: string[]
): Promise<ChainConstants> {
  const tokens = tokenContracts.map((tokenContract) => {
    return {
      key: tokenContract,
      val: thunky(() => getTokenInfo(chain, tokenContract)),
    };
  });
  return {
    nativeTokenInfo: thunky(() => getTokenInfo(chain)),
    tokens: arrayToObject(tokens),
  };
}
