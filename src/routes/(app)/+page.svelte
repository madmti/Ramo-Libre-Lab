<script lang="ts">
	import Dominios from './_components/Dominios.svelte';
	import Estado from './_components/Estado.svelte';
	import Header from './_components/Header.svelte';
	import Sistema from './_components/Sistema.svelte';
	import Variables from './_components/Variables.svelte';
</script>

<Header />

<div class="mt-6 flex flex-col gap-6 xl:grid xl:grid-cols-12 xl:items-start">
	<div class="contents xl:col-span-8 xl:flex xl:flex-col xl:gap-6">
		<div class="order-3 xl:order-0">
			<Sistema />
		</div>
		<div class="order-2 xl:order-0">
			<Variables />
		</div>
	</div>

	<div class="contents xl:col-span-4 xl:flex xl:flex-col xl:gap-6">
		<div class="order-1 xl:order-0">
			<Estado />
		</div>
		<div class="order-4 xl:order-0">
			<Dominios />
		</div>
	</div>
</div>
