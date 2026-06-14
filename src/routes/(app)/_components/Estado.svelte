<script lang="ts">
	import { db } from '$lib/state/index.svelte';
	import {
		parseScript,
		evaluate,
		evaluateExpression,
		buildEvalContext,
		statementDisplayName
	} from '@ramo-libre/dsl-parser';
	import type { ASTNode, AssignmentStatement, ConstraintStatement } from '@ramo-libre/dsl-parser';

	let statements = $derived(parseScript(db.simulaciones.actual.scriptRaw));
	let variables = $derived(db.simulaciones.actual.variables);

	let activeRaw = $derived(db.simulaciones.actual.activeStatementRaw ?? '');

	let activeStatement = $derived(
		statements.find(
			(s): s is AssignmentStatement | ConstraintStatement =>
				(s.type === 'assignment' || s.type === 'constraint') && s.raw === activeRaw
		) ??
			statements.find((s): s is AssignmentStatement => s.type === 'assignment') ??
			null
	);

	function handleSelectStatement(raw: string) {
		db.simulaciones.updateActual({ activeStatementRaw: raw });
	}

	// evaluateExpression ya maneja errores internamente y retorna 0 en caso de fallo
	function evalNode(node: ASTNode, ctx: Record<string, number>): number {
		return evaluateExpression(node, [], ctx);
	}

	let valorProyectado = $derived.by((): number => {
		if (!activeStatement) return 0;
		try {
			const ctx = buildEvalContext(statements, variables);
			if (activeStatement.type === 'assignment') return evalNode(activeStatement.expression, ctx);
			return evalNode(activeStatement.left, ctx);
		} catch {
			return 0;
		}
	});

	let activeLabel = $derived(
		activeStatement ? statementDisplayName(activeStatement) : 'Sin regla activa'
	);

	let renderableStatements = $derived(
		statements.filter(
			(s): s is AssignmentStatement | ConstraintStatement =>
				s.type === 'assignment' || s.type === 'constraint'
		)
	);

	let restriccionesEstado = $derived.by(() => {
		const ctx = buildEvalContext(statements, variables);

		return renderableStatements.map((stmt, index) => {
			const isConstraint = stmt.type === 'constraint';

			const cumplido = (() => {
				if (!isConstraint) return true;
				try {
					return Boolean(evaluate(stmt, statements, variables));
				} catch {
					return false;
				}
			})();

			const valorActual = (() => {
				try {
					return isConstraint ? evalNode(stmt.left, ctx) : evalNode(stmt.expression, ctx);
				} catch {
					return 0;
				}
			})();

			const umbral = (() => {
				if (!isConstraint) return null;
				try {
					return evalNode(stmt.right, ctx);
				} catch {
					return null;
				}
			})();

			return {
				id: index,
				stmt,
				label: statementDisplayName(stmt),
				isConstraint,
				cumplido,
				// toFixed(2) en el punto de display, nunca antes — el Decimal ya garantizó
				// que valorActual es un número JS sin basura de IEEE 754 acumulada
				valorActual: Number(valorActual.toFixed(2)),
				umbral: umbral !== null ? Number(umbral.toFixed(2)) : null,
				isActive: stmt.raw === activeRaw
			};
		});
	});

	let isFactible = $derived(
		restriccionesEstado.filter((r) => r.isConstraint).every((r) => r.cumplido)
	);
</script>

<div
	class="border-base-400 bg-base-200 box-border flex flex-col gap-4 rounded-xl border p-6 font-sans shadow-sm"
>
	<h3 class="text-content text-xs font-semibold tracking-wide uppercase opacity-60">
		Estado del Sistema
	</h3>

	{#if isFactible}
		<div
			class="border-success-100/30 bg-success-100/10 text-success-100 flex items-center justify-center gap-2 rounded-lg border p-3 transition-colors duration-300"
		>
			<span class="text-sm font-bold tracking-wider uppercase">Factible</span>
		</div>
	{:else}
		<div
			class="border-error-100/30 bg-error-100/10 text-error-100 flex items-center justify-center gap-2 rounded-lg border p-3 transition-colors duration-300"
		>
			<span class="text-sm font-bold tracking-wider uppercase">Incompatible</span>
		</div>
	{/if}

	<div
		class="border-base-400/50 mt-1 flex flex-col items-center justify-center gap-1 border-t border-b py-6"
	>
		<span
			class="text-content/40 max-w-full truncate px-4 text-center font-mono text-[10px] tracking-widest uppercase"
		>
			{activeLabel}
		</span>
		<span
			class="mt-1 text-6xl font-black tracking-tighter transition-all duration-300
			{isFactible ? 'text-content' : 'text-error-100 opacity-60'}"
		>
			{valorProyectado.toFixed(1)}
		</span>
	</div>

	<div class="flex flex-col gap-2">
		<span class="text-content text-[10px] font-bold tracking-wider uppercase opacity-40">
			Reglas
		</span>
		<div class="flex flex-col gap-1.5">
			{#each restriccionesEstado as res (res.id)}
				<button
					onclick={() => handleSelectStatement(res.stmt.raw)}
					class="group flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-left font-mono text-xs transition-all duration-150
					{res.isActive
						? 'border-primary-100/40 bg-primary-400/20 text-primary-100 font-semibold'
						: res.isConstraint && !res.cumplido
							? 'border-error-100/30 bg-error-100/5 text-error-100 hover:bg-error-100/10'
							: 'border-base-400/60 bg-base-100/40 text-content hover:bg-base-100 opacity-70 hover:opacity-100'}"
				>
					<span class="truncate">{res.label}</span>

					<div class="ml-2 flex shrink-0 items-center gap-2">
						{#if res.isConstraint && res.umbral !== null}
							<span class="text-[10px] opacity-60">
								{res.valorActual}
								{res.stmt.operator}
								{res.umbral}
							</span>
							<span class="text-sm leading-none">{res.cumplido ? '✓' : '✗'}</span>
						{:else}
							<span class="tabular-nums">{res.valorActual}</span>
						{/if}
					</div>
				</button>
			{:else}
				<div class="py-2 text-center text-xs font-mono text-content/40">Sin reglas declaradas.</div>
			{/each}
		</div>
	</div>
</div>
