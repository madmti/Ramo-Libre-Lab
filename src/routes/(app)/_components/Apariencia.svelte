<script lang="ts">
	import { db } from '$lib';
	import { themes } from '@ramo-libre/ui-themes';
</script>

<div class="border-base-400 bg-base-200 flex shrink-0 flex-col gap-3 rounded-xl border p-4">
	<p class="text-content text-xs font-semibold tracking-wide uppercase opacity-60">Apariencia</p>
	<div class="grid grid-cols-2 gap-2">
		{#each themes as opt (opt.id)}
			<button
				onclick={() => (db.preferences.theme = opt.id)}
				class="hover:bg-base-100 flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition-all duration-150
                            {db.preferences.theme === opt.id
					? 'border-primary-100 bg-base-100 font-bold shadow-sm'
					: 'border-base-400 bg-base-100/20 opacity-70'}"
			>
				<span class={db.preferences.theme === opt.id ? 'text-primary-100' : 'text-content/70'}>
					<opt.icon size={15} />
				</span>
				<span class="truncate text-xs tracking-normal">{opt.label}</span>
			</button>
		{/each}
	</div>
</div>
