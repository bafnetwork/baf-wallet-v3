import { ChainConstants, Env } from '@baf-wallet/interfaces';

export function getNearConstants(env: Env): ChainConstants {
  if (env === Env.PROD) {
    return {
      nativeTokenSymbol: 'NEAR',
      tokens: [],
    };
  } else {
    return {
      nativeTokenSymbol: 'NEAR',
      tokens: [
        // TODO: this can be loaded in from the assets class within the initialization of the Near chain
        {
          contractAddress: 'ft.levtester.testnet',
          tokenSymbol: 'LEV',
          decimals: 8,
        },
      ],
    };
  }
}
