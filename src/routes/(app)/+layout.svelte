<script lang="ts">
	import { db } from '$lib';
	import { onMount } from 'svelte';
	import Sidebar from './_components/Sidebar.svelte';
	import { Menu, X } from '@lucide/svelte';

	let { children } = $props();

	// Runa para controlar el estado del menú en móviles
	let isMobileMenuOpen = $state(false);

	onMount(() => {
		db.preferences.applyTheme();
	});
</script>

<div class="relative flex h-screen w-screen overflow-hidden md:grid md:grid-cols-[340px_1fr]">
	<button
		onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
		class="border-base-400/20 bg-primary-100 fixed right-5 bottom-5 z-50 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border text-white shadow-lg transition-transform active:scale-95 md:hidden"
	>
		{#if isMobileMenuOpen}
			<X size={20} />
		{:else}
			<Menu size={20} />
		{/if}
	</button>

	{#if isMobileMenuOpen}
		<div
			onclick={() => (isMobileMenuOpen = false)}
			onkeydown={(e) => e.key === 'Escape' && (isMobileMenuOpen = false)}
			role="presentation"
			class="bg-base-400/40 fixed inset-0 z-40 backdrop-blur-sm transition-opacity md:hidden"
		></div>
	{/if}

	<div
		class="fixed inset-y-0 left-0 z-45 flex h-full transform transition-transform duration-300 ease-in-out md:static md:translate-x-0
        {isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}"
	>
		<Sidebar onSelect={() => (isMobileMenuOpen = false)} />
	</div>

	<main class="h-screen w-full overflow-y-auto p-6">
		{@render children()}
	</main>
</div>
