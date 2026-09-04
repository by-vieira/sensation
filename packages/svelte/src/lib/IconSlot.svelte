<script module lang="ts">
	import type { IconRenderContext } from "@morgan-vieira-npm/sensation-theme";
	import type { Snippet } from "svelte";

	export interface IconSlotProps {
		class?: string;
		context: IconRenderContext;
		icon: Snippet<[IconRenderContext]>;
	}
</script>

<script lang="ts">
	import { mergeStyles } from "./styles.js";

	let { class: className, context, icon }: IconSlotProps = $props();
	const style = $derived(
		mergeStyles(
			[
				`--sensation-icon-background:${context.colors.background}`,
				`--sensation-icon-primary:${context.colors.primary}`,
				`--sensation-icon-secondary:${context.colors.secondary}`,
				`--sensation-icon-overlay:${context.colors.overlay}`,
			].join(";"),
			undefined,
		),
	);
</script>

<span
	aria-hidden="true"
	class={["sensation-icon-slot", className]}
	data-sensation-icon-animation={context.animation}
	{style}
>
	{@render icon(context)}
</span>
