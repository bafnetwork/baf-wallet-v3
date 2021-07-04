import {
  Chain,
  ChainInterface,
  CommonInitParams,
  ed25519,
  Encoding,
  InferChainInterface,
  InferWrapChainInterface,
  KeyPair,
  RpcInterface,
  TxInterface,
} from '@baf-wallet/interfaces';
import {
  Account,
  connect,
  ConnectConfig,
  KeyPair as NearKeyPair,
  Near,
  providers,
  transactions,
  utils as NearUtils,
} from 'near-api-js';

import { NearBuildTxParams, NearSignTxOpts, nearTx } from './tx';
import {
  initContract,
  NearInitContractParams,
  NEP141Contract,
} from './contract';
import {
  getHelperUrl,
  getRPCUrl,
  nearRpc,
  NearSendOpts,
  NearSendResult,
} from './rpc';
import {
  NearAccountID,
  nearAccounts,
  NearCreateAccountParams,
} from './accounts';
import { nearConverter } from './convert';
import { NearNetworkID } from './utils';
import { InMemoryKeyStore } from 'near-api-js/lib/key_stores';
import { KeyPairEd25519 as NearKeyPairEd25519 } from 'near-api-js/lib/utils';
import { BafError } from '@baf-wallet/errors';
import { contracts } from './contract';
import { constants } from './constants';

export type { NearAccountID, NearCreateAccountParams } from './accounts';
export type {
  NearTransaction,
  NearBuildTxParams,
  NearAction,
  NearSupportedActionTypes,
} from './tx';

export interface NearState {
  near: Near;
  rpcProvider: providers.JsonRpcProvider;
  networkID: NearNetworkID;
  nearMasterAccount: Account;
  getFungibleTokenContract: (contractName: string) => Promise<NEP141Contract>;
}

export const nearChainInterface = {
  accounts: nearAccounts,
  tx: nearTx,
  convert: nearConverter,
  rpc: nearRpc,
  init,
  contracts,
  constants
};

type _NearChainInterface = typeof nearChainInterface;
export type NearChainInterface = InferChainInterface<_NearChainInterface>
export type WrappedNearChainInterface = InferWrapChainInterface<_NearChainInterface>

export interface NearInitParams extends CommonInitParams {
  networkID: NearNetworkID;
  masterAccountID: NearAccountID;
  keyPath?: string;
  keyPair?: KeyPair<ed25519>;
}

async function init({
  networkID,
  masterAccountID,
  keyPath,
  keyPair,
}: NearInitParams): Promise<NearState> {
  const nodeUrl = getRPCUrl(networkID);
  const connectConfig = {
    networkId: networkID,
    nodeUrl,
    helperUrl: getHelperUrl(networkID),
    masterAccount: masterAccountID,
    keyPath,
  } as ConnectConfig;
  if (keyPair) {
    const keyStore = new InMemoryKeyStore();
    const nearKp = new NearKeyPairEd25519(
      keyPair.sk.format(Encoding.BS58) as string
    );
    keyStore.setKey(networkID, masterAccountID, nearKp);
    connectConfig.deps = {
      keyStore: keyStore,
    };
    connectConfig.keyStore = keyStore;
  } else if (keyPath) {
    const keyStore = new InMemoryKeyStore();
    connectConfig.deps = {
      keyStore: keyStore,
    };
  } else {
    throw BafError.MissingKeyPair();
  }

  const near = await connect(connectConfig);

  const nearMasterAccount = await near.account(masterAccountID);
  return {
    near,
    networkID,
    rpcProvider: new providers.JsonRpcProvider(nodeUrl),
    nearMasterAccount,
    getFungibleTokenContract: (contractAccountID: string) =>
      initContract(
        nearMasterAccount,
        contractAccountID
      )({
        viewMethods: ['ft_balance_of', 'ft_total_supply', 'storage_balance_of'],
        changeMethods: ['ft_transfer'],
      }),
  };
}
