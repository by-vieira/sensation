import { getContext, setContext } from "svelte";
import { createPalette, createThemeContext } from "@morgan-vieira-npm/sensation-theme";
import type { ThemeContext } from "@morgan-vieira-npm/sensation-theme";

export interface ThemeState {
	readonly current: ThemeContext;
}

const themeKey = Symbol("sensation-theme");
const defaultState: ThemeState = {
	current: createThemeContext(createPalette()),
};

export function getThemeState(): ThemeState {
	return getContext<ThemeState | undefined>(themeKey) ?? defaultState;
}

export function setThemeState(state: ThemeState): void {
	setContext(themeKey, state);
}
