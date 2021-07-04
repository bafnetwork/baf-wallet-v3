import { Chain } from '@baf-wallet/interfaces';
import { getEnumValues } from './types';
import { BafError } from '@baf-wallet/errors';
import BN from 'bn.js';

export const strToChain = (chain: string): Chain | null => {
  return getEnumValues(Chain).includes(chain.toLowerCase())
    ? (chain as Chain)
    : null;
};

export function formatTokenAmountToIndivisibleUnit(
  amount: number,
  decimals: number
): string {
  const expStr = `${1}${new Array(decimals).fill('0').join('')}`;
  const exp = new BN(expStr);
  console.log(exp.muln(amount), amount);
  return exp.muln(amount).toString(10);
}
