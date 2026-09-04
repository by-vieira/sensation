import {
	createPalette,
	createThemeContext,
	defaultThemeEffects,
	defaultThemeMotion,
	withZOffset,
} from "@morgan-vieira-npm/sensation-theme";
import type {
	ThemeContext as ThemeContextValue,
	ThemeEffects,
	ThemeMotion,
	ThemePalette,
} from "@morgan-vieira-npm/sensation-theme";
import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";

const defaultPalette = createPalette();
const SensationThemeContext = createContext<ThemeContextValue>(createThemeContext(defaultPalette));

export interface ThemeProviderProps {
	readonly children: ReactNode;
	readonly palette?: ThemePalette;
	readonly baseLightness?: number;
	readonly accentHue?: number;
	readonly zDepth?: number;
	readonly effects?: ThemeEffects;
	readonly motion?: ThemeMotion;
}

export function ThemeProvider({
	children,
	palette,
	baseLightness = 0.3,
	accentHue = 255,
	zDepth = 0,
	effects = defaultThemeEffects,
	motion = defaultThemeMotion,
}: ThemeProviderProps) {
	const generatedPalette = useMemo(
		() => createPalette(baseLightness, accentHue),
		[accentHue, baseLightness],
	);
	const value = useMemo(
		() => createThemeContext(palette ?? generatedPalette, zDepth, effects, motion),
		[effects, generatedPalette, motion, palette, zDepth],
	);

	return <SensationThemeContext.Provider value={value}>{children}</SensationThemeContext.Provider>;
}

export interface ThemeDepthProps {
	readonly children: ReactNode;
	readonly offset: number;
}

export function ThemeDepth({ children, offset }: ThemeDepthProps) {
	const parent = useTheme();
	const value = useMemo(() => withZOffset(parent, offset), [offset, parent]);

	return <SensationThemeContext.Provider value={value}>{children}</SensationThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
	return useContext(SensationThemeContext);
}
