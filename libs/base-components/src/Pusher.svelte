<script lang="ts">
	import { onMount } from 'svelte';
	import { push } from 'svelte-spa-router';

	export let route: string;

	onMount(() => push(route));
</script>

<div>...</div>