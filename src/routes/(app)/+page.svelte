<script lang="ts">
	import { Play, BookOpen } from '@lucide/svelte';
	import Calculos from './_components/Calculos.svelte';
	import Dominios from './_components/Dominios.svelte';
	import Estado from './_components/Estado.svelte';
	import Header from './_components/Header.svelte';
	import Info from './_components/Info.svelte';
	import Sistema from './_components/Sistema.svelte';
	import Variables from './_components/Variables.svelte';

	let activeTab = $state<'simular' | 'ayuda'>('simular');
</script>

<Header />

<div class="my-4 flex w-full max-w-sm justify-between">
	<div class="flex flex-1 gap-1 rounded-lg bg-base-300 p-1 text-sm font-medium">
		<button
			onclick={() => (activeTab = 'simular')}
			class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md py-2 text-center transition-all duration-150
            {activeTab === 'simular'
				? 'bg-base-100 font-semibold text-content shadow-sm'
				: 'text-content opacity-60 hover:opacity-100'}"
		>
			<Play size={16} /> Playground
		</button>
		<button
			onclick={() => (activeTab = 'ayuda')}
			class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md py-2 text-center transition-all duration-150
            {activeTab === 'ayuda'
				? 'bg-base-100 font-semibold text-content shadow-sm'
				: 'text-content opacity-60 hover:opacity-100'}"
		>
			<BookOpen size={16} /> Sintaxis
		</button>
	</div>
	<span> </span>
</div>

{#if activeTab === 'simular'}
	<div class="animate-fade-in mb-20 flex flex-col gap-4 xl:grid xl:grid-cols-12 xl:items-start">
		<div class="contents xl:col-span-8 xl:flex xl:flex-col xl:gap-4">
			<div class="order-4 xl:order-0">
				<Sistema />
			</div>
			<div class="order-2 xl:order-0">
				<Variables />
			</div>
		</div>

		<div class="contents xl:col-span-4 xl:flex xl:flex-col xl:gap-4">
			<div class="order-1 xl:order-0">
				<Estado />
			</div>
			<div class="order-5 xl:order-0">
				<Dominios />
			</div>
			<div class="order-3 xl:order-0">
				<Calculos />
			</div>
		</div>
	</div>
{:else}
	<div class="animate-fade-in mb-20">
		<Info />
	</div>
{/if}

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in {
		animation: fadeIn 0.18s ease-out forwards;
	}
</style>
