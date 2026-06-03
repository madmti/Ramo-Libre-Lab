<script lang="ts">
	import { Calendar, Trash2 } from '@lucide/svelte';

	let simulaciones = $state([
		{ id: '1', nombre: 'INF-134 - Peor Escenario', fecha: '03 Jun 2026', active: true },
		{ id: '2', nombre: 'Aproximación con Gamma 1.1', fecha: '28 May 2026', active: false },
		{ id: '3', nombre: 'Simulación Redes de Computadores', fecha: '15 May 2026', active: false }
	]);

	function handleDeleteEnvironment(id: string, event: Event) {
		event.stopPropagation();
		simulaciones = simulaciones.filter((s) => s.id !== id);
	}

	function handleLoadEnvironment(id: string) {
		console.log('Cargar entorno con ID:', id);
	}
</script>

<div class="flex min-h-0 flex-1 flex-col gap-2">
	<p
		class="mb-1 block shrink-0 px-1 text-xs font-semibold tracking-wide text-content uppercase opacity-60"
	>
		Simulaciones Guardadas
	</p>

	{#if simulaciones.length === 0}
		<div
			class="shrink-0 rounded-xl border border-dashed border-base-400 bg-base-100/20 p-6 text-center"
		>
			<span class="text-sm text-content opacity-40">
				No hay entornos locales<br />guardados aún
			</span>
		</div>
	{:else}
		<div class="flex flex-1 snap-y scrollbar-thin flex-col gap-3 overflow-y-auto pr-1 pb-4">
			{#each simulaciones as sim (sim.id)}
				<div
					role="button"
					tabindex="0"
					onclick={() => {
						handleLoadEnvironment(sim.id);
					}}
					onkeydown={(e) => e.key === 'Enter' && handleLoadEnvironment(sim.id)}
					class="group relative flex shrink-0 cursor-pointer snap-start flex-col gap-2 rounded-xl border p-4 text-left transition-all duration-150
                          {sim.active
						? 'border-primary-100 bg-base-100 shadow-sm'
						: 'border-base-400 bg-base-200 hover:border-base-400/80 hover:bg-base-100'}"
				>
					<div class="truncate pr-7 text-sm font-bold text-content">{sim.nombre}</div>
					<div class="flex items-center gap-1.5 font-mono text-[11px] text-content opacity-50">
						<Calendar size={12} class="opacity-70" />
						{sim.fecha}
					</div>

					<button
						onclick={(e) => handleDeleteEnvironment(sim.id, e)}
						class="absolute top-3.5 right-3.5 rounded-md p-1.5 text-content opacity-0 transition-all group-hover:opacity-60 hover:bg-error-100/10 hover:text-error-100 hover:opacity-100"
						title="Eliminar simulación"
					>
						<Trash2 size={16} />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
