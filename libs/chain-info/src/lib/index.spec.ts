import { getTokenInfo } from './chain-info';
import { Chain } from '@baf-wallet/interfaces';
describe('getChainInfo', () => {
  it('retrieves correct values for ethereum', () =>
    getTokenInfo(Chain.NEAR).then((info) => {
      expect(info).not.toBeUndefined();
      expect(info).not.toBeNull();
      expect(info.name).toBe('NEAR Protocol');
      expect(info.website).toBe('https://near.org');
      expect(info.source_code).toBe('https://github.com/nearprotocol/nearcore');
      expect(info.white_paper).toBe(
        'https://near.org/papers/the-official-near-white-paper'
      );
      expect(info.description).toBe(
        'NEAR is an open source platform that accelerates the development of decentralized applications.'
      );
      expect(info.socials).toEqual([
        {
          name: 'Twitter',
          url: 'https://twitter.com/nearprotocol',
          handle: 'nearprotocol',
        },
        {
          name: 'Reddit',
          url: 'https://www.reddit.com/r/nearprotocol/',
          handle: 'nearprotocol',
        },
      ]);
      expect(info.explorer).toBe('https://explorer.near.org/');

      // make sure binance shill was removed
      expect((info as any).research).toBeUndefined();
      expect(info.symbol).toBe('NEAR');
      expect(info.type).toBe('COIN');
      expect(info.decimals).toBe(24);
      expect(info.status).toBe('active');
    }));
});
