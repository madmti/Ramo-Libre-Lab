<script lang="ts">
	import { db } from '$lib';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		db.preferences.applyTheme();
	});
</script>

{@render children()}
