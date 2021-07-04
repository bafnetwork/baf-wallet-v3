import {
  Chain,
  GenericTxAction,
  GenericTxParams,
  GenericTxSupportedActions,
} from '@baf-wallet/interfaces';
import { createApproveRedirectURL } from './redirect-generator';
import * as fs from 'fs';
import { join } from 'path';

describe('frontend', () => {
  it('Create a url to send 100 yoctoNEAR to lev_s#7844', () => {
    const sendURL = createApproveRedirectURL(
      Chain.NEAR,
      'http://localhost:8080',
      {
        actions: [
          {
            type: GenericTxSupportedActions.TRANSFER,
            amount: '1000000000000000000000',
          },
        ],
        oauthProvider: 'discord',
      }
    );
    console.log(sendURL);
  });
  it('Create a url for changing the default NFT contract', () => {
    const url = createApproveRedirectURL(Chain.NEAR, 'http://localhost:8080', {
      // TODO: add an option for if recipientUserId is a TorusTarget or not
      recipientAddress: 'asas',
      actions: [
        {
          type: GenericTxSupportedActions.CONTRACT_CALL,
          functionName: 'set_community_default_nft_contract',
          functionArgs: {
            nft_contract: 'nft.levtester.near',
            guild_id: '',
          },
          deposit: '1',
        },
      ],
      oauthProvider: 'discord',
    } as GenericTxParams);
    console.log('Change NFT Contract', url);
  });
  // TODO: nft Addresses
  it('Create a url to send a test NFT (NEP171) to sladuca#4629', () => {
    const sendURL = createApproveRedirectURL(
      Chain.NEAR,
      'http://localhost:8080',
      {
        recipientUserId: '216732707449733120',
        actions: [
          {
            type: GenericTxSupportedActions.TRANSFER_NFT,
            tokenId: 'coolbeans',
            contractAddress: 'AASAS', //nftAddress.toString(),
            memo: 'This is cool',
          },
        ],
        oauthProvider: 'discord',
      }
    );
    console.log('NFT send url', sendURL);
  });
  it('Create a url to send 100 yoctoFt.levtester to sladuca#4629', () => {
    const sendURL = createApproveRedirectURL(
      Chain.NEAR,
      'http://localhost:8080',
      {
        recipientUserId: '216732707449733120',
        actions: [
          {
            type: GenericTxSupportedActions.TRANSFER_CONTRACT_TOKEN,
            amount: '10000',
            contractAddress: 'ft.levtester.testnet',
            // memo: 'This is cool'
          },
        ],
        oauthProvider: 'discord',
      }
    );
    console.log(sendURL);
  });
});
