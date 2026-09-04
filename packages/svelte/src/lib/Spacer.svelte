<script module lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	export interface SpacerProps extends HTMLAttributes<HTMLSpanElement> {
		element?: HTMLSpanElement | null;
		size: number | string;
	}
</script>

<script lang="ts">
	import { mergeStyles } from "./styles.js";

	let {
		class: className,
		element = $bindable(null),
		size,
		style,
		...spanProps
	}: SpacerProps = $props();
	const cssSize = $derived(typeof size === "number" ? `${size}px` : size);
	const mergedStyle = $derived(mergeStyles(`--sensation-spacer-size:${cssSize}`, style));
</script>

<span
	{...spanProps}
	aria-hidden="true"
	bind:this={element}
	class={["sensation-spacer", className]}
	style={mergedStyle}
></span>

<style>
	.sensation-spacer {
		display: block;
		box-sizing: border-box;
		inline-size: var(--sensation-spacer-size);
		block-size: var(--sensation-spacer-size);
		flex: none;
	}
</style>
