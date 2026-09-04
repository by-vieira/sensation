<script module lang="ts">
	import type { IconRenderContext } from "@morgan-vieira-npm/sensation-theme";
	import type { Snippet } from "svelte";
	import type { HTMLDetailsAttributes } from "svelte/elements";

	export interface ExpanderProps extends Omit<HTMLDetailsAttributes, "title"> {
		children?: Snippet;
		element?: HTMLDetailsElement | null;
		icon?: Snippet<[IconRenderContext]>;
		title: string;
	}
</script>

<script lang="ts">
	import { createIconTheme, withZOffset } from "@morgan-vieira-npm/sensation-theme";
	import GestureSheen from "./GestureSheen.svelte";
	import { gestureSurface } from "./gesture-surface.js";
	import IconSlot from "./IconSlot.svelte";
	import ThemeDepth from "./ThemeDepth.svelte";
	import { mergeStyles } from "./styles.js";
	import { getThemeState } from "./theme-context.js";

	let {
		children,
		class: className,
		element = $bindable(null),
		icon,
		ontoggle,
		open = false,
		style,
		title,
		...detailsProps
	}: ExpanderProps = $props();
	let iconAnimation = $state(0);
	let previousOpen = false;
	let hasTrackedOpen = false;
	const parent = getThemeState();
	const panelTheme = $derived(withZOffset(parent.current, 1));
	const iconColors = $derived(
		createIconTheme(panelTheme, {
			background: "bg",
			foreground: "accent",
			style: "trio",
		}),
	);
	const iconContext = $derived({
		animation: iconAnimation,
		colors: iconColors,
		theme: panelTheme,
	});
	const mergedStyle = $derived(
		mergeStyles(
			[
				`--sensation-expander-bg:${panelTheme.bg}`,
				`--sensation-expander-fg:${panelTheme.fgAtopBg}`,
				`--sensation-expander-accent:${panelTheme.accentAtopBg}`,
				`--sensation-expander-radius:${panelTheme.effects.panelRadius}`,
				`--sensation-effect-shadow-color:${panelTheme.effects.shadow}`,
				`--sensation-effect-shadow-thickness:${panelTheme.effects.shadowThickness}`,
				`--sensation-effect-halo-color:${panelTheme.focus}`,
				`--sensation-effect-halo-thickness:${panelTheme.effects.haloThickness}`,
				`--sensation-effect-halo-offset:${panelTheme.effects.haloOffset}`,
				`--sensation-effect-motion:${panelTheme.motion.responsiveDuration}`,
				`--sensation-effect-motion-reduced:${panelTheme.motion.reducedDuration}`,
				`--sensation-effect-easing:${panelTheme.motion.easing}`,
				`--sensation-gesture-color:${panelTheme.pureAtopBg}`,
				`--sensation-expander-motion:${panelTheme.motion.responsiveDuration}`,
				`--sensation-expander-motion-reduced:${panelTheme.motion.reducedDuration}`,
				`--sensation-expander-easing:${panelTheme.motion.easing}`,
			].join(";"),
			style,
		),
	);

	function handleToggle(
		event: ToggleEvent & { currentTarget: EventTarget & HTMLDetailsElement },
	): void {
		if (!hasTrackedOpen) previousOpen = Boolean(open);
		if (event.currentTarget.open !== previousOpen) iconAnimation += 1;
		previousOpen = event.currentTarget.open;
		hasTrackedOpen = true;
		ontoggle?.(event);
	}

	$effect(() => {
		const initialOpen = Boolean(open);
		queueMicrotask(() => {
			if (!hasTrackedOpen) {
				previousOpen = initialOpen;
				hasTrackedOpen = true;
			}
		});
	});
</script>

<ThemeDepth offset={1}>
	<details
		{...detailsProps}
		bind:this={element}
		class={["sensation-expander", "sensation-effect--shadow-raised", className]}
		ontoggle={handleToggle}
		{open}
		style={mergedStyle}
	>
		<summary class="sensation-expander__summary sensation-effect--halo" use:gestureSurface>
			{#if icon !== undefined}
				<IconSlot class="sensation-expander__icon" context={iconContext} {icon} />
			{/if}
			<span class="sensation-expander__title">{title}</span>
			{#if icon === undefined}
				<svg aria-hidden="true" class="sensation-expander__chevron" viewBox="0 0 16 16">
					<path d="m6 4 4 4-4 4"></path>
				</svg>
			{/if}
			<GestureSheen />
		</summary>
		<div class="sensation-expander__content">{@render children?.()}</div>
	</details>
</ThemeDepth>

<style>
	.sensation-expander {
		box-sizing: border-box;
		interpolate-size: allow-keywords;
		overflow: clip;
		border-radius: var(--sensation-expander-radius);
		background: var(--sensation-expander-bg);
		color: var(--sensation-expander-fg);
		font-family: system-ui, sans-serif;
		font-size: 14px;
		line-height: 1.2;
	}

	.sensation-expander__summary {
		position: relative;
		display: flex;
		box-sizing: border-box;
		block-size: 24px;
		align-items: center;
		gap: 4px;
		overflow: hidden;
		margin: 4px;
		padding: 4px;
		border-radius: var(--sensation-expander-radius);
		color: var(--sensation-expander-accent);
		cursor: pointer;
		list-style: none;
	}

	.sensation-expander__summary::-webkit-details-marker {
		display: none;
	}

	.sensation-expander__title {
		position: relative;
		z-index: 3;
		min-inline-size: 0;
		flex: 1;
	}

	.sensation-expander__icon {
		position: relative;
		z-index: 3;
	}

	.sensation-expander__chevron {
		position: relative;
		z-index: 3;
		inline-size: 16px;
		block-size: 16px;
		flex: none;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.5;
		transition: transform var(--sensation-expander-motion) var(--sensation-expander-easing);
	}

	.sensation-expander[open] .sensation-expander__chevron {
		transform: rotate(90deg);
	}

	.sensation-expander__content {
		box-sizing: border-box;
		min-inline-size: 0;
	}

	.sensation-expander::details-content {
		block-size: 0;
		overflow-y: clip;
		opacity: 0;
		transition:
			block-size var(--sensation-expander-motion) var(--sensation-expander-easing),
			content-visibility var(--sensation-expander-motion) allow-discrete,
			opacity var(--sensation-expander-motion) var(--sensation-expander-easing);
	}

	.sensation-expander[open]::details-content {
		block-size: auto;
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.sensation-expander__chevron,
		.sensation-expander::details-content {
			transition-duration: var(--sensation-expander-motion-reduced);
		}
	}
</style>
