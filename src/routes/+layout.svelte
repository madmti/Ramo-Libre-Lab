<script lang="ts">
	import './layout.css';
	import './custom.css';
	import favicon from '$lib/assets/favicon.svg';

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
	<title>Ramo Libre Lab</title>
	<meta name="theme-color" content="#ffffff" id="theme-meta" />
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="h-dvh w-full text-content">
	{@render children()}
</div>
