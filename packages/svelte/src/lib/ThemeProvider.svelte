<script module lang="ts">
	import type { Snippet } from "svelte";
	import type { ThemeEffects, ThemeMotion, ThemePalette } from "@morgan-vieira-npm/sensation-theme";

	export interface ThemeProviderProps {
		children: Snippet;
		palette?: ThemePalette;
		baseLightness?: number;
		accentHue?: number;
		zDepth?: number;
		effects?: ThemeEffects;
		motion?: ThemeMotion;
	}
</script>

<script lang="ts">
	import {
		createPalette,
		createThemeContext,
		defaultThemeEffects,
		defaultThemeMotion,
	} from "@morgan-vieira-npm/sensation-theme";
	import { setThemeState } from "./theme-context.js";
	import type { ThemeState } from "./theme-context.js";

	let {
		children,
		palette,
		baseLightness = 0.3,
		accentHue = 255,
		zDepth = 0,
		effects = defaultThemeEffects,
		motion = defaultThemeMotion,
	}: ThemeProviderProps = $props();

	const generatedPalette = $derived(palette ?? createPalette(baseLightness, accentHue));
	const theme = $derived(createThemeContext(generatedPalette, zDepth, effects, motion));
	const state: ThemeState = {
		get current() {
			return theme;
		},
	};

	setThemeState(state);
</script>

{@render children()}
