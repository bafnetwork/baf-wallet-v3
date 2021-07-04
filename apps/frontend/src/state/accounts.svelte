<script lang="ts" context="module">
  import { writable } from 'svelte/store';
  import { ChainsState, initChains } from './chains.svelte';
  import { clearKeysFromStorage, loadKeys, SiteKeyStore } from './keys.svelte';
  import { AccountState, KeyState, OAuthState } from '@baf-wallet/interfaces';
  export const AccountStore = writable<AccountState | null>(null);
  const oauthInfoStoreName = 'oauthInfo';

  interface InitAccountRet {
    accountState: AccountState;
    chainsState: ChainsState | null;
    keys: KeyState | null;
  }

  export function logout() {
    SiteKeyStore.set(null);
    clearKeysFromStorage();
    AccountStore.update((AccountStore) => {
      return {
        ...AccountStore,
        loggedIn: false,
      };
    });
  }

  export function getTorusAccessToken() {
    return window.localStorage.getItem('accessToken');
  }

  export function storeTorusAccessToken(accessToken: string) {
    window.localStorage.setItem('accessToken', accessToken);
  }

  export async function initAccount(): Promise<InitAccountRet> {
    const keys = loadKeys();
    const loggedIn = loadKeys() !== null;
    const chainsState = keys ? await initChains(keys) : null;
    const accountState: AccountState = {
      loggedIn,
      oauthInfo: !loggedIn
        ? null
        : JSON.parse(window.localStorage.getItem(oauthInfoStoreName)),
    };
    AccountStore.set(accountState);
    return { accountState, chainsState, keys };
  }

  export function storeOauthState(oauthInfo: OAuthState) {
    window.localStorage.setItem(oauthInfoStoreName, JSON.stringify(oauthInfo));
  }
  export function getOauthState(): OAuthState | null {
    const cookieStr = window.localStorage.getItem(oauthInfoStoreName);
    if (!JSON.parse(cookieStr)) return null;
    return JSON.parse(cookieStr) as OAuthState;
  }
</script>
