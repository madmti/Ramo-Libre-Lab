<script lang="ts">
	import '@ramo-libre/ui-themes/tailwind.css';
	import { SuiteFavicons } from '@ramo-libre/ui-themes';

	let { children } = $props();

	$effect(() => {
		const root = document.documentElement;
		requestAnimationFrame(() => {
			const bgColor = getComputedStyle(root).getPropertyValue('--color-base-100');
			const meta = document.querySelector('meta[name="theme-color"]');
			if (meta) meta.setAttribute('content', bgColor);
		});
	});
</script>

<svelte:head>
	<title>RamoLibre LAB</title>
	<meta name="theme-color" content="#ffffff" id="theme-meta" />
	<link rel="icon" href={SuiteFavicons.lab} />
</svelte:head>

<div class="text-content h-dvh w-full">
	{@render children()}
</div>
