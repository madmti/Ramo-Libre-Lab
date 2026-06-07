<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import { parseScript } from '$lib/utils/compiler';
	import type { DomainStatement } from '$lib/utils/compiler';
	import { Trash2 } from '@lucide/svelte';

	let statements = $derived(parseScript(db.simulaciones.actual.scriptRaw));
	let lineasDominios = $derived(
		statements.filter((s): s is DomainStatement => s.type === 'domain')
	);

	function handleRemoveDominio(rawLineToRemove: string) {
		const newRaw = db.simulaciones.actual.scriptRaw
			.split('\n')
			.filter((l) => l.trim() !== rawLineToRemove)
			.join('\n');
		db.simulaciones.updateActual({ scriptRaw: newRaw });
	}
</script>

<div class="flex flex-col gap-4 rounded-xl border border-base-400 bg-base-200 p-5 shadow-sm">
	<h3 class="text-xs font-bold tracking-wide text-content uppercase opacity-60">Dominios</h3>
	<div class="flex flex-col gap-2">
		{#each lineasDominios as dom (dom.raw)}
			{@const isDecimal = !Number.isInteger(dom.min) || !Number.isInteger(dom.max)}
			<div
				class="flex items-center justify-between rounded-lg border border-dashed border-base-400 bg-base-100/50 p-3"
			>
				<div class="flex flex-col gap-0.5">
					{#if dom.label}
						<span class="font-mono text-[10px] font-semibold text-primary-100">{dom.label}</span>
					{/if}
					<span class="font-mono text-xs text-content">
						{dom.variables.join(', ')}
						<span class="font-bold text-primary-100">∈</span>
						[{dom.min}, {dom.max}]
					</span>
					{#if isDecimal}
						<span class="font-mono text-[9px] text-content/40">paso: 0.1</span>
					{/if}
				</div>
				<button
					onclick={() => handleRemoveDominio(dom.raw)}
					class="cursor-pointer text-xs text-error-100 opacity-60 transition-opacity hover:opacity-100"
					title="Eliminar dominio"
					aria-label="Eliminar dominio"
				>
					<Trash2 size={14} />
				</button>
			</div>
		{:else}
			<div class="py-2 text-center font-mono text-xs text-content/40">
				Sin dominios (Por defecto [0, 100])
			</div>
		{/each}
	</div>
</div>
