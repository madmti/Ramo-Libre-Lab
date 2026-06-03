<script lang="ts">
	import { Download, Trash2, Upload } from '@lucide/svelte';

	function handleExport() {}
	function handleImport(event: Event) {}
	function handleClearAllData() {}
</script>

<div class="flex shrink-0 flex-col gap-4 rounded-xl border border-base-400 bg-base-200 p-4">
	<div>
		<p class="mb-2 text-xs font-semibold tracking-wide text-content uppercase opacity-60">
			Gestión de Datos locales
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
				<Trash2 size={16} /> Borrar almacenamiento local
			</button>
		</div>
	</div>
</div>
