<script lang="ts">
    import ramolibreicon from '$lib/assets/ramolibre.webp';
	import Icon from '@iconify/svelte';
	import { Globe } from '@lucide/svelte';
</script>

<div
	class="flex flex-col gap-2 rounded-xl border border-base-400 bg-base-200 p-4 font-sans text-content shadow-sm"
>
	<p class="text-xs font-semibold tracking-wide text-content uppercase opacity-60">Otros</p>
	<a
		href="https://github.com/madmti/Ramo-Libre-Lab"
		target="_blank"
		rel="noopener noreferrer"
		class="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-base-400 bg-base-100/50 p-2 text-center text-xs font-semibold transition-all hover:bg-base-100 active:scale-[0.98]"
	>
		<Icon icon="lucide:github" width="14" class="opacity-70" />
		<span>Ver Codigo Fuente</span>
	</a>
	<a
		href="https://madmti.github.io/es/"
		target="_blank"
		rel="noopener noreferrer"
		class="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-base-400 bg-base-100/50 p-2 text-center text-xs font-semibold transition-all hover:bg-base-100 active:scale-[0.98]"
	>
		<Globe size={14}/>
		<span>Visitar Portafolio</span>
	</a>
	<a
		href="https://ramolibre.app/"
		target="_blank"
		rel="noopener noreferrer"
		class="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary-100 p-2 text-center text-xs font-semibold text-white transition-all hover:opacity-95 active:scale-[0.98]"
	>
	    <img src={ramolibreicon} alt="RamoLibre Logo" class="w-4 h-4" />
		<span>Probar RamoLibre</span>
	</a>
</div>
