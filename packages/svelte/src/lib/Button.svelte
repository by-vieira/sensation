<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	export interface ButtonProps extends HTMLButtonAttributes {
		align?: "start" | "center";
		children?: Snippet;
		element?: HTMLButtonElement | null;
		flat?: boolean;
		illuminated?: boolean;
		loading?: boolean;
		subtle?: boolean;
	}
</script>

<script lang="ts">
	import { withZOffset } from "@morgan-vieira-npm/sensation-theme";
	import { onDestroy } from "svelte";
	import { createButtonGesture } from "./button-gesture.js";
	import type { ButtonGesture } from "./button-gesture.js";
	import sheenImage from "./sheen.png";
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
		illuminated = false,
		loading = false,
		onpointercancel,
		onpointerdown,
		onpointerenter,
		onpointerleave,
		onpointermove,
		onpointerup,
		style,
		subtle = false,
		...buttonProps
	}: ButtonProps = $props();
	let gesture: ButtonGesture | null = null;
	const parent = getThemeState();
	const raisedTheme = $derived(withZOffset(parent.current, 1));
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
				`--sensation-button-focus:${parent.current.focus}`,
				`--sensation-button-focus-gap:${parent.current.bg}`,
				`--sensation-button-overlay:${raisedTheme.pureAtopBg}`,
				`--sensation-button-accent-overlay:${raisedTheme.pureAtopAccentAtopBg}`,
				`--sensation-button-radius:${parent.current.effects.controlRadius}`,
				`--sensation-button-bevel-highlight:${parent.current.effects.bevelHighlight}`,
				`--sensation-button-bevel-shadow:${parent.current.effects.bevelShadow}`,
				`--sensation-button-motion:${parent.current.motion.responsiveDuration}`,
				`--sensation-button-motion-reduced:${parent.current.motion.reducedDuration}`,
				`--sensation-button-easing:${parent.current.motion.easing}`,
				`--sensation-button-sheen-image:url("${sheenImage}")`,
			].join(";"),
			style,
		),
	);

	type ButtonPointerEvent = PointerEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};

	function getGesture(button: HTMLButtonElement): ButtonGesture {
		gesture ??= createButtonGesture(button);
		return gesture;
	}

	function handlePointerCancel(event: ButtonPointerEvent): void {
		getGesture(event.currentTarget).pointerCancel(event);
		onpointercancel?.(event);
	}

	function handlePointerDown(event: ButtonPointerEvent): void {
		getGesture(event.currentTarget).pointerDown(event);
		onpointerdown?.(event);
	}

	function handlePointerEnter(event: ButtonPointerEvent): void {
		getGesture(event.currentTarget).pointerEnter(event);
		onpointerenter?.(event);
	}

	function handlePointerMove(event: ButtonPointerEvent): void {
		getGesture(event.currentTarget).pointerMove(event);
		onpointermove?.(event);
	}

	function handlePointerLeave(event: ButtonPointerEvent): void {
		getGesture(event.currentTarget).pointerLeave(event);
		onpointerleave?.(event);
	}

	function handlePointerUp(event: ButtonPointerEvent): void {
		getGesture(event.currentTarget).pointerUp(event);
		onpointerup?.(event);
	}

	$effect(() => {
		gesture?.setEnabled(!(disabled || loading));
	});

	onDestroy(() => gesture?.destroy());
</script>

<button
	{...buttonProps}
	aria-busy={loading ? true : ariaBusy}
	bind:this={element}
	class={[
		"sensation-button",
		`sensation-button--${align}`,
		flat && "sensation-button--flat",
		illuminated && "sensation-button--illuminated",
		loading && "sensation-button--loading",
		subtle && "sensation-button--subtle",
		className,
	]}
	disabled={disabled || loading}
	onpointercancel={handlePointerCancel}
	onpointerdown={handlePointerDown}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	style={mergedStyle}
>
	<span class="sensation-button__content">{@render children?.()}</span>
	{#if loading}<span aria-hidden="true" class="sensation-button__loading-mark">•••</span>{/if}
	<span aria-hidden="true" class="sensation-button__sheen"></span>
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
		box-shadow:
			inset 0 1px var(--sensation-button-bevel-highlight),
			inset 0 -1px var(--sensation-button-bevel-shadow);
		color: var(--sensation-button-fg);
		cursor: pointer;
		font-family: system-ui, sans-serif;
		font-size: 14px;
		font-weight: 400;
		line-height: 1.2;
		text-align: center;
		transition:
			background-color var(--sensation-button-motion) var(--sensation-button-easing),
			box-shadow var(--sensation-button-motion) var(--sensation-button-easing),
			color var(--sensation-button-motion) var(--sensation-button-easing);
	}

	.sensation-button__sheen {
		position: absolute;
		top: var(--sensation-button-pointer-y, 50%);
		left: var(--sensation-button-pointer-x, 50%);
		width: var(--sensation-button-sheen-size, 400%);
		height: var(--sensation-button-sheen-size, 400%);
		border-radius: 50%;
		background-color: var(--sensation-button-overlay);
		-webkit-mask: var(--sensation-button-sheen-image) center / contain no-repeat;
		mask: var(--sensation-button-sheen-image) center / contain no-repeat;
		opacity: var(--sensation-button-sheen-opacity, 0);
		pointer-events: none;
		transform: translate(-50%, -50%) scale(var(--sensation-button-sheen-scale, 1));
		transform-origin: center;
	}

	.sensation-button:focus-visible {
		outline: 2px solid var(--sensation-button-focus);
		outline-offset: 2px;
		box-shadow:
			0 0 0 1px var(--sensation-button-focus-gap),
			inset 0 1px var(--sensation-button-bevel-highlight),
			inset 0 -1px var(--sensation-button-bevel-shadow);
	}

	.sensation-button--start {
		justify-items: start;
		text-align: start;
	}

	.sensation-button--illuminated,
	.sensation-button[aria-pressed="true"] {
		background: var(--sensation-button-accent-bg);
		color: var(--sensation-button-accent-fg);
	}

	.sensation-button--illuminated .sensation-button__sheen,
	.sensation-button[aria-pressed="true"] .sensation-button__sheen {
		background-color: var(--sensation-button-accent-overlay);
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
		box-shadow:
			inset 0 1px var(--sensation-button-bevel-highlight),
			inset 0 -1px var(--sensation-button-bevel-shadow);
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
		box-shadow:
			inset 0 1px var(--sensation-button-bevel-highlight),
			inset 0 -1px var(--sensation-button-bevel-shadow);
		color: var(--sensation-button-accent-fg);
	}

	.sensation-button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.sensation-button:disabled .sensation-button__sheen {
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
