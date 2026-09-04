<script module lang="ts">
	import type { Snippet } from "svelte";

	export interface ThemeDepthProps {
		children: Snippet;
		offset: number;
	}
</script>

<script lang="ts">
	import { withZOffset } from "@morgan-vieira-npm/sensation-theme";
	import { getThemeState, setThemeState } from "./theme-context.js";
	import type { ThemeState } from "./theme-context.js";

	let { children, offset }: ThemeDepthProps = $props();
	const parent = getThemeState();
	const theme = $derived(withZOffset(parent.current, offset));
	const state: ThemeState = {
		get current() {
			return theme;
		},
	};

	setThemeState(state);
</script>

{@render children()}
