<script lang="ts">
	// Fuente de verdad del estado de restricciones
	let restriccionesEstado = $state([
		{ id: '1', dsl: 'C1 >= 55', cumplido: true },
		{ id: '2', dsl: 'Cert >= 60', cumplido: true },
		{ id: '3', dsl: 'prom(C1, C2) >= 55', cumplido: true } // Ejemplo de regla rota
	]);

	let isFactible = $derived(restriccionesEstado.every((r) => r.cumplido));
	let nfProyectada = $state(82.4);
</script>

<div
	class="box-border flex flex-col gap-4 rounded-xl border border-base-400 bg-base-200 p-6 font-sans shadow-sm"
>
	<h3 class="text-xs font-semibold tracking-wide text-content uppercase opacity-60">
		Estado del Sistema
	</h3>

	{#if isFactible}
		<div
			class="flex items-center justify-center gap-2 rounded-lg border border-success-100/30 bg-success-100/10 p-3 text-success-100 transition-colors duration-300"
		>
			<span class="text-sm font-bold tracking-wider uppercase">Factible</span>
		</div>
	{:else}
		<div
			class="flex items-center justify-center gap-2 rounded-lg border border-error-100/30 bg-error-100/10 p-3 text-error-100 transition-colors duration-300"
		>
			<span class="text-sm font-bold tracking-wider uppercase">Incompatible</span>
		</div>
	{/if}

	<div
		class="mt-1 flex flex-col items-center justify-center border-t border-b border-base-400/50 py-6"
	>
		<span class="font-mono text-sm text-content opacity-50">NF Proyectada</span>
		<span
			class="mt-1 text-6xl font-black tracking-tighter transition-all duration-300
            {isFactible ? 'text-content' : 'text-error-100 opacity-40'}"
		>
			{isFactible ? nfProyectada.toFixed(1) : '---'}
		</span>
	</div>

	<div class="mt-1 flex flex-col gap-2">
		<span class="text-[10px] font-bold tracking-wider text-content uppercase opacity-40"
			>Verificación de Restricciones</span
		>

		<div class="flex max-h-36 scrollbar-thin flex-col gap-2 overflow-y-auto pr-0.5">
			{#each restriccionesEstado as res (res.id)}
				<div
					class="flex items-center justify-between rounded-lg border px-3 py-2.5 font-mono text-xs transition-all duration-200
                    {res.cumplido
						? 'border-base-400/60 bg-base-100/40 text-content opacity-80'
						: 'border-error-100/40 bg-error-100/10 font-bold text-error-100'}"
				>
					<span class="truncate">{res.dsl}</span>
				</div>
			{/each}
		</div>
	</div>
</div>
