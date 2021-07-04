import { globalContract } from './global-contract';

describe('globalContract', () => {
  it('should work', () => {
    expect(globalContract()).toEqual('global-contract');
  });
});
