<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import { parseScript } from '@ramo-libre/dsl-parser';
	import type { DomainStatement } from '@ramo-libre/dsl-parser';
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

<div class="border-base-400 bg-base-200 flex flex-col gap-4 rounded-xl border p-5 shadow-sm">
	<h3 class="text-content text-xs font-bold tracking-wide uppercase opacity-60">Dominios</h3>
	<div class="flex flex-col gap-2">
		{#each lineasDominios as dom (dom.raw)}
			{@const isDecimal = !Number.isInteger(dom.min) || !Number.isInteger(dom.max)}
			<div
				class="border-base-400 bg-base-100/50 flex items-center justify-between rounded-lg border border-dashed p-3"
			>
				<div class="flex flex-col gap-0.5">
					{#if dom.label}
						<span class="text-primary-100 font-mono text-[10px] font-semibold">{dom.label}</span>
					{/if}
					<span class="text-content font-mono text-xs">
						{dom.variables.join(', ')}
						<span class="text-primary-100 font-bold">∈</span>
						[{dom.min}, {dom.max}]
					</span>
					{#if isDecimal}
						<span class="text-content/40 font-mono text-[9px]">paso: 0.1</span>
					{/if}
				</div>
				<button
					onclick={() => handleRemoveDominio(dom.raw)}
					class="text-error-100 cursor-pointer text-xs opacity-60 transition-opacity hover:opacity-100"
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
