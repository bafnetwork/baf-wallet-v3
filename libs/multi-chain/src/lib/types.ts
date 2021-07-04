import {
  Chain,
  ChainInterface,
  GenericTxParams,
  WrappedChainInterface,
} from '@baf-wallet/interfaces';
import {
  NearBuildTxParams,
  NearChainInterface,
  NearInitParams,
  WrappedNearChainInterface,
} from '@baf-wallet/near';

export type AllBuildTxParams = GenericTxParams | NearBuildTxParams;

export interface ChainInitParams {
  near: NearInitParams;
}

export type AllChainInterface =
  | NearChainInterface
  | ChainInterface<
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any
    >;
export type AllWrappedChainInterface =
  | WrappedNearChainInterface
  | WrappedChainInterface<
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any,
      any
    >;
