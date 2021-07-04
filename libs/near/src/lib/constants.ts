import { Env, TokenInfo } from '@baf-wallet/interfaces';
import { Chain, ChainConstants } from '@baf-wallet/interfaces';
import { getTokenInfo } from '@baf-wallet/chain-info';
import thunky from 'thunky/promise';
import { arrayToObject } from '@baf-wallet/utils';
import { Account } from 'near-api-js';
import {
  getContract,
  initContract,
  NearInitContractParams,
  NEP141Contract,
} from './contract';
import { NearState } from './near';

const bridgeContractsProd = [
  '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near',
  'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
  '1f9840a85d5af5bf1d1762f925bdaddc4201f984.factory.bridge.near',
  '514910771af9ca656af840dff83e8264ecf986ca.factory.bridge.near',
  'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
  '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near',
  '7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.factory.bridge.near',
  'a0b73e1ff0b80914ab6fe0444e65848c4c34450b.factory.bridge.near',
  '50d1c9771902476076ecfc8b2a83ad6b9355a4c9.factory.bridge.near',
  '4fabb145d64652a948d72533023f6e7a623c7c53.factory.bridge.near',
  '6f259637dcd74c767781e37bc6133cd6a68aa161.factory.bridge.near',
  '6b3595068778dd592e39a122f4f5a5cf09c90fe2.factory.bridge.near',
  'c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f.factory.bridge.near',
  'c944e90c64b2c07662a292be6244bdf05cda44a7.factory.bridge.near',
  '9f8f72aa9304c8b593d555f12ef6589cc3a579a2.factory.bridge.near',
  '0bc529c00c6401aef6d220be8c6ea1667f6ad93e.factory.bridge.near',
  'c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.factory.bridge.near',
  '0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near',
  '111111111117dc0aa78b770fa6a738034120c302.factory.bridge.near',
];

export const getNearSupportedContractTokens = (networkId: string) => {
  switch (networkId) {
    case 'mainnet':
      return ['berryclub.ek.near', 'wrap.near', ...bridgeContractsProd];
    case 'testnet':
    default:
      return ['ft.levtester.testnet', 'wrap.testnet'];
  }
};

export async function getChainConstants(
  nearState: NearState
): Promise<ChainConstants> {
  const tokenContracts = getNearSupportedContractTokens(nearState.networkID);
  const ft_metadatas = await Promise.all(
    tokenContracts.map((contractID) =>
      getContract<NEP141Contract, NearInitContractParams>(nearState, contractID)
        .init({
          viewMethods: ['ft_metadata'],
          changeMethods: [],
        })
        .then((contract) => contract.ft_metadata())
    )
  );
  const tokensContractMapping = tokenContracts.map((tokenContract, i) => {
    return {
      key: tokenContract,
      val: async (): Promise<TokenInfo> => {
        return {
          ...ft_metadatas[i],
          contractAddress: tokenContract,
          chain: Chain.NEAR,
          type: 'COIN',
        };
      },
    };
  });
  const tokens = tokenContracts.map((tokenContract, i) => {
    return {
      key: ft_metadatas[i].symbol,
      val: async (): Promise<TokenInfo> => {
        return {
          ...ft_metadatas[i],
          contractAddress: tokenContract,
          chain: Chain.NEAR,
          type: 'COIN',
        };
      },
    };
  });
  return {
    nativeTokenInfo: thunky(() => getTokenInfo(Chain.NEAR)),
    tokens: {
      ...arrayToObject(tokens),
      ...arrayToObject(tokensContractMapping),
    },
    supportedContractTokenContracts: tokenContracts,
  };
}
