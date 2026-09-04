<script module lang="ts">
	import type { IconRenderContext } from "@morgan-vieira-npm/sensation-theme";
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes, HTMLTextareaAttributes } from "svelte/elements";

	interface TextFieldSharedProps {
		containerClass?: string;
		containerStyle?: string;
		element?: TextFieldElement | null;
		error?: string;
		helpText?: string;
		icon?: Snippet<[IconRenderContext]>;
		jumbo?: boolean;
		label?: string;
	}

	export type TextFieldInputProps = TextFieldSharedProps &
		HTMLInputAttributes & {
			multiline?: false;
		};

	export type TextFieldTextareaProps = TextFieldSharedProps &
		HTMLTextareaAttributes & {
			multiline: true;
		};

	export type TextFieldProps = TextFieldInputProps | TextFieldTextareaProps;
	export type TextFieldElement = HTMLInputElement | HTMLTextAreaElement;
</script>

<script lang="ts">
	import { createIconTheme, withZOffset } from "@morgan-vieira-npm/sensation-theme";
	import GestureSheen from "./GestureSheen.svelte";
	import { gestureSurface } from "./gesture-surface.js";
	import IconSlot from "./IconSlot.svelte";
	import { mergeStyles } from "./styles.js";
	import { observeTextFieldOverflow } from "./text-field-overflow.js";
	import { getThemeState } from "./theme-context.js";

	let {
		"aria-describedby": describedBy,
		"aria-invalid": ariaInvalid,
		class: className,
		containerClass,
		containerStyle,
		disabled = false,
		element = $bindable(null),
		error,
		helpText,
		icon,
		id,
		jumbo = false,
		label,
		multiline = false,
		onblur,
		onfocus,
		placeholder,
		readonly = false,
		style,
		...controlProps
	}: TextFieldProps = $props();
	let focused = $state(false);
	let iconAnimation = $state(0);
	let inputArea: HTMLDivElement | null = null;
	const generatedId = $props.id();
	const parent = getThemeState();
	const fieldTheme = $derived(withZOffset(parent.current, -1));
	const iconColors = $derived(
		createIconTheme(fieldTheme, {
			background: "bg",
			foreground: "fg",
			style: "trio",
		}),
	);
	const iconContext = $derived({
		animation: iconAnimation,
		colors: iconColors,
		theme: fieldTheme,
	});
	const inputId = $derived(id ?? `sensation-field-${generatedId}`);
	const helpId = $derived(helpText === undefined ? undefined : `${inputId}-help`);
	const errorId = $derived(error === undefined ? undefined : `${inputId}-error`);
	const mergedDescribedBy = $derived(
		[describedBy, helpId, errorId]
			.filter((value): value is string => typeof value === "string" && value.length > 0)
			.join(" ") || undefined,
	);
	const inputProps = $derived(controlProps as HTMLInputAttributes);
	const textareaProps = $derived(controlProps as HTMLTextareaAttributes);
	const fieldStyle = $derived(
		mergeStyles(
			[
				`--sensation-field-bg:${fieldTheme.bg}`,
				`--sensation-field-fg:${fieldTheme.fgAtopBg}`,
				`--sensation-field-placeholder:${fieldTheme.fgAtopBg}`,
				`--sensation-field-error:${parent.current.errorAtopBg}`,
				`--sensation-field-radius:${parent.current.effects.controlRadius}`,
				`--sensation-effect-bevel-highlight:${parent.current.effects.bevelHighlight}`,
				`--sensation-effect-bevel-shadow:${parent.current.effects.bevelShadow}`,
				`--sensation-effect-bevel-thickness:${parent.current.effects.bevelThickness}`,
				`--sensation-effect-halo-color:${parent.current.focus}`,
				`--sensation-effect-halo-thickness:${parent.current.effects.haloThickness}`,
				`--sensation-effect-halo-offset:${parent.current.effects.haloOffset}`,
				`--sensation-effect-motion:${parent.current.motion.responsiveDuration}`,
				`--sensation-effect-motion-reduced:${parent.current.motion.reducedDuration}`,
				`--sensation-effect-easing:${parent.current.motion.easing}`,
				`--sensation-gesture-color:${fieldTheme.pureAtopBg}`,
				`--sensation-field-motion:${parent.current.motion.responsiveDuration}`,
				`--sensation-field-motion-reduced:${parent.current.motion.reducedDuration}`,
				`--sensation-field-easing:${parent.current.motion.easing}`,
			].join(";"),
			containerStyle,
		),
	);

	type FieldFocusEvent = FocusEvent & { currentTarget: EventTarget & TextFieldElement };

	function handleFocus(event: FieldFocusEvent): void {
		focused = true;
		iconAnimation += 1;
		onfocus?.(event as never);
	}

	function handleBlur(event: FieldFocusEvent): void {
		focused = false;
		onblur?.(event as never);
	}

	$effect(() => {
		if (element === null || inputArea === null) return;
		const observer = observeTextFieldOverflow(element, inputArea);
		return () => observer.destroy();
	});
</script>

<div
	class={[
		"sensation-text-field",
		jumbo && "sensation-text-field--jumbo",
		multiline && "sensation-text-field--multiline",
		containerClass,
	]}
	data-disabled={disabled || undefined}
	data-invalid={error !== undefined || undefined}
	data-readonly={readonly || undefined}
	style={fieldStyle}
>
	{#if label !== undefined}
		<label class="sensation-text-field__label" for={inputId}>{label}</label>
	{/if}
	<label
		class="sensation-text-field__control sensation-effect--bevel-inset sensation-effect--halo"
		data-sensation-halo-visible={error !== undefined || undefined}
		for={inputId}
		use:gestureSurface={!disabled && !focused}
	>
		{#if icon !== undefined}
			<IconSlot class="sensation-text-field__icon" context={iconContext} {icon} />
		{/if}
		<div bind:this={inputArea} class="sensation-text-field__input-area">
			{#if multiline}
				<textarea
					{...textareaProps}
					aria-describedby={mergedDescribedBy}
					aria-invalid={error === undefined ? ariaInvalid : true}
					bind:this={element}
					class={["sensation-text-field__input", className]}
					{disabled}
					id={inputId}
					onblur={handleBlur}
					onfocus={handleFocus}
					{placeholder}
					{readonly}
					{style}></textarea>
			{:else}
				<input
					{...inputProps}
					aria-describedby={mergedDescribedBy}
					aria-invalid={error === undefined ? ariaInvalid : true}
					bind:this={element}
					class={["sensation-text-field__input", className]}
					{disabled}
					id={inputId}
					onblur={handleBlur}
					onfocus={handleFocus}
					{placeholder}
					{readonly}
					{style}
				/>
			{/if}
			{#if placeholder !== undefined}
				<span aria-hidden="true" class="sensation-text-field__placeholder">{placeholder}</span>
			{/if}
			<span
				aria-hidden="true"
				class="sensation-text-field__scroll-fade sensation-text-field__scroll-fade--start"
			></span>
			<span
				aria-hidden="true"
				class="sensation-text-field__scroll-fade sensation-text-field__scroll-fade--end"
			></span>
		</div>
		<GestureSheen />
	</label>
	{#if helpText !== undefined}
		<span class="sensation-text-field__help" id={helpId}>{helpText}</span>
	{/if}
	{#if error !== undefined}
		<span class="sensation-text-field__error" id={errorId}>{error}</span>
	{/if}
</div>

<style>
	.sensation-text-field {
		display: grid;
		box-sizing: border-box;
		gap: 4px;
		min-inline-size: 0;
		color: var(--sensation-field-fg);
		font-family: system-ui, sans-serif;
		font-size: 14px;
		line-height: 1.2;
	}

	.sensation-text-field__label {
		padding-inline: 2px;
		font-weight: 600;
	}

	.sensation-text-field__control {
		position: relative;
		display: flex;
		box-sizing: border-box;
		min-inline-size: 0;
		min-block-size: 24px;
		align-items: center;
		overflow: hidden;
		padding-inline: 6px;
		border-radius: var(--sensation-field-radius);
		background: var(--sensation-field-bg);
	}

	.sensation-text-field[data-invalid="true"] .sensation-text-field__control {
		--sensation-effect-halo-color: var(--sensation-field-error);
	}

	.sensation-text-field__input-area {
		position: relative;
		z-index: 1;
		display: flex;
		min-inline-size: 0;
		flex: 1;
	}

	.sensation-text-field__input {
		box-sizing: border-box;
		min-inline-size: 0;
		inline-size: 100%;
		min-block-size: 0;
		padding: 0;
		border: 0;
		outline: 0;
		appearance: none;
		background: transparent;
		color: var(--sensation-field-fg);
		caret-color: var(--sensation-field-fg);
		font: inherit;
		line-height: inherit;
	}

	.sensation-text-field__input::placeholder {
		color: transparent;
	}

	.sensation-text-field__placeholder {
		position: absolute;
		inset-block: 0;
		inset-inline: 0;
		overflow: hidden;
		color: var(--sensation-field-placeholder);
		font-style: italic;
		line-height: inherit;
		opacity: 1;
		pointer-events: none;
		text-overflow: ellipsis;
		transform: translateX(0);
		transition:
			opacity var(--sensation-field-motion) var(--sensation-field-easing),
			transform var(--sensation-field-motion) var(--sensation-field-easing);
		white-space: nowrap;
	}

	.sensation-text-field__input:not(:placeholder-shown) + .sensation-text-field__placeholder {
		opacity: 0;
		transform: translateX(16px);
	}

	.sensation-text-field__input:focus:placeholder-shown + .sensation-text-field__placeholder {
		opacity: 0.5;
	}

	:global([dir="rtl"])
		.sensation-text-field__input:not(:placeholder-shown)
		+ .sensation-text-field__placeholder {
		transform: translateX(-16px);
	}

	.sensation-text-field__scroll-fade {
		position: absolute;
		z-index: 3;
		inset-block: 0;
		inline-size: 0;
		pointer-events: none;
		transition: inline-size var(--sensation-field-motion) var(--sensation-field-easing);
	}

	.sensation-text-field__scroll-fade--start {
		inset-inline-start: 0;
		background: linear-gradient(to right, var(--sensation-field-bg), transparent);
	}

	.sensation-text-field__scroll-fade--end {
		inset-inline-end: 0;
		background: linear-gradient(to left, var(--sensation-field-bg), transparent);
	}

	:global([dir="rtl"]) .sensation-text-field__scroll-fade--start {
		background: linear-gradient(to left, var(--sensation-field-bg), transparent);
	}

	:global([dir="rtl"]) .sensation-text-field__scroll-fade--end {
		background: linear-gradient(to right, var(--sensation-field-bg), transparent);
	}

	:global(.sensation-text-field__input-area[data-sensation-scroll-start])
		.sensation-text-field__scroll-fade--start {
		inline-size: var(--sensation-field-scroll-start-width, 0);
	}

	:global(.sensation-text-field__input-area[data-sensation-scroll-end])
		.sensation-text-field__scroll-fade--end {
		inline-size: var(--sensation-field-scroll-end-width, 0);
	}

	.sensation-text-field__input:-webkit-autofill,
	.sensation-text-field__input:-webkit-autofill:hover,
	.sensation-text-field__input:-webkit-autofill:focus {
		box-shadow: 0 0 0 1000px var(--sensation-field-bg) inset;
		-webkit-text-fill-color: var(--sensation-field-fg);
		caret-color: var(--sensation-field-fg);
	}

	.sensation-text-field--multiline .sensation-text-field__control {
		align-items: start;
		min-block-size: 64px;
		padding-block: 6px;
	}

	.sensation-text-field--multiline .sensation-text-field__input {
		min-block-size: 52px;
		resize: vertical;
	}

	.sensation-text-field--multiline .sensation-text-field__scroll-fade {
		display: none;
	}

	.sensation-text-field--jumbo {
		font-size: 16px;
	}

	.sensation-text-field--jumbo .sensation-text-field__control {
		min-block-size: 32px;
		padding-inline: 6px;
	}

	.sensation-text-field__icon {
		z-index: 1;
		color: var(--sensation-field-fg);
		margin-inline-start: -2px;
		margin-inline-end: 6px;
	}

	.sensation-text-field--jumbo .sensation-text-field__icon {
		margin-inline-start: 2px;
		margin-inline-end: 10px;
	}

	.sensation-text-field__help,
	.sensation-text-field__error {
		padding-inline: 2px;
		font-size: 12px;
	}

	.sensation-text-field__help {
		color: var(--sensation-field-placeholder);
	}

	.sensation-text-field__error {
		color: var(--sensation-field-error);
	}

	.sensation-text-field[data-disabled="true"] {
		opacity: 0.5;
	}

	.sensation-text-field[data-readonly="true"] .sensation-text-field__control {
		background: color-mix(in oklch, var(--sensation-field-bg), var(--sensation-field-fg) 4%);
	}

	@media (prefers-reduced-motion: reduce) {
		.sensation-text-field__placeholder,
		.sensation-text-field__scroll-fade {
			transition-duration: var(--sensation-field-motion-reduced);
		}
	}

	@media (forced-colors: active) {
		.sensation-text-field__input::placeholder {
			color: GrayText;
		}

		.sensation-text-field__placeholder,
		.sensation-text-field__scroll-fade {
			display: none;
		}
	}
</style>
