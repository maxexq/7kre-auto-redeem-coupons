<script lang="ts">
	import type { Snippet } from 'svelte';
	
	interface Props {
		children: Snippet;
	}
	
	let { children }: Props = $props();
</script>

<svelte:head>
	<title>Seven Knights Re:BIRTH - Coupon Redemption</title>
	<meta name="description" content="Redeem your Seven Knights Rebirth coupon codes automatically" />
</svelte:head>

{@render children()}

<style>
	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(body) {
		font-family: 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: linear-gradient(180deg, #fff5f5 0%, #ffffff 100%);
		min-height: 100vh;
		color: #333;
	}

	:global(input) {
		font-family: inherit;
	}

	:global(button) {
		font-family: inherit;
		cursor: pointer;
	}
</style>

