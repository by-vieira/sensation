<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
		element?: HTMLDivElement | null;
		elevation?: number;
		transparency?: number;
	}
</script>

<script lang="ts">
	import { mergeStyles } from "./styles.js";
	import { getThemeState } from "./theme-context.js";

	let {
		children,
		class: className,
		element = $bindable(null),
		elevation = 0,
		style,
		transparency = 0,
		...divProps
	}: PanelProps = $props();
	const themeState = getThemeState();
	const theme = $derived(themeState.current);
	const opacity = $derived(1 - Math.min(Math.max(transparency, 0), 1));
	const mergedStyle = $derived(
		mergeStyles(
			`--sensation-panel-bg:${theme.bg};--sensation-panel-radius:${theme.effects.panelRadius};--sensation-effect-shadow-color:${theme.effects.shadow};--sensation-effect-shadow-thickness:${theme.effects.shadowThickness};opacity:${opacity}`,
			style,
		),
	);
</script>

<div
	{...divProps}
	bind:this={element}
	class={[
		"sensation-panel",
		elevation < 0 ? "sensation-effect--shadow-inset" : "sensation-effect--shadow-raised",
		className,
	]}
	data-sensation-depth={theme.zDepth}
	style={mergedStyle}
>
	{@render children?.()}
</div>

<style>
	.sensation-panel {
		box-sizing: border-box;
		border-radius: var(--sensation-panel-radius);
		background: var(--sensation-panel-bg);
	}
</style>
