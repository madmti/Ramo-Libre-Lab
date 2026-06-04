<script lang="ts">
	import { db } from '$lib';
	import type { FullSnapshot } from '$lib/state/index.svelte';
	import { Download, Trash2, Upload } from '@lucide/svelte';

	function handleExport() {
		const snapshot = db.createSnapshot();
		const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `ramolibrelab-snapshot-${new Date().toISOString()}.json`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		URL.revokeObjectURL(url);
	}

	function isSnapshot(value: unknown): value is FullSnapshot {
		return typeof value === 'object' && value !== null;
	}

	async function handleImport(event: Event) {
		const input = event.currentTarget as HTMLInputElement | null;
		const file = input?.files?.[0];
		if (!file) return;

		try {
			const text = await file.text();
			const parsed = JSON.parse(text) as unknown;
			if (!isSnapshot(parsed)) return;
			db.fromSnapshot(parsed);
		} catch (error) {
			console.error('Error al importar snapshot', error);
		} finally {
			if (input) input.value = '';
		}
	}

	function handleClearAllData() {
		db.clear();
		localStorage.clear();
	}
</script>

<div class="flex shrink-0 flex-col gap-4 rounded-xl border border-base-400 bg-base-200 p-4">
	<div>
		<p class="mb-2 text-xs font-semibold tracking-wide text-content uppercase opacity-60">
			Datos locales
		</p>
		<div class="flex flex-col gap-2">
			<button
				onclick={handleExport}
				class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-base-400 bg-base-100 p-2.5 text-xs font-bold text-content transition-all hover:bg-base-300"
			>
				<Download size={16} /> Exportar JSON
			</button>

			<label
				class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-base-400 bg-base-100 p-2.5 text-center text-xs font-bold text-content transition-all hover:bg-base-300"
			>
				<Upload size={16} /> Importar JSON
				<input type="file" accept=".json" class="hidden" onchange={handleImport} />
			</label>

			<button
				onclick={handleClearAllData}
				class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-error-100/20 bg-error-100/5 p-3 text-center text-xs font-bold text-error-100 transition-all hover:bg-error-100 hover:text-white active:scale-[0.99]"
			>
				<Trash2 size={16} /> Borrar todos los datos
			</button>
		</div>
	</div>
</div>
