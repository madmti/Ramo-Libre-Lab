<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import { Save, Calendar, Plus } from '@lucide/svelte';

	let nombreSimulacion = $state('');
	let fechaSimulacion = $state('');

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

	$effect(() => {
		nombreSimulacion = db.simulaciones.actual.name;
		fechaSimulacion = formatFecha(db.simulaciones.actual.date);
	});

	function handleBlur(event: FocusEvent) {
		const target = event.target as HTMLHeadingElement;
		const nuevoNombre = target.innerText.trim();

		if (nuevoNombre) {
			nombreSimulacion = nuevoNombre;
			db.simulaciones.updateActual({
				name: nuevoNombre
			});
		} else {
			target.innerText = nombreSimulacion;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			(event.target as HTMLHeadingElement).blur();
		}
	}

	function handleNew() {
		db.simulaciones.resetActual();
	}

	function handleSave() {
		db.simulaciones.saveActual();
	}
</script>

<div
	class="border-base-400 bg-base-200 text-content flex flex-col gap-4 rounded-xl border p-5 font-sans shadow-sm sm:flex-row sm:items-center sm:justify-between"
>
	<div class="flex w-full flex-col gap-1.5 sm:max-w-3/5">
		<h1
			contenteditable="true"
			onblur={handleBlur}
			onkeydown={handleKeydown}
			class="text-content focus:border-primary-100/30 focus:text-primary-100 w-full text-lg font-bold tracking-tight transition-colors outline-none focus:border-b"
			spellcheck="false"
		>
			{nombreSimulacion}
		</h1>

		<div class="text-content flex items-center gap-1.5 font-mono text-[11px] opacity-50">
			<Calendar size={12} class="opacity-70" />
			{fechaSimulacion}
		</div>
	</div>

	<div class="flex w-full items-center gap-2 sm:w-auto">
		<button
			onclick={handleNew}
			class="border-base-400 bg-base-300 text-content hover:bg-base-400/40 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all active:scale-[0.98] sm:flex-none"
		>
			<Plus size={15} />
			<span>Nueva</span>
		</button>

		<button
			onclick={handleSave}
			class="bg-content text-base-100 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] sm:flex-none"
		>
			<Save size={15} />
			<span>Guardar</span>
		</button>
	</div>
</div>
