<script lang="ts">
	import { Check, ClipboardCopy } from '@lucide/svelte';

	let copied = $state(false);

	const PROMPT_CONTEXTO_LAB = `Actúa como un experto en análisis de sistemas académicos no lineales y el DSL de RamoLibre LAB.

CONTEXTO DE LA APLICACIÓN:
RamoLibre LAB es una sandbox matemática local-first diseñada para el modelamiento y validación de problemas de satisfacción de restricciones académicas. Trata las ecuaciones de notas y criterios de aprobación como un sistema algebraico puro evaluado en tiempo real.

INTERFAZ Y ARQUITECTURA:
1. Header: Controla metadatos básicos y permite limpiar el entorno ("Nueva") o persistir localmente ("Guardar").
2. Sistema de Ecuaciones: Componente central con doble modo de entrada:
   - Modo Visual: Permite agregar restricciones e igualdades línea por línea.
   - Modo Script: Un textarea monolítico donde se digita el script completo del entorno. Al presionar "Aplicar", se reconstruye la base de datos de reglas.
3. Canvas Matemático Integrado: Renderiza de forma síncrona cada expresión del sistema usando notación matemática estándar (KaTeX).
4. Variables y Sliders: Panel de control dinámico. Las variables libres generan barras de desplazamiento para explorar fronteras físicas de notas. Las variables definidas mediante asignación estática (=) se calculan automáticamente y no generan sliders.
5. Estado del Sistema: Monitor en tiempo real que evalúa de forma cromática si el sistema de restricciones es "Factible" o "Incompatible", detallando de manera semántica el estado de satisfacción de cada regla.
6. Dominios: Muestra los conjuntos límites del entorno (por defecto [0, 100]).

REGLAS DE SINTAXIS DEL DSL (LENGUAJE):
- Aritmética estándar: +, -, *, /, y ** para potencias.
- Comparaciones (Restricciones): >=, <=, >, < para balancear inecuaciones.
- Asignación de Nodos Calculados: El operador '=' define variables calculadas implícitamente (Ej: PC = prom(C1, C2)).
- Operador de Igualdad Matemática: '==' conecta expresiones en ecuaciones de balance (Ej: NF == PC * 0.6 + Cert * 0.4).
- Funciones Clave:
  - prom(variables...): Promedio aritmético lineal.
  - cada(variables...): Exige el cumplimiento de un mínimo en todas las variables pasadas.
  - escalon(expresion): Retorna 1 si la expresión es >= 0, de lo contrario retorna 0.
- Dominios: Definidos con la palabra clave 'dominio' o el operador alternativo 'in' (Ej: C1, C2 in [1.0, 7.0]).
- Etiquetas: Anteponer 'Nombre:' para rotular reglas en la UI (Ej: Nota Final: NF = PC * 0.6).

INSTRUCCIÓN DE RESPUESTA:
Usa esta información para analizar, parsear o redactar scripts válidos para este entorno, respetando la consistencia algebraica de los estados factibles.`;

	function handleCopyPrompt() {
		if (copied) return;

		navigator.clipboard.writeText(PROMPT_CONTEXTO_LAB.trim()).then(() => {
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		});
	}
</script>

<div
	class="border-base-400 bg-base-200 flex flex-col gap-4 rounded-xl border p-5 font-sans shadow-sm"
>
	<div class="border-base-400/50 flex items-center justify-between border-b pb-2">
		<h3 class="text-content text-xs font-semibold tracking-wide uppercase opacity-60">
			Guía de Sintaxis
		</h3>

		<button
			onclick={handleCopyPrompt}
			class="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-300 active:scale-[0.97]
            {copied
				? 'border-success-200 bg-success-100 border text-white'
				: 'border-base-400 bg-base-300 text-content hover:bg-base-400/20 border opacity-80 hover:opacity-100'}"
		>
			{#if copied}
				<Check size={13} class="animate-scale-in" />
				<span>¡Prompt Copiado!</span>
			{:else}
				<ClipboardCopy size={13} />
				<span>Copiar Contexto IA</span>
			{/if}
		</button>
	</div>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		<div
			class="border-base-400/50 bg-base-100/30 hover:border-primary-100/30 flex flex-col justify-between gap-2 rounded-lg border p-4 transition-colors"
		>
			<div>
				<span
					class="text-content mb-3 block text-[10px] font-bold tracking-wider uppercase opacity-50"
				>
					Aritmética
				</span>
				<ul class="text-content/80 flex flex-col gap-2 font-mono text-sm">
					{#each [['+', 'Suma'], ['-', 'Resta'], ['*', 'Multiplicación'], ['/', 'División'], ['**', 'Potencia']] as [op, label] (op)}
						<li class="flex items-center gap-3">
							<span
								class="bg-primary-100/10 text-primary-100 flex h-6 min-w-6 items-center justify-center rounded px-1 font-bold"
							>
								{op}
							</span>
							<span>{label}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div class="bg-base-400/20 text-content/60 mt-3 rounded p-2 font-mono text-xs">
				<span class="text-primary-100/60">Ej:</span> NF = PC * 0.6 + Cert ** 2 / 100
			</div>
		</div>

		<div
			class="border-base-400/50 bg-base-100/30 hover:border-primary-100/30 flex flex-col justify-between gap-2 rounded-lg border p-4 transition-colors"
		>
			<div>
				<span
					class="text-content mb-3 block text-[10px] font-bold tracking-wider uppercase opacity-50"
				>
					Comparación y Asignación
				</span>
				<ul class="text-content/80 flex flex-col gap-2 font-mono text-sm">
					{#each [['>=', 'Mayor o igual'], ['<=', 'Menor o igual'], ['>', 'Mayor que'], ['<', 'Menor que'], ['=', 'Asignación']] as [op, label] (op)}
						<li class="flex items-center gap-3">
							<span
								class="bg-primary-100/10 text-primary-100 flex h-6 min-w-8 items-center justify-center rounded px-1 font-bold"
							>
								{op}
							</span>
							<span>{label}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div class="bg-base-400/20 text-content/60 mt-3 rounded p-2 font-mono text-xs">
				<span class="text-primary-100/60">Ej:</span> PC = prom(C1, C2)
			</div>
		</div>

		<div
			class="border-base-400/50 bg-base-100/30 hover:border-primary-100/30 flex flex-col justify-between gap-2 rounded-lg border p-4 transition-colors"
		>
			<div>
				<span
					class="text-content mb-3 block text-[10px] font-bold tracking-wider uppercase opacity-50"
				>
					Funciones
				</span>
				<ul class="text-content/80 flex flex-col gap-2 font-mono text-sm">
					{#each [['prom()', 'Promedio aritmético'], ['cada()', 'Todos deben cumplir (Mínimo)'], ['escalon()', 'Escalón unitario (1 si >= 0, sino 0)']] as [fn, label] (fn)}
						<li class="flex items-center gap-3">
							<span
								class="bg-primary-100/10 text-primary-100 flex h-6 items-center justify-center rounded px-2 text-xs font-bold"
							>
								{fn}
							</span>
							<span class="text-xs">{label}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div class="mt-3 flex flex-col gap-1">
				<div class="bg-base-400/20 text-content/60 rounded p-2 font-mono text-xs">
					<span class="text-primary-100/60">Ej:</span> cada(L1, L2, L3) >= 20
				</div>
				<div class="bg-base-400/20 text-content/60 rounded p-2 font-mono text-xs">
					<span class="text-primary-100/60">Ej:</span> Aprobado = escalon(NF - 55)
				</div>
			</div>
		</div>

		<div
			class="border-base-400/50 bg-base-100/30 hover:border-primary-100/30 flex flex-col justify-between gap-2 rounded-lg border p-4 transition-colors"
		>
			<div>
				<span
					class="text-content mb-3 block text-[10px] font-bold tracking-wider uppercase opacity-50"
				>
					Dominios (Límites)
				</span>
				<ul class="text-content/80 flex flex-col gap-2 font-mono text-sm">
					<li class="flex items-start gap-3">
						<span
							class="bg-primary-100/10 text-primary-100 mt-0.5 flex h-6 shrink-0 items-center justify-center rounded px-2 text-xs font-bold"
							>dominio</span
						>
						<span class="text-xs">Sintaxis clásica con corchetes</span>
					</li>
					<li class="flex items-start gap-3">
						<span
							class="bg-primary-100/10 text-primary-100 mt-0.5 flex h-6 shrink-0 items-center justify-center rounded px-2 text-xs font-bold"
							>in</span
						>
						<span class="text-xs">Sintaxis alternativa equivalente</span>
					</li>
				</ul>
			</div>
			<div class="mt-3 flex flex-col gap-1">
				<div class="bg-base-400/20 text-content/60 rounded p-2 font-mono text-xs">
					<span class="text-primary-100/60">Ej:</span> dominio C1, C2 [0, 100]
				</div>
				<div class="bg-base-400/20 text-content/60 rounded p-2 font-mono text-xs">
					<span class="text-primary-100/60">Ej:</span> C1, C2 in [1.0, 7.0]
				</div>
			</div>
		</div>

		<div
			class="border-base-400/50 bg-base-100/30 hover:border-primary-100/30 flex flex-col justify-between gap-2 rounded-lg border p-4 transition-colors"
		>
			<div>
				<span
					class="text-content mb-3 block text-[10px] font-bold tracking-wider uppercase opacity-50"
				>
					Etiquetas (Labels)
				</span>
				<p class="text-content/70 font-mono text-xs leading-relaxed">
					Asigna un nombre legible a cualquier regla usando <span class="text-primary-100 font-bold"
						>Nombre:</span
					> antes de la expresión. La etiqueta aparece en la UI y en el panel de estado.
				</p>
			</div>
			<div class="mt-3 flex flex-col gap-1">
				<div class="bg-base-400/20 text-content/60 rounded p-2 font-mono text-xs">
					<span class="text-primary-100/60">Ej:</span> Nota Final: NF = PC * 0.6
				</div>
				<div class="bg-base-400/20 text-content/60 rounded p-2 font-mono text-xs">
					<span class="text-primary-100/60">Ej:</span> Minimo Labs: cada(L1, L2) >= 20
				</div>
			</div>
		</div>

		<div
			class="border-base-400/50 bg-base-100/30 hover:border-primary-100/30 flex flex-col justify-between gap-2 rounded-lg border p-4 transition-colors"
		>
			<div>
				<span
					class="text-content mb-3 block text-[10px] font-bold tracking-wider uppercase opacity-50"
				>
					Variables Cultivadas / Calculadas
				</span>
				<p class="text-content/70 font-mono text-xs leading-relaxed">
					Una variable definida con <span class="text-primary-100 font-bold">=</span> se convierte en
					un nodo calculado. No genera slider — su valor se resuelve automáticamente.
				</p>
			</div>
			<div class="mt-3 flex flex-col gap-1">
				<div class="bg-base-400/20 text-content/60 rounded p-2 font-mono text-xs">
					<span class="text-primary-100/60">Ej:</span> PC = prom(C1, C2)
				</div>
				<div class="bg-base-400/20 text-content/60 rounded p-2 font-mono text-xs">
					<span class="text-primary-100/60">Ej:</span> NF = PC * 0.6 + Cert * 0.4
				</div>
			</div>
		</div>
	</div>
</div>
