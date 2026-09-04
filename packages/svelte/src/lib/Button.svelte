<script module lang="ts">
	import type { IconRenderContext } from "@morgan-vieira-npm/sensation-theme";
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	export interface ButtonProps extends HTMLButtonAttributes {
		align?: "start" | "center";
		children?: Snippet;
		element?: HTMLButtonElement | null;
		flat?: boolean;
		icon?: Snippet<[IconRenderContext]>;
		illuminated?: boolean;
		loading?: boolean;
		subtle?: boolean;
	}
</script>

<script lang="ts">
	import { createIconTheme, withZOffset } from "@morgan-vieira-npm/sensation-theme";
	import GestureSheen from "./GestureSheen.svelte";
	import { gestureSurface } from "./gesture-surface.js";
	import IconSlot from "./IconSlot.svelte";
	import { mergeStyles } from "./styles.js";
	import { getThemeState } from "./theme-context.js";

	let {
		"aria-busy": ariaBusy,
		align = "center",
		children,
		class: className,
		disabled = false,
		element = $bindable(null),
		flat = false,
		icon,
		illuminated = false,
		loading = false,
		onclick,
		onpointerenter,
		onpointerleave,
		style,
		subtle = false,
		...buttonProps
	}: ButtonProps = $props();
	let hovering = $state(false);
	let iconAnimation = $state(0);
	let previousIlluminated = false;
	let hasTrackedIllumination = false;
	const parent = getThemeState();
	const raisedTheme = $derived(withZOffset(parent.current, 1));
	const buttonTheme = $derived(flat || (subtle && !hovering) ? parent.current : raisedTheme);
	const iconColors = $derived(
		createIconTheme(buttonTheme, {
			background: illuminated ? "accentAtopBg" : "bg",
			foreground: subtle && !hovering ? "grey" : "fg",
			style: "trio",
		}),
	);
	const iconContext = $derived({
		animation: iconAnimation,
		colors: iconColors,
		theme: buttonTheme,
	});
	const mergedStyle = $derived(
		mergeStyles(
			[
				`--sensation-button-bg:${raisedTheme.bg}`,
				`--sensation-button-fg:${raisedTheme.fgAtopBg}`,
				`--sensation-button-accent-bg:${raisedTheme.accentAtopBg}`,
				`--sensation-button-accent-fg:${raisedTheme.fgAtopAccentAtopBg}`,
				`--sensation-button-flat-bg:${parent.current.bg}`,
				`--sensation-button-flat-fg:${parent.current.fgAtopBg}`,
				`--sensation-button-flat-accent-bg:${parent.current.accentAtopBg}`,
				`--sensation-button-flat-accent-fg:${parent.current.fgAtopAccentAtopBg}`,
				`--sensation-button-grey:${parent.current.greyAtopBg}`,
				`--sensation-button-accent-overlay:${raisedTheme.pureAtopAccentAtopBg}`,
				`--sensation-button-radius:${parent.current.effects.controlRadius}`,
				`--sensation-effect-bevel-highlight:${parent.current.effects.bevelHighlight}`,
				`--sensation-effect-bevel-shadow:${parent.current.effects.bevelShadow}`,
				`--sensation-effect-bevel-thickness:${parent.current.effects.bevelThickness}`,
				`--sensation-effect-halo-color:${parent.current.focus}`,
				`--sensation-effect-halo-thickness:${parent.current.effects.haloThickness}`,
				`--sensation-effect-halo-offset:${parent.current.effects.haloOffset}`,
				`--sensation-effect-motion:${parent.current.motion.responsiveDuration}`,
				`--sensation-effect-motion-reduced:${parent.current.motion.reducedDuration}`,
				`--sensation-effect-easing:${parent.current.motion.easing}`,
				`--sensation-gesture-color:${raisedTheme.pureAtopBg}`,
				`--sensation-button-motion:${parent.current.motion.responsiveDuration}`,
				`--sensation-button-motion-reduced:${parent.current.motion.reducedDuration}`,
				`--sensation-button-easing:${parent.current.motion.easing}`,
			].join(";"),
			style,
		),
	);

	type ButtonPointerEvent = PointerEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};

	function handlePointerEnter(event: ButtonPointerEvent): void {
		if (event.pointerType !== "touch") hovering = true;
		onpointerenter?.(event);
	}

	function handlePointerLeave(event: ButtonPointerEvent): void {
		if (event.pointerType !== "touch") hovering = false;
		onpointerleave?.(event);
	}

	function handleClick(
		event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement },
	): void {
		iconAnimation += 1;
		onclick?.(event);
	}

	$effect(() => {
		if (hasTrackedIllumination && illuminated && !previousIlluminated) iconAnimation += 1;
		previousIlluminated = illuminated;
		hasTrackedIllumination = true;
	});
</script>

<button
	{...buttonProps}
	aria-busy={loading ? true : ariaBusy}
	bind:this={element}
	class={[
		"sensation-button",
		"sensation-effect--bevel-raised",
		"sensation-effect--halo",
		`sensation-button--${align}`,
		flat && "sensation-button--flat",
		illuminated && "sensation-button--illuminated",
		loading && "sensation-button--loading",
		subtle && "sensation-button--subtle",
		className,
	]}
	disabled={disabled || loading}
	onclick={handleClick}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	style={mergedStyle}
	use:gestureSurface={!disabled && !loading}
>
	<span class="sensation-button__content">
		{#if icon !== undefined}<IconSlot context={iconContext} {icon} />{/if}
		{@render children?.()}
	</span>
	{#if loading}<span aria-hidden="true" class="sensation-button__loading-mark">•••</span>{/if}
	<GestureSheen />
</button>

<style>
	.sensation-button {
		position: relative;
		display: inline-grid;
		box-sizing: border-box;
		min-inline-size: max-content;
		min-block-size: 24px;
		place-items: center;
		overflow: hidden;
		padding: 2px 6px;
		border: 0;
		border-radius: var(--sensation-button-radius);
		appearance: none;
		background: var(--sensation-button-bg);
		color: var(--sensation-button-fg);
		cursor: pointer;
		font-family: system-ui, sans-serif;
		font-size: 14px;
		font-weight: 400;
		line-height: 1.2;
		text-align: center;
		--sensation-effect-extra-transitions:
			background-color var(--sensation-button-motion) var(--sensation-button-easing),
			box-shadow var(--sensation-button-motion) var(--sensation-button-easing),
			color var(--sensation-button-motion) var(--sensation-button-easing);
	}

	.sensation-button--start {
		justify-items: start;
		text-align: start;
	}

	.sensation-button--illuminated,
	.sensation-button[aria-pressed="true"] {
		--sensation-gesture-color: var(--sensation-button-accent-overlay);
		background: var(--sensation-button-accent-bg);
		color: var(--sensation-button-accent-fg);
	}

	.sensation-button--flat {
		background: var(--sensation-button-flat-bg);
		box-shadow: none;
		color: var(--sensation-button-flat-fg);
	}

	.sensation-button--flat.sensation-button--illuminated,
	.sensation-button--flat[aria-pressed="true"] {
		background: var(--sensation-button-flat-accent-bg);
		color: var(--sensation-button-flat-accent-fg);
	}

	.sensation-button--subtle:not(.sensation-button--illuminated, [aria-pressed="true"]) {
		background: var(--sensation-button-flat-bg);
		box-shadow: none;
		color: var(--sensation-button-grey);
	}

	.sensation-button--subtle:not(.sensation-button--flat):hover {
		background: var(--sensation-button-bg);
		box-shadow: var(--sensation-effect-bevel-value);
		color: var(--sensation-button-fg);
	}

	.sensation-button--subtle.sensation-button--illuminated:not(.sensation-button--flat),
	.sensation-button--subtle[aria-pressed="true"]:not(.sensation-button--flat) {
		background: var(--sensation-button-flat-accent-bg);
		box-shadow: none;
		color: var(--sensation-button-flat-accent-fg);
	}

	.sensation-button--subtle.sensation-button--illuminated:not(.sensation-button--flat):hover,
	.sensation-button--subtle[aria-pressed="true"]:not(.sensation-button--flat):hover {
		background: var(--sensation-button-accent-bg);
		box-shadow: var(--sensation-effect-bevel-value);
		color: var(--sensation-button-accent-fg);
	}

	.sensation-button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.sensation-button:disabled :global(.sensation-gesture-sheen) {
		display: none;
	}

	.sensation-button__content,
	.sensation-button__loading-mark {
		grid-area: 1 / 1;
	}

	.sensation-button__content {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.sensation-button--loading .sensation-button__content {
		opacity: 0;
	}

	.sensation-button__loading-mark {
		letter-spacing: 1px;
	}

	@media (prefers-reduced-motion: reduce) {
		.sensation-button {
			transition-duration: var(--sensation-button-motion-reduced);
		}
	}
</style>
