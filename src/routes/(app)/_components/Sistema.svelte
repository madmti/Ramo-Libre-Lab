<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import { Plus, Trash2, Code, LayoutGrid, Save, Check } from '@lucide/svelte';
	import katex from 'katex';
	import 'katex/dist/katex.min.css';

	import { parseScript, toLatex, statementDisplayName } from '@ramolibre/core/dsl-parser';
	import type {
		StatementNode,
		AssignmentStatement,
		ConstraintStatement
	} from '@ramolibre/core/dsl-parser';

	let modoInput = $state<'visual' | 'script'>(db.simulaciones.actual.modo ?? 'visual');
	let dslInput = $state('');
	let scriptInput = $state(db.simulaciones.actual.scriptRaw);

	let statements = $derived(parseScript(db.simulaciones.actual.scriptRaw));

	let renderableStatements = $derived(
		statements.filter(
			(s): s is AssignmentStatement | ConstraintStatement =>
				s.type === 'assignment' || s.type === 'constraint'
		)
	);

	let activeRaw = $state<string>(db.simulaciones.actual.activeStatementRaw ?? '');

	let effectiveActiveRaw = $derived.by(() => {
		const exists = renderableStatements.some((s) => s.raw === activeRaw);
		if (!exists && renderableStatements.length > 0) {
			return renderableStatements[0].raw;
		}
		return activeRaw;
	});

	function renderStatement(stmt: StatementNode): string {
		try {
			return katex.renderToString(toLatex(stmt), { displayMode: false, throwOnError: true });
		} catch {
			return `<span class="text-error-100 font-mono text-xs">Error de sintaxis</span>`;
		}
	}

	function setModo(nuevoModo: 'visual' | 'script') {
		if (nuevoModo === 'script') scriptInput = db.simulaciones.actual.scriptRaw;
		modoInput = nuevoModo;
		db.simulaciones.updateActual({ modo: nuevoModo });
	}

	function handleAddEcuacion() {
		const trimmed = dslInput.trim();
		if (!trimmed) return;
		const currentRaw = db.simulaciones.actual.scriptRaw.trim();
		const newRaw = currentRaw ? `${currentRaw}\n${trimmed}` : trimmed;
		db.simulaciones.updateActual({ scriptRaw: newRaw });
		dslInput = '';
	}

	function handleApplyScript() {
		db.simulaciones.updateActual({ scriptRaw: scriptInput });
	}

	function handleKeydownVisual(e: KeyboardEvent) {
		if (e.key === 'Enter') handleAddEcuacion();
	}

	function handleRemoveStatement(rawLineToRemove: string) {
		const newRaw = db.simulaciones.actual.scriptRaw
			.split('\n')
			.filter((l) => l.trim() !== rawLineToRemove)
			.join('\n');
		db.simulaciones.updateActual({ scriptRaw: newRaw });
	}

	function handleSelectStatement(raw: string) {
		activeRaw = raw;
		db.simulaciones.updateActual({ activeStatementRaw: raw });
	}
</script>

<div
	class="border-base-400 bg-base-200 flex flex-col gap-4 rounded-xl border p-5 shadow-sm transition-all duration-300"
>
	<div class="flex items-center justify-between pb-1">
		<h3 class="text-content text-xs font-semibold tracking-wide uppercase opacity-60">
			Sistema de Ecuaciones
		</h3>
		<div class="bg-base-300 flex gap-0.5 rounded-lg p-0.5 text-xs font-medium">
			<button
				onclick={() => setModo('visual')}
				class="flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 transition-all duration-150 {modoInput ===
				'visual'
					? 'bg-base-100 text-content font-semibold shadow-xs'
					: 'text-content opacity-50 hover:opacity-100'}"
			>
				<LayoutGrid size={13} /> Visual
			</button>
			<button
				onclick={() => setModo('script')}
				class="flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 transition-all duration-150 {modoInput ===
				'script'
					? 'bg-base-100 text-content font-semibold shadow-xs'
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
				class="border-base-400 bg-base-100 text-content placeholder:text-content/30 focus:border-primary-100 flex-1 rounded-lg border px-4 py-2.5 font-mono text-sm transition-colors focus:outline-none"
				placeholder="Ej: NF: 55 <= prom(C1, C2, C3)"
			/>
			<button
				onclick={handleAddEcuacion}
				class="bg-content text-base-100 flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
			>
				<Plus size={16} /> Agregar
			</button>
		</div>
	{:else}
		<div class="animate-fade-in flex flex-col gap-2">
			<textarea
				bind:value={scriptInput}
				spellcheck="false"
				class="border-base-400 bg-base-100 text-content focus:border-primary-100 h-48 w-full resize-none scrollbar-thin rounded-lg border p-4 font-mono text-xs transition-colors focus:outline-none"
				placeholder="// Define el sistema completo aquí&#10;// dominio C1, C2 [0, 100]&#10;// PC = prom(C1, C2)&#10;// NF = PC * 0.6 + Cert * 0.4&#10;// C1 >= 55"
			></textarea>
			<button
				onclick={handleApplyScript}
				class="bg-content text-base-100 flex w-full cursor-pointer items-center justify-center rounded-lg p-2.5 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
			>
				<Save size={16} class="mr-2" /> Aplicar
			</button>
		</div>
	{/if}

	<div class="mt-2 flex flex-col gap-3">
		{#each renderableStatements as stmt, index (index)}
			{@const isAssignment = stmt.type === 'assignment'}
			{@const isActive = stmt.raw === effectiveActiveRaw}
			{@const displayName = statementDisplayName(stmt)}

			<div
				class="group flex flex-col rounded-lg border p-4 transition-all duration-200 {isActive
					? 'border-primary-100/50 bg-primary-400/30 shadow-sm'
					: 'border-base-400 bg-base-100 hover:border-primary-100/30 hover:bg-primary-400/10 cursor-pointer'}"
				onclick={() => handleSelectStatement(stmt.raw)}
				role="button"
				tabindex="0"
				onkeydown={(e) => e.key === 'Enter' && handleSelectStatement(stmt.raw)}
				aria-pressed={isActive}
				title="Seleccionar como regla activa"
			>
				<div
					class="text-content pointer-events-none flex min-h-11 items-center justify-center py-2 text-lg select-none xl:text-xl"
				>
					{@html renderStatement(stmt)}
				</div>

				<div
					class="border-base-400/50 mt-2 flex items-center justify-between border-t pt-2 font-mono text-xs"
				>
					<div class="flex items-center gap-2 overflow-hidden">
						{#if isActive}
							<Check size={13} class="text-primary-100 shrink-0" aria-label="Regla activa" />
						{/if}
						<span
							class="truncate {isActive
								? 'text-primary-100 font-semibold'
								: 'text-content/60 group-hover:text-content/80'}"
						>
							{displayName}
						</span>
						<span
							class="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase {isAssignment
								? 'bg-primary-400/50 text-primary-100'
								: 'bg-base-400/50 text-content/50'}"
						>
							{isAssignment ? 'calc' : 'regla'}
						</span>
					</div>

					<button
						onclick={(e) => {
							e.stopPropagation();
							handleRemoveStatement(stmt.raw);
						}}
						class="text-content hover:bg-error-100/10 hover:text-error-100 cursor-pointer rounded p-1 opacity-30 transition-colors hover:opacity-100"
						title="Eliminar regla"
					>
						<Trash2 size={13} />
					</button>
				</div>
			</div>
		{:else}
			<div class="py-6 text-center font-mono text-xs text-content/40">
				Agrega ecuaciones o restricciones para comenzar…
			</div>
		{/each}
	</div>
</div>

<style>
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
