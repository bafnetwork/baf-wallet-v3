<script lang="ts">
  import { link } from 'svelte-spa-router';
  import Button from '@smui/button';
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
  import IconButton from '@smui/icon-button';
  import { AccountStore, logout } from '../state/accounts.svelte';

  let prominent = false;
  let dense = false;
  let secondaryColor = false;
</script>

{#if $AccountStore.loggedIn}
  <TopAppBar
    variant="static"
    {prominent}
    {dense}
    color={secondaryColor ? 'secondary' : 'primary'}
  >
    <Row>
      <Section align="end" toolbar>
        <a href="/settings" use:link>
          <IconButton class="material-icons" aria-label="Account Page">
            account_circle
          </IconButton>
        </a>
        <Button color="secondary" on:click={logout} variant="raised"
          >Logout</Button
        >
      </Section>
    </Row>
  </TopAppBar>
{:else}
  <div />
{/if}

<style>
  a {
    color: inherit;
    text-decoration: none;
  }
</style>
