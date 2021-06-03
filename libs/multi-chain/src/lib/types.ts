import { GenericTxParams } from '@baf-wallet/interfaces';
import { NearBuildTxParams, NearInitParams } from '@baf-wallet/near';

export type AllBuildTxParams = GenericTxParams | NearBuildTxParams;

export interface ChainInitParams {
  near: NearInitParams;
}
