<script lang="ts">
	import { Plus, Trash2, Code, LayoutGrid, Save } from '@lucide/svelte';

	// 1. ESTADOS INTERNOS DEL COMPONENTE

	// Control de modo local dentro del tile: 'visual' o 'script'
	let modoInput = $state<'visual' | 'script'>('visual');

	// Estado para el input de una sola línea (Modo Visual)
	let dslInput = $state('');

	// Estado para el textarea monolítico (Modo Script)
	let scriptInput = $state('');

	// La "Fuente de Verdad" de las ecuaciones.
	// Vincular esto a db.simulaciones.actual.reglas en producción.
	let ecuaciones = $state([
		{ id: '1', raw: 'NF == (C1 + C2)/2 * 0.6 + Cert * 0.4', isTarget: true },
		{ id: '2', raw: 'C1 >= 55', isTarget: false }
	]);

	// 2. LÓGICA DE HERRAMIENTAS

	// Cambiar de modo y sincronizar datos
	function setModo(nuevoModo: 'visual' | 'script') {
		if (nuevoModo === 'script') {
			// Al pasar a script, poblamos el textarea con la lista actual
			scriptInput = ecuaciones.map((eq) => eq.raw).join('\n');
		}
		// Al volver a visual, no hacemos nada, dependemos de 'handleApplyScript'
		modoInput = nuevoModo;
	}

	// Pequeño helper para parsear strings crudos a objetos de ecuación
	function parseRawToEcuacion(rawString: string) {
		const trimmed = rawString.trim();
		if (!trimmed || trimmed.startsWith('//')) return null; // Ignorar vacíos o comentarios

		return {
			id: crypto.randomUUID(),
			raw: trimmed,
			isTarget: trimmed.includes('NF') // Lógica simple de detección de target
		};
	}

	// ACCIÓN VISUAL: Agregar línea por línea
	function handleAddEcuacion() {
		const nuevaEq = parseRawToEcuacion(dslInput);
		if (nuevaEq) {
			ecuaciones = [...ecuaciones, nuevaEq];
			dslInput = '';
		}
	}

	// ACCIÓN SCRIPT: Sobrescribir todo el sistema
	function handleApplyScript() {
		// Parseamos el bloque completo de texto
		const lineas = scriptInput.split('\n');

		// Generamos la nueva lista pura filtrando nulos
		const nuevasEcuaciones = lineas.map(parseRawToEcuacion).filter((eq) => eq !== null);

		// Sobrescribimos la fuente de verdad
		ecuaciones = nuevasEcuaciones;

		// Opcional: Volver a modo visual tras aplicar
		// modoInput = 'visual';
	}

	function handleKeydownVisual(e: KeyboardEvent) {
		if (e.key === 'Enter') handleAddEcuacion();
	}
</script>

<div
	class="flex flex-col gap-4 rounded-xl border border-base-400 bg-base-200 p-5 shadow-sm transition-all duration-300"
>
	<div class="flex items-center justify-between pb-1">
		<h3 class="text-xs font-semibold tracking-wide text-content uppercase opacity-60">
			Sistema de Ecuaciones
		</h3>

		<div class="flex gap-0.5 rounded-lg bg-base-300 p-0.5 text-xs font-medium">
			<button
				onclick={() => setModo('visual')}
				class="flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 transition-all duration-150
                {modoInput === 'visual'
					? 'bg-base-100 font-semibold text-content shadow-xs'
					: 'text-content opacity-50 hover:opacity-100'}"
			>
				<LayoutGrid size={13} /> Visual
			</button>
			<button
				onclick={() => setModo('script')}
				class="flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 transition-all duration-150
                {modoInput === 'script'
					? 'bg-base-100 font-semibold text-content shadow-xs'
					: 'text-content opacity-50 hover:opacity-100'}"
			>
				<Code size={13} /> Script
			</button>
		</div>
	</div>

	{#if modoInput === 'visual'}
		<div class="animate-fade-in flex gap-2">
			<input
				type="text"
				bind:value={dslInput}
				onkeydown={handleKeydownVisual}
				class="flex-1 rounded-lg border border-base-400 bg-base-100 px-4 py-2.5 font-mono text-sm text-content transition-colors placeholder:text-content/30 focus:border-primary-100 focus:outline-none"
				placeholder="Ej: NF == prom(C1, C2) * 0.6 + Cert * 0.4"
			/>
			<button
				onclick={handleAddEcuacion}
				class="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-content px-4 text-sm font-bold text-base-100 transition-all hover:opacity-90 active:scale-95"
			>
				<Plus size={16} /> Agregar
			</button>
		</div>
	{:else}
		<div class="animate-fade-in flex flex-col gap-2">
			<textarea
				bind:value={scriptInput}
				spellcheck="false"
				class="h-48 w-full resize-none scrollbar-thin rounded-lg border border-base-400 bg-base-100 p-4 font-mono text-xs text-content transition-colors focus:border-primary-100 focus:outline-none"
				placeholder="// Define aquí todo el sistema (dominios, reglas)..."
			></textarea>
			<button
				onclick={handleApplyScript}
				class="flex w-full cursor-pointer items-center justify-center rounded-lg bg-content p-2.5 text-sm font-bold text-base-100 transition-all hover:opacity-90 active:scale-95"
			>
				<Save size={16} class="mr-2" /> Aplicar
			</button>
		</div>
	{/if}

	<div class="mt-2 flex flex-col gap-3">
		{#each ecuaciones as eq (eq.id)}
			<div
				class="flex flex-col rounded-lg border p-4 transition-colors
                {eq.isTarget
					? 'border-primary-100/30 bg-primary-100/5'
					: 'border-base-400 bg-base-100'}"
			>
				<div
					class="flex min-h-11 items-center justify-center py-2 font-serif text-lg text-content italic opacity-90 select-all"
				>
					<span class="font-sans text-sm tracking-normal opacity-40"
						>[ Mini Canvas: KaTeX Render de {eq.isTarget ? 'NF' : 'Restricción'} ]</span
					>
				</div>

				<div
					class="mt-2 flex items-center justify-between border-t border-base-400/50 pt-2 font-mono text-xs"
				>
					<span class={eq.isTarget ? 'font-semibold text-primary-100' : 'text-content/60'}>
						{eq.raw}
					</span>
					<button
						onclick={() => (ecuaciones = ecuaciones.filter((e) => e.id !== eq.id))}
						class="cursor-pointer rounded p-1 text-content opacity-30 transition-colors hover:bg-error-100/10 hover:text-error-100 hover:opacity-100"
						title="Eliminar regla"
					>
						<Trash2 size={13} />
					</button>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	/* Pequeña animación de entrada para suavizar el cambio de input */
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fade-in {
		animation: fadeIn 0.3s ease-out forwards;
	}
</style>
