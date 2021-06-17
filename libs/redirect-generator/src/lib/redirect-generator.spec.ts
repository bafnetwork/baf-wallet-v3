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
        recipientUserIdReadable: 'lev_s#7844',
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
    const nftAddress = require('../../../community-contract/config.json')
      .contractName;
    const url = createApproveRedirectURL(Chain.NEAR, 'http://localhost:8080', {
      // TODO: add an option for if recipientUserId is a TorusTarget or not
      recipientAddress: nftAddress.toString(),
      recipientUserIdReadable: 'Community Contract',
      actions: [
        {
          type: GenericTxSupportedActions.CONTRACT_CALL,
          functionName: 'set_default_nft_contract',
          functionArgs: {
            nft_contract: 'nft.levtester.near',
          },
          deposit: '1',
        },
      ],
      oauthProvider: 'discord',
    } as GenericTxParams);
    console.log('Change NFT Contract', url);
  });
  it('Create a url to send a test NFT (NEP171) to sladuca#4629', () => {
    const nftAddress = require('../../../community-contract/config.json')
      .contractName;
    const sendURL = createApproveRedirectURL(
      Chain.NEAR,
      'http://localhost:8080',
      {
        recipientUserId: '216732707449733120',
        recipientUserIdReadable: 'sladuca#4629',
        actions: [
          {
            type: GenericTxSupportedActions.TRANSFER_NFT,
            tokenId: 'coolbeans',
            contractAddress: nftAddress.toString(),
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
        recipientUserIdReadable: 'sladuca#4629',
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
