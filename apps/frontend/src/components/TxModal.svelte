<script lang="ts">
  import ApproveRedirect from './ApproveRedirect.svelte';

  import { getContext } from 'svelte';
  import { Chain } from '@baf-wallet/interfaces';
  import { TokenInfo } from '@baf-wallet/interfaces';
  const { close } = getContext('modal');

  export let chain: Chain,
    txParams: any,
    recipientUser: string,
    tokenInfo: TokenInfo;
</script>

<ApproveRedirect
  nativeParams={txParams}
  tokenInfos={[tokenInfo]}
  txInUrlAndGeneric={false}
  {recipientUser}
  {chain}
  onCancel={close}
/>
