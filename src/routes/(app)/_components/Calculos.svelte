<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import { parseScript, buildEvalContext } from '@ramo-libre/dsl-parser';
	import type { AssignmentStatement } from '@ramo-libre/dsl-parser';

	let statements = $derived(parseScript(db.simulaciones.actual.scriptRaw));
	let variables = $derived(db.simulaciones.actual.variables);
	let assignments = $derived(
		statements.filter((s): s is AssignmentStatement => s.type === 'assignment')
	);
	let ctx = $derived(buildEvalContext(statements, variables));
</script>

{#if assignments.length > 0}
	<div class="border-base-400 bg-base-200 flex flex-col gap-3 rounded-xl border p-5 shadow-sm">
		<h3 class="text-content text-xs font-bold tracking-wide uppercase opacity-60">Cálculos</h3>

		<div class="flex flex-col gap-2">
			{#each assignments as stmt (stmt.lhs)}
				{@const val = ctx[stmt.lhs] ?? 0}
				{@const label = stmt.label ?? stmt.lhs}

				<div
					class="border-primary-300 bg-primary-400/10 flex items-center justify-between rounded-lg border border-dashed px-3 py-2"
				>
					<div class="flex items-center gap-2 overflow-hidden">
						<span class="text-primary-100 font-mono text-xs font-bold">{stmt.lhs}</span>
						{#if stmt.label}
							<span class="text-content/40 truncate font-mono text-[10px]">{label}</span>
						{/if}
					</div>
					<span class="text-content ml-3 shrink-0 font-mono text-sm font-black">
						{val.toFixed(2)}
					</span>
				</div>
			{/each}
		</div>
	</div>
{/if}
