<script lang="ts">
	import { Check, ClipboardCopy } from '@lucide/svelte';
	import { DSL_DESCRIPTOR, buildAIContextPrompt } from '@ramo-libre/dsl-parser';

	let copied = $state(false);

	function handleCopyPrompt() {
		if (copied) return;

		const promptText = buildAIContextPrompt();
		navigator.clipboard.writeText(promptText.trim()).then(() => {
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

	<div class="flex flex-col gap-4">
		{#each DSL_DESCRIPTOR.rows as row, i (i)}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each row as card, j (j)}
					<div
						class="border-base-400/50 bg-base-100/30 hover:border-primary-100/30 flex flex-col justify-between gap-2 rounded-lg border p-4 transition-colors"
					>
						<div>
							<span
								class="text-content mb-3 block text-[10px] font-bold tracking-wider uppercase opacity-50"
							>
								{card.title}
							</span>

							{#if card.tokens}
								<ul class="text-content/80 flex flex-col gap-2 font-mono text-sm">
									{#each card.tokens as token (token.symbol)}
										<li class="flex items-center gap-3">
											<span
												class="bg-primary-100/10 text-primary-100 flex h-6 min-w-8 shrink-0 items-center justify-center rounded px-2 text-xs font-bold"
											>
												{token.symbol}
											</span>
											<span class="text-xs">{token.label}</span>
										</li>
									{/each}
								</ul>
							{/if}

							{#if card.functions}
								<ul class="text-content/80 flex flex-col gap-2 font-mono text-sm">
									{#each card.functions as fn (fn.name)}
										<li class="flex items-center gap-3" title={fn.description}>
											<span
												class="bg-primary-100/10 text-primary-100 flex h-6 shrink-0 items-center justify-center rounded px-2 text-xs font-bold"
											>
												{fn.name}
											</span>
											<span class="text-xs">{fn.label}</span>
										</li>
									{/each}
								</ul>
							{/if}

							{#if card.description && !card.functions && !card.tokens}
								<p class="text-content/70 font-mono text-xs leading-relaxed">
									{card.description}
								</p>
							{/if}
						</div>

						{#if card.examples && card.examples.length > 0}
							<div class="mt-3 flex flex-col gap-1">
								{#each card.examples as example, k (k)}
									<div class="bg-base-400/20 text-content/60 rounded p-2 font-mono text-xs">
										<span class="text-primary-100/60">Ej:</span>
										{example}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
