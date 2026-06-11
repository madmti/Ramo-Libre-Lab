<script lang="ts">
	import { Calendar, Trash2 } from '@lucide/svelte';
	import { db } from '$lib/state/index.svelte';

	let simulaciones = $derived(
		Array.from(db.simulaciones.all.values()).map((sim) => ({
			id: sim.id,
			nombre: sim.name,
			fecha: formatFecha(sim.date),
			active: sim.id === db.simulaciones.actual.id
		}))
	);

	const dateFormatter = new Intl.DateTimeFormat('es-ES', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});

	function formatFecha(date: Date | string | null) {
		if (!date) return 'Sin fecha';
		const parsed = typeof date === 'string' ? new Date(date) : date;
		if (Number.isNaN(parsed.getTime())) return 'Sin fecha';
		return dateFormatter.format(parsed);
	}

	function handleDeleteEnvironment(id: string, event: Event) {
		event.stopPropagation();
		db.simulaciones.deleteById(id);
	}

	function handleLoadEnvironment(id: string) {
		db.simulaciones.loadById(id);
	}
</script>

<div class="flex min-h-0 flex-1 flex-col gap-2">
	<p
		class="text-content mb-1 block shrink-0 px-1 text-xs font-semibold tracking-wide uppercase opacity-60"
	>
		Simulaciones Guardadas
	</p>

	{#if simulaciones.length === 0}
		<div
			class="border-base-400 bg-base-100/20 shrink-0 rounded-xl border border-dashed p-6 text-center"
		>
			<span class="text-content text-sm opacity-40">
				No hay simulaciones<br />guardadas aún
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
					<div class="text-content truncate pr-7 text-sm font-bold">{sim.nombre}</div>
					<div class="text-content flex items-center gap-1.5 font-mono text-[11px] opacity-50">
						<Calendar size={12} class="opacity-70" />
						{sim.fecha}
					</div>

					<button
						onclick={(e) => handleDeleteEnvironment(sim.id, e)}
						class="text-content hover:bg-error-100/10 hover:text-error-100 absolute top-3.5 right-3.5 rounded-md p-1.5 transition-all group-hover:opacity-60 hover:opacity-100 sm:opacity-0"
						title="Eliminar simulación"
					>
						<Trash2 size={16} />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>
