<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLLiAttributes } from "svelte/elements";

	export interface BulletProps extends HTMLLiAttributes {
		children?: Snippet;
		element?: HTMLLIElement | null;
	}
</script>

<script lang="ts">
	import { mergeStyles } from "./styles.js";
	import { getThemeState } from "./theme-context.js";

	let {
		children,
		class: className,
		element = $bindable(null),
		style,
		...liProps
	}: BulletProps = $props();
	const themeState = getThemeState();
	const mergedStyle = $derived(
		mergeStyles(`--sensation-bullet-color:${themeState.current.fgAtopBg}`, style),
	);
</script>

<li {...liProps} bind:this={element} class={["sensation-bullet", className]} style={mergedStyle}>
	{@render children?.()}
</li>

<style>
	.sensation-bullet {
		position: relative;
		box-sizing: border-box;
		padding-inline-start: 12px;
		list-style: none;
	}

	.sensation-bullet::before {
		position: absolute;
		inset-block-start: 6px;
		inset-inline-start: 2px;
		inline-size: 4px;
		block-size: 4px;
		border-radius: 50%;
		background: var(--sensation-bullet-color);
		content: "";
	}
</style>
