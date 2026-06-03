<script lang="ts">
	import { db } from '$lib';
	import { onMount } from 'svelte';
	import Sidebar from './_components/Sidebar.svelte';

	let { children } = $props();

	onMount(() => {
		db.preferences.applyTheme();
	});
</script>

<div class="grid h-screen w-screen grid-cols-[340px_1fr] overflow-hidden">
	<Sidebar />
	<main class="h-screen overflow-y-auto p-8">
		{@render children()}
	</main>
</div>
