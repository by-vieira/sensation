<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	export type TextVariant = "normal" | "grey" | "heading" | "accent" | "atopAccent";
	export type TextAlignment = "start" | "mid" | "end";

	export interface TextAlign {
		x?: TextAlignment;
		y?: TextAlignment;
	}

	export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
		align?: TextAlign;
		children?: Snippet;
		element?: HTMLSpanElement | null;
		variant?: TextVariant;
	}
</script>

<script lang="ts">
	import { mergeStyles } from "./styles.js";
	import { getThemeState } from "./theme-context.js";

	let {
		align,
		children,
		class: className,
		element = $bindable(null),
		style,
		variant = "normal",
		...spanProps
	}: TextProps = $props();
	const themeState = getThemeState();
	const color = $derived(
		variant === "accent"
			? themeState.current.accentAtopBg
			: variant === "atopAccent"
				? themeState.current.fgAtopAccentAtopBg
				: variant === "grey"
					? themeState.current.greyAtopBg
					: themeState.current.fgAtopBg,
	);
	const textAlign = $derived(align?.x === "mid" ? "center" : (align?.x ?? "start"));
	const verticalLayout = $derived(
		align?.y === undefined
			? ""
			: `display:inline-grid;align-content:${align.y === "mid" ? "center" : align.y}`,
	);
	const mergedStyle = $derived(
		mergeStyles(`--sensation-text-color:${color};text-align:${textAlign};${verticalLayout}`, style),
	);
</script>

<span
	{...spanProps}
	bind:this={element}
	class={["sensation-text", `sensation-text--${variant}`, className]}
	style={mergedStyle}
>
	{@render children?.()}
</span>

<style>
	.sensation-text {
		box-sizing: border-box;
		padding-inline: 2px;
		color: var(--sensation-text-color);
		font-family: system-ui, sans-serif;
		font-size: 14px;
		font-weight: 400;
		line-height: 1.2;
	}

	.sensation-text--heading {
		font-size: 21px;
	}
</style>
