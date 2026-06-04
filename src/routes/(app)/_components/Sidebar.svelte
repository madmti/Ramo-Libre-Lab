<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { VERSION } from '$lib/utils/version';
	import { decodeUrlData, encodeUrlData } from '$lib/utils/url_data';
	import type { Simulacion } from '$lib/state/simulaciones.svelte';
	import { db } from '$lib/state/index.svelte';
	import { onMount } from 'svelte';
	import { Link2, FolderOpen, Settings } from '@lucide/svelte';
	import Datos from './Datos.svelte';
	import Apariencia from './Apariencia.svelte';
	import Entornos from './Entornos.svelte';

	let activeTab = $state<'entornos' | 'config'>('entornos');

	onMount(() => {
		const url = new URL(window.location.href);
		const payload = url.searchParams.get('share');
		if (!payload) return;
		try {
			const shared = decodeUrlData<Simulacion>(payload);
			if (shared && shared.id) {
				db.simulaciones.loadActual(shared);
			}
		} catch (error) {
			console.warn('Sidebar: invalid share payload', error);
		}
	});

	function handleShareLink() {
		const url = new URL(window.location.href);
		const payload = encodeUrlData(db.simulaciones.actual);
		url.searchParams.set('share', payload);

		navigator.clipboard.writeText(url.toString()).then(() => {
			alert('¡Enlace del entorno copiado al portapapeles!');
		});
	}
</script>

<div
	class="box-border flex h-screen max-h-screen w-85 flex-col gap-5 overflow-hidden p-6 select-none"
>
	<div class="flex shrink-0 flex-col gap-4 rounded-xl border border-base-400 bg-base-200 p-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2.5">
				<img src={favicon} alt="Logo" class="h-6 w-6" />
				<h2 class="text-base font-bold tracking-normal text-content">
					RamoLibre <span class="font-extrabold text-primary-100">LAB</span>
				</h2>
			</div>
			<span
				class="rounded-md border border-base-400 bg-base-300 px-2 py-0.5 font-mono text-[11px] font-semibold text-content opacity-70"
			>
				{VERSION}
			</span>
		</div>

		<div class="flex gap-1 rounded-lg bg-base-300 p-1 text-sm font-medium">
			<button
				onclick={() => (activeTab = 'entornos')}
				class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md py-2 text-center transition-all duration-150
                {activeTab === 'entornos'
					? 'bg-base-100 font-semibold text-content shadow-sm'
					: 'text-content opacity-60 hover:opacity-100'}"
			>
				<FolderOpen size={16} /> Entornos
			</button>
			<button
				onclick={() => (activeTab = 'config')}
				class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md py-2 text-center transition-all duration-150
                {activeTab === 'config'
					? 'bg-base-100 font-semibold text-content shadow-sm'
					: 'text-content opacity-60 hover:opacity-100'}"
			>
				<Settings size={16} /> Config
			</button>
		</div>

		<button
			onclick={handleShareLink}
			class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary-100 p-2.5 text-center text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99]"
		>
			<Link2 size={15} /> Compartir Actual
		</button>
	</div>

	{#if activeTab === 'entornos'}
		<Entornos />
	{:else if activeTab === 'config'}
		<div class="flex min-h-0 flex-1 scrollbar-thin flex-col gap-4 overflow-y-auto pr-1">
			<Apariencia />
			<Datos />
		</div>
	{/if}
</div>
