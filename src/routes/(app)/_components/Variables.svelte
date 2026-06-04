<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import { parseScript, extractFreeVariables, extractDomains, clamp } from '$lib/utils/compiler';

	type Precision = { label: string; step: number };
	const PRECISIONS: Precision[] = [
		// { label: '×10', step: 10 },
		{ label: '×1', step: 1 },
		{ label: '×0.1', step: 0.1 },
		{ label: '×0.01', step: 0.01 }
	];
	let precisionIdx = $state(1); // por defecto ×0.1
	let step = $derived(PRECISIONS[precisionIdx].step);

	let statements = $derived(parseScript(db.simulaciones.actual.scriptRaw));
	let variables = $derived(db.simulaciones.actual.variables);
	let libres = $derived(extractFreeVariables(statements));
	let mapaDominios = $derived(extractDomains(statements));

	function effectiveValue(varName: string, min: number, max: number): number {
		return clamp(variables[varName] ?? min, min, max);
	}

	function handleRangeInput(name: string, e: Event, min: number, max: number) {
		const val = clamp(parseFloat((e.target as HTMLInputElement).value), min, max);
		db.simulaciones.updateVariable(name, val);
	}

	function handleNumberChange(name: string, e: Event, min: number, max: number) {
		const target = e.target as HTMLInputElement;
		const clamped = clamp(parseFloat(target.value), min, max);
		if (!isNaN(clamped)) target.value = clamped.toString();
		db.simulaciones.updateVariable(name, clamped);
	}
</script>

<div class="flex flex-col gap-4 rounded-xl border border-base-400 bg-base-200 p-5 shadow-sm">
	<div class="flex items-center justify-between">
		<h3 class="text-xs font-bold tracking-wide text-content uppercase opacity-60">Variables</h3>

		<div class="flex gap-0.5 rounded-lg bg-base-300 p-0.5">
			{#each PRECISIONS as p, i (i)}
				<button
					onclick={() => (precisionIdx = i)}
					class="cursor-pointer rounded-md px-2 py-0.5 font-mono text-[10px] font-bold transition-all duration-150
					{precisionIdx === i
						? 'bg-base-100 text-content shadow-xs'
						: 'text-content opacity-40 hover:opacity-70'}"
				>
					{p.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="grid grid-cols-1 gap-x-8 gap-y-4 lg:grid-cols-2">
		{#each libres as varName (varName)}
			{@const lim = mapaDominios[varName] ?? { min: 0, max: 100 }}
			{@const value = effectiveValue(varName, lim.min, lim.max)}

			<div class="flex items-center gap-3 rounded-lg border border-base-400/50 bg-base-100/50 p-3">
				<span class="w-8 shrink-0 font-mono font-bold text-content">{varName}</span>

				<input
					type="range"
					min={lim.min}
					max={lim.max}
					{step}
					{value}
					oninput={(e) => handleRangeInput(varName, e, lim.min, lim.max)}
					class="flex-1 accent-primary-100"
				/>

				<input
					type="number"
					min={lim.min}
					max={lim.max}
					{step}
					{value}
					onchange={(e) => handleNumberChange(varName, e, lim.min, lim.max)}
					class="no-spinner w-14 rounded border border-base-400 bg-base-100 p-1 text-center font-mono text-sm text-content focus:border-primary-100 focus:outline-none"
				/>
			</div>
		{:else}
			<div class="col-span-full py-4 text-center font-mono text-sm text-content/50">
				Declara variables para ajustar sus valores…
			</div>
		{/each}
	</div>
</div>
