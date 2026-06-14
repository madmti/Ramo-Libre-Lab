<script lang="ts">
	import { SuiteFavicons } from '@ramo-libre/ui-themes';
	import Icon from '@iconify/svelte';
	import { Globe } from '@lucide/svelte';
</script>

<div
	class="border-base-400 bg-base-200 text-content flex flex-col gap-2 rounded-xl border p-4 font-sans shadow-sm"
>
	<p class="text-content text-xs font-semibold tracking-wide uppercase opacity-60">Otros</p>
	<a
		href="https://github.com/madmti/Ramo-Libre-Lab"
		target="_blank"
		rel="noopener noreferrer"
		class="border-base-400 bg-base-100/50 hover:bg-base-100 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border p-2 text-center text-xs font-semibold transition-all active:scale-[0.98]"
	>
		<Icon icon="lucide:github" width="14" class="opacity-70" />
		<span>Ver Codigo Fuente</span>
	</a>
	<a
		href="https://madmti.github.io/es/"
		target="_blank"
		rel="noopener noreferrer"
		class="border-base-400 bg-base-100/50 hover:bg-base-100 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border p-2 text-center text-xs font-semibold transition-all active:scale-[0.98]"
	>
		<Globe size={14} />
		<span>Visitar Portafolio</span>
	</a>
	<a
		href="https://ramolibre.app/"
		target="_blank"
		rel="noopener noreferrer"
		class="bg-primary-100 flex cursor-pointer items-center justify-center gap-1.5 rounded-lg p-2 text-center text-xs font-semibold text-white transition-all hover:opacity-95 active:scale-[0.98]"
	>
		<img src={SuiteFavicons.web} alt="RamoLibre Logo" class="h-4 w-4" />
		<span>Probar RamoLibre</span>
	</a>
</div>
