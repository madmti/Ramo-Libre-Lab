<div class="flex flex-col gap-4 rounded-xl border border-base-400 bg-base-200 p-5 shadow-sm">
	<h3 class="text-xs font-semibold tracking-wide text-content uppercase opacity-60">
		Guía de Sintaxis
	</h3>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		<div
			class="flex flex-col justify-between gap-2 rounded-lg border border-base-400/50 bg-base-100/30 p-4 transition-colors hover:border-primary-100/30"
		>
			<div>
				<span
					class="mb-3 block text-[10px] font-bold tracking-wider text-content uppercase opacity-50"
				>
					Aritmética
				</span>
				<ul class="flex flex-col gap-2 font-mono text-sm text-content/80">
					{#each [['+', 'Suma'], ['-', 'Resta'], ['*', 'Multiplicación'], ['/', 'División'], ['**', 'Potencia']] as [op, label] (op)}
						<li class="flex items-center gap-3">
							<span
								class="flex h-6 min-w-6 items-center justify-center rounded bg-primary-100/10 px-1 font-bold text-primary-100"
							>
								{op}
							</span>
							<span>{label}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div class="mt-3 rounded bg-base-400/20 p-2 font-mono text-xs text-content/60">
				<span class="text-primary-100/60">Ej:</span> NF = PC * 0.6 + Cert ** 2 / 100
			</div>
		</div>

		<div
			class="flex flex-col justify-between gap-2 rounded-lg border border-base-400/50 bg-base-100/30 p-4 transition-colors hover:border-primary-100/30"
		>
			<div>
				<span
					class="mb-3 block text-[10px] font-bold tracking-wider text-content uppercase opacity-50"
				>
					Comparación y Asignación
				</span>
				<ul class="flex flex-col gap-2 font-mono text-sm text-content/80">
					{#each [['>=', 'Mayor o igual'], ['<=', 'Menor o igual'], ['>', 'Mayor que'], ['<', 'Menor que'], ['=', 'Asignación']] as [op, label] (op)}
						<li class="flex items-center gap-3">
							<span
								class="flex h-6 min-w-8 items-center justify-center rounded bg-primary-100/10 px-1 font-bold text-primary-100"
							>
								{op}
							</span>
							<span>{label}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div class="mt-3 rounded bg-base-400/20 p-2 font-mono text-xs text-content/60">
				<span class="text-primary-100/60">Ej:</span> PC = prom(C1, C2)
			</div>
		</div>

		<div
			class="flex flex-col justify-between gap-2 rounded-lg border border-base-400/50 bg-base-100/30 p-4 transition-colors hover:border-primary-100/30"
		>
			<div>
				<span
					class="mb-3 block text-[10px] font-bold tracking-wider text-content uppercase opacity-50"
				>
					Funciones
				</span>
				<ul class="flex flex-col gap-2 font-mono text-sm text-content/80">
					{#each [['prom()', 'Promedio aritmético'], ['cada()', 'Todos deben cumplir (Mínimo)'], ['escalon()', 'Escalón unitario (1 si >= 0, sino 0)']] as [fn, label] (fn)}
						<li class="flex items-center gap-3">
							<span
								class="flex h-6 items-center justify-center rounded bg-primary-100/10 px-2 font-bold text-primary-100"
							>
								{fn}
							</span>
							<span class="text-xs">{label}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div class="mt-3 flex flex-col gap-1">
				<div class="rounded bg-base-400/20 p-2 font-mono text-xs text-content/60">
					<span class="text-primary-100/60">Ej:</span> cada(L1, L2, L3) >= 20
				</div>
				<div class="rounded bg-base-400/20 p-2 font-mono text-xs text-content/60">
					<span class="text-primary-100/60">Ej:</span> Aprobado = escalon(NF - 55)
				</div>
			</div>
		</div>

		<div
			class="flex flex-col justify-between gap-2 rounded-lg border border-base-400/50 bg-base-100/30 p-4 transition-colors hover:border-primary-100/30"
		>
			<div>
				<span
					class="mb-3 block text-[10px] font-bold tracking-wider text-content uppercase opacity-50"
				>
					Dominios (Límites)
				</span>
				<ul class="flex flex-col gap-2 font-mono text-sm text-content/80">
					<li class="flex items-start gap-3">
						<span
							class="mt-0.5 flex h-6 shrink-0 items-center justify-center rounded bg-primary-100/10 px-2 font-bold text-primary-100"
							>dominio</span
						>
						<span class="text-xs">Sintaxis clásica con corchetes</span>
					</li>
					<li class="flex items-start gap-3">
						<span
							class="mt-0.5 flex h-6 shrink-0 items-center justify-center rounded bg-primary-100/10 px-2 font-bold text-primary-100"
							>in</span
						>
						<span class="text-xs">Sintaxis alternativa equivalente</span>
					</li>
				</ul>
			</div>
			<div class="mt-3 flex flex-col gap-1">
				<div class="rounded bg-base-400/20 p-2 font-mono text-xs text-content/60">
					<span class="text-primary-100/60">Ej:</span> dominio C1, C2 [0, 100]
				</div>
				<div class="rounded bg-base-400/20 p-2 font-mono text-xs text-content/60">
					<span class="text-primary-100/60">Ej:</span> C1, C2 in [1.0, 7.0]
				</div>
			</div>
		</div>

		<div
			class="flex flex-col justify-between gap-2 rounded-lg border border-base-400/50 bg-base-100/30 p-4 transition-colors hover:border-primary-100/30"
		>
			<div>
				<span
					class="mb-3 block text-[10px] font-bold tracking-wider text-content uppercase opacity-50"
				>
					Etiquetas (Labels)
				</span>
				<p class="font-mono text-xs leading-relaxed text-content/70">
					Asigna un nombre legible a cualquier regla usando <span class="font-bold text-primary-100"
						>Nombre:</span
					> antes de la expresión. La etiqueta aparece en la UI y en el panel de estado.
				</p>
			</div>
			<div class="mt-3 flex flex-col gap-1">
				<div class="rounded bg-base-400/20 p-2 font-mono text-xs text-content/60">
					<span class="text-primary-100/60">Ej:</span> Nota Final: NF = PC * 0.6
				</div>
				<div class="rounded bg-base-400/20 p-2 font-mono text-xs text-content/60">
					<span class="text-primary-100/60">Ej:</span> Minimo Labs: cada(L1, L2) >= 20
				</div>
			</div>
		</div>

		<div
			class="flex flex-col justify-between gap-2 rounded-lg border border-base-400/50 bg-base-100/30 p-4 transition-colors hover:border-primary-100/30"
		>
			<div>
				<span
					class="mb-3 block text-[10px] font-bold tracking-wider text-content uppercase opacity-50"
				>
					Variables Cultivadas / Calculadas
				</span>
				<p class="font-mono text-xs leading-relaxed text-content/70">
					Una variable definida con <span class="font-bold text-primary-100">=</span> se convierte en
					un nodo calculado. No genera slider — su valor se resuelve automáticamente.
				</p>
			</div>
			<div class="mt-3 flex flex-col gap-1">
				<div class="rounded bg-base-400/20 p-2 font-mono text-xs text-content/60">
					<span class="text-primary-100/60">Ej:</span> PC = prom(C1, C2)
				</div>
				<div class="rounded bg-base-400/20 p-2 font-mono text-xs text-content/60">
					<span class="text-primary-100/60">Ej:</span> NF = PC * 0.6 + Cert * 0.4
				</div>
			</div>
		</div>
	</div>
</div>
