<script module lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
		element?: HTMLDivElement | null;
		orientation?: "horizontal" | "vertical";
	}
</script>

<script lang="ts">
	import { mergeStyles } from "./styles.js";
	import { getThemeState } from "./theme-context.js";

	let {
		class: className,
		element = $bindable(null),
		orientation = "horizontal",
		style,
		...divProps
	}: DividerProps = $props();
	const themeState = getThemeState();
	const mergedStyle = $derived(
		mergeStyles(`--sensation-divider-color:${themeState.current.fgAtopBg}`, style),
	);
</script>

<div
	{...divProps}
	aria-orientation={orientation}
	bind:this={element}
	class={["sensation-divider", `sensation-divider--${orientation}`, className]}
	role="separator"
	style={mergedStyle}
></div>

<style>
	.sensation-divider {
		box-sizing: border-box;
		flex: none;
		border: 0;
		background: var(--sensation-divider-color);
		opacity: 0.2;
	}

	.sensation-divider--horizontal {
		inline-size: 100%;
		block-size: 1px;
	}

	.sensation-divider--vertical {
		inline-size: 1px;
		block-size: 100%;
	}
</style>
