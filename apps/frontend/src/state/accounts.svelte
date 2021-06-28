<script lang="ts" context="module">
  import { writable } from 'svelte/store';
  import { ChainsState, initChains } from './chains.svelte';
  import { clearKeysFromStorage, loadKeys, siteKeyStore } from './keys.svelte';
  import { AccountState, Encoding, OAuthState } from '@baf-wallet/interfaces';

  export const accountStore = writable<AccountState | null>(null);
  const oauthInfoStoreName = 'oauthInfo';

  export function logout() {
    siteKeyStore.set(null);
    clearKeysFromStorage();
    accountStore.update((accountStore) => {
      return {
        ...accountStore,
        loggedIn: false,
      };
    });
  }

  export function storeTorusAccessToken(accessToken: string) {
    window.localStorage.setItem('accessToken', accessToken);
  }

  export async function initAccountState(): Promise<{
    accountState: AccountState;
    chainsState: ChainsState | null;
  }> {
    const keys = loadKeys();
    const loggedIn = loadKeys() !== null;
    const chainsState = keys ? await initChains(keys) : null;
    const accountState: AccountState = {
      loggedIn,
      oauthInfo: !loggedIn
        ? null
        : JSON.parse(window.localStorage.getItem(oauthInfoStoreName)),
    };
    accountStore.set(accountState);
    return { accountState, chainsState };
  }

  export function storeOauthState(oauthInfo: OAuthState) {
    window.localStorage.setItem(oauthInfoStoreName, JSON.stringify(oauthInfo));
  }
</script>
