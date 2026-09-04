<script module lang="ts">
	import type { ChangeEventHandler, HTMLInputAttributes } from "svelte/elements";

	export interface SwitchProps extends Omit<
		HTMLInputAttributes,
		"checked" | "defaultChecked" | "type"
	> {
		checked: boolean;
		containerClass?: string;
		containerStyle?: string;
		description?: string;
		element?: HTMLInputElement | null;
		label?: string;
	}
</script>

<script lang="ts">
	import GestureSheen from "./GestureSheen.svelte";
	import { animateSwitchSmudge, gestureSurface } from "./gesture-surface.js";
	import { mergeStyles } from "./styles.js";
	import { getThemeState } from "./theme-context.js";

	let {
		"aria-describedby": describedBy,
		checked,
		class: className,
		containerClass,
		containerStyle,
		description,
		disabled = false,
		element = $bindable(null),
		id,
		label,
		onchange,
		style,
		...inputProps
	}: SwitchProps = $props();
	let knob: HTMLSpanElement | null = null;
	let previousChecked = false;
	let hasTrackedChecked = false;
	const generatedId = $props.id();
	const themeState = getThemeState();
	const inputId = $derived(id ?? `sensation-switch-${generatedId}`);
	const descriptionId = $derived(description === undefined ? undefined : `${inputId}-description`);
	const mergedDescribedBy = $derived(
		[describedBy, descriptionId]
			.filter((value): value is string => typeof value === "string" && value.length > 0)
			.join(" ") || undefined,
	);
	const switchStyle = $derived(
		mergeStyles(
			[
				`--sensation-switch-label:${themeState.current.fgAtopBg}`,
				`--sensation-switch-description:${themeState.current.greyAtopBg}`,
				`--sensation-switch-off-bg:${themeState.current.greyAtopBg}`,
				`--sensation-switch-off-fg:${themeState.current.fgAtopGreyAtopBg}`,
				`--sensation-switch-on-bg:${themeState.current.accentAtopBg}`,
				`--sensation-switch-on-fg:${themeState.current.fgAtopAccentAtopBg}`,
				`--sensation-effect-bevel-highlight:${themeState.current.effects.bevelHighlight}`,
				`--sensation-effect-bevel-shadow:${themeState.current.effects.bevelShadow}`,
				`--sensation-effect-bevel-thickness:${themeState.current.effects.bevelThickness}`,
				`--sensation-effect-halo-color:${themeState.current.focus}`,
				`--sensation-effect-halo-thickness:${themeState.current.effects.haloThickness}`,
				`--sensation-effect-halo-offset:${themeState.current.effects.haloOffset}`,
				`--sensation-effect-motion:${themeState.current.motion.responsiveDuration}`,
				`--sensation-effect-motion-reduced:${themeState.current.motion.reducedDuration}`,
				`--sensation-effect-easing:${themeState.current.motion.easing}`,
				`--sensation-gesture-color:${themeState.current.pureAtopAccentAtopBg}`,
				`--sensation-switch-motion:${themeState.current.motion.responsiveDuration}`,
				`--sensation-switch-motion-reduced:${themeState.current.motion.reducedDuration}`,
				`--sensation-switch-easing:${themeState.current.motion.easing}`,
			].join(";"),
			containerStyle,
		),
	);

	function handleChange(event: Parameters<ChangeEventHandler<HTMLInputElement>>[0]): void {
		onchange?.(event);

		queueMicrotask(() => {
			if (element !== null) {
				element.checked = checked;
			}
		});
	}

	$effect(() => {
		if (hasTrackedChecked && checked !== previousChecked && knob !== null)
			animateSwitchSmudge(knob);
		previousChecked = checked;
		hasTrackedChecked = true;
	});
</script>

<label
	class={["sensation-switch", containerClass]}
	data-disabled={disabled || undefined}
	style={switchStyle}
>
	{#if label !== undefined || description !== undefined}
		<span class="sensation-switch__copy">
			{#if label !== undefined}<span class="sensation-switch__label">{label}</span>{/if}
			{#if description !== undefined}
				<span class="sensation-switch__description" id={descriptionId}>{description}</span>
			{/if}
		</span>
	{/if}
	<span class="sensation-switch__control sensation-effect--halo" use:gestureSurface={!disabled}>
		<input
			{...inputProps}
			aria-describedby={mergedDescribedBy}
			bind:this={element}
			{checked}
			class={["sensation-switch__input", className]}
			{disabled}
			id={inputId}
			onchange={handleChange}
			{style}
			type="checkbox"
		/>
		<span aria-hidden="true" class="sensation-switch__track sensation-effect--bevel-raised">
			<span bind:this={knob} class="sensation-switch__knob"></span>
		</span>
		<GestureSheen />
	</span>
</label>

<style>
	.sensation-switch {
		display: inline-flex;
		box-sizing: border-box;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		min-inline-size: 32px;
		color: var(--sensation-switch-label);
		cursor: pointer;
		font-family: system-ui, sans-serif;
		font-size: 14px;
		line-height: 1.2;
	}

	.sensation-switch__copy {
		display: grid;
		gap: 2px;
		min-inline-size: 0;
	}

	.sensation-switch__description {
		color: var(--sensation-switch-description);
		font-size: 12px;
	}

	.sensation-switch__control {
		position: relative;
		display: inline-block;
		inline-size: 32px;
		block-size: 16px;
		flex: 0 0 32px;
		overflow: hidden;
		border-radius: 999px;
	}

	.sensation-switch__input {
		position: absolute;
		inset: 0;
		z-index: 3;
		inline-size: 100%;
		block-size: 100%;
		margin: 0;
		opacity: 0;
		cursor: inherit;
	}

	.sensation-switch__track {
		position: absolute;
		inset: 0;
		border-radius: 999px;
		background: var(--sensation-switch-off-bg);
		transition: background-color var(--sensation-switch-motion) var(--sensation-switch-easing);
	}

	.sensation-switch__knob {
		position: absolute;
		inset-block-start: 2px;
		inset-inline-start: 2px;
		inline-size: 12px;
		block-size: 12px;
		border-radius: 50%;
		background: var(--sensation-switch-off-fg);
		transform-origin: center;
		transition:
			background-color var(--sensation-switch-motion) var(--sensation-switch-easing),
			transform var(--sensation-switch-motion) var(--sensation-switch-easing);
	}

	.sensation-switch__input:checked + .sensation-switch__track {
		background: var(--sensation-switch-on-bg);
	}

	.sensation-switch__input:checked + .sensation-switch__track .sensation-switch__knob {
		background: var(--sensation-switch-on-fg);
		transform: translateX(16px);
	}

	:global([dir="rtl"])
		.sensation-switch__input:checked
		+ .sensation-switch__track
		.sensation-switch__knob {
		transform: translateX(-16px);
	}

	.sensation-switch[data-disabled="true"] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	@media (prefers-reduced-motion: reduce) {
		.sensation-switch__track,
		.sensation-switch__knob {
			transition-duration: var(--sensation-switch-motion-reduced);
		}
	}
</style>
