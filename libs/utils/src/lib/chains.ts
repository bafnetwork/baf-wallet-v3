import { Chain } from '@baf-wallet/interfaces';
import { getEnumValues } from './types';

export const strToChain = (chain: string): Chain | null => {
  return getEnumValues(Chain).includes(chain.toLowerCase())
    ? (chain as Chain)
    : null;
};
