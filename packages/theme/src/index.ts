export const MIN_Z_DEPTH = -10;
export const MAX_Z_DEPTH = 10;

const HIGH_CONTRAST_DISTANCE = 0.7;
const FOREGROUND_SWITCH_POINT = 0.65;
const GAMUT_EPSILON = 0.000_001;
const ERROR_HUE = 25;

export type ThemeColor = `oklch(${string})`;
export type IconThemeColor = ThemeColor | `color-mix(${string})`;

export interface IconTheme {
	readonly background: ThemeColor;
	readonly primary: ThemeColor;
	readonly secondary: IconThemeColor;
	readonly overlay: ThemeColor;
}

export interface IconThemeOptions {
	readonly background: "bg" | "accentAtopBg";
	readonly foreground: "fg" | "accent" | "grey";
	readonly style: "trio" | "duo" | "mono";
}

export interface IconRenderContext {
	readonly animation: number;
	readonly colors: IconTheme;
	readonly theme: ThemeContext;
}

export interface SrgbColor {
	readonly red: number;
	readonly green: number;
	readonly blue: number;
}

export interface ThemePalette {
	readonly bg: ReadonlyMap<number, ThemeColor>;
	readonly fgAtopBg: ReadonlyMap<number, ThemeColor>;
	readonly accentAtopBg: ReadonlyMap<number, ThemeColor>;
	readonly errorAtopBg: ReadonlyMap<number, ThemeColor>;
	readonly greyAtopBg: ReadonlyMap<number, ThemeColor>;
	readonly fgAtopAccentAtopBg: ReadonlyMap<number, ThemeColor>;
	readonly accentAtopAccentAtopBg: ReadonlyMap<number, ThemeColor>;
	readonly greyAtopAccentAtopBg: ReadonlyMap<number, ThemeColor>;
	readonly fgAtopGreyAtopBg: ReadonlyMap<number, ThemeColor>;
	readonly pureAtopBg: ReadonlyMap<number, ThemeColor>;
	readonly pureAtopAccentAtopBg: ReadonlyMap<number, ThemeColor>;
	readonly pureAtopGreyAtopBg: ReadonlyMap<number, ThemeColor>;
	readonly shouldInvert: ReadonlyMap<number, boolean>;
}

export interface ThemeEffects {
	readonly panelRadius: string;
	readonly controlRadius: string;
	readonly shadow: string;
	readonly shadowThickness: string;
	readonly bevelHighlight: string;
	readonly bevelShadow: string;
	readonly bevelThickness: string;
	readonly haloThickness: string;
	readonly haloOffset: string;
}

export interface ThemeMotion {
	readonly responsiveDuration: string;
	readonly quickDuration: string;
	readonly reducedDuration: string;
	readonly easing: string;
}

export interface ThemeContext {
	readonly palette: ThemePalette;
	readonly zDepth: number;
	readonly bg: ThemeColor;
	readonly fgAtopBg: ThemeColor;
	readonly accentAtopBg: ThemeColor;
	readonly errorAtopBg: ThemeColor;
	readonly greyAtopBg: ThemeColor;
	readonly fgAtopAccentAtopBg: ThemeColor;
	readonly accentAtopAccentAtopBg: ThemeColor;
	readonly greyAtopAccentAtopBg: ThemeColor;
	readonly fgAtopGreyAtopBg: ThemeColor;
	readonly pureAtopBg: ThemeColor;
	readonly pureAtopAccentAtopBg: ThemeColor;
	readonly pureAtopGreyAtopBg: ThemeColor;
	readonly shouldInvert: boolean;
	readonly focus: ThemeColor;
	readonly effects: ThemeEffects;
	readonly motion: ThemeMotion;
}

interface OklchColor {
	readonly lightness: number;
	readonly chroma: number;
	readonly hue: number;
}

export const defaultThemeEffects: ThemeEffects = Object.freeze({
	panelRadius: "8px",
	controlRadius: "4px",
	shadow: "rgb(0 0 0 / 10%)",
	shadowThickness: "1px",
	bevelHighlight: "rgb(255 255 255 / 20%)",
	bevelShadow: "rgb(0 0 0 / 15%)",
	bevelThickness: "1px",
	haloThickness: "2px",
	haloOffset: "2px",
});

export const defaultThemeMotion: ThemeMotion = Object.freeze({
	responsiveDuration: "100ms",
	quickDuration: "50ms",
	reducedDuration: "0ms",
	easing: "cubic-bezier(0.2, 0, 0, 1)",
});

function clamp(value: number, minimum: number, maximum: number): number {
	return Math.min(Math.max(value, minimum), maximum);
}

function requireFinite(value: number, name: string): number {
	if (!Number.isFinite(value)) {
		throw new TypeError(`${name} must be a finite number.`);
	}

	return value;
}

function normalizeHue(hue: number): number {
	return ((hue % 360) + 360) % 360;
}

function oklchToLinearSrgb({ lightness, chroma, hue }: OklchColor): SrgbColor {
	const hueRadians = (hue * Math.PI) / 180;
	const a = chroma * Math.cos(hueRadians);
	const b = chroma * Math.sin(hueRadians);
	const l = lightness + 0.396_337_777_4 * a + 0.215_803_757_3 * b;
	const m = lightness - 0.105_561_345_8 * a - 0.063_854_172_8 * b;
	const s = lightness - 0.089_484_177_5 * a - 1.291_485_548 * b;
	const lCubed = l ** 3;
	const mCubed = m ** 3;
	const sCubed = s ** 3;

	return {
		red: 4.076_741_662_1 * lCubed - 3.307_711_591_3 * mCubed + 0.230_969_929_2 * sCubed,
		green: -1.268_438_004_6 * lCubed + 2.609_757_401_1 * mCubed - 0.341_319_396_5 * sCubed,
		blue: -0.004_196_086_3 * lCubed - 0.703_418_614_7 * mCubed + 1.707_614_701 * sCubed,
	};
}

function isInSrgbGamut(color: SrgbColor): boolean {
	return (
		color.red >= -GAMUT_EPSILON &&
		color.red <= 1 + GAMUT_EPSILON &&
		color.green >= -GAMUT_EPSILON &&
		color.green <= 1 + GAMUT_EPSILON &&
		color.blue >= -GAMUT_EPSILON &&
		color.blue <= 1 + GAMUT_EPSILON
	);
}

function mapIntoSrgbGamut(color: OklchColor): OklchColor {
	if (color.chroma === 0 || isInSrgbGamut(oklchToLinearSrgb(color))) {
		return color;
	}

	let minimum = 0;
	let maximum = color.chroma;

	for (let step = 0; step < 24; step += 1) {
		const chroma = (minimum + maximum) / 2;
		const candidate = { ...color, chroma };

		if (isInSrgbGamut(oklchToLinearSrgb(candidate))) {
			minimum = chroma;
		} else {
			maximum = chroma;
		}
	}

	return { ...color, chroma: minimum };
}

function formatNumber(value: number): string {
	const rounded = Math.round(value * 1_000_000) / 1_000_000;
	return Object.is(rounded, -0) ? "0" : String(rounded);
}

function makeThemeColor(lightness: number, chroma: number, hue: number): ThemeColor {
	const mapped = mapIntoSrgbGamut({
		lightness: clamp(lightness, 0, 1),
		chroma: Math.max(0, chroma),
		hue: normalizeHue(hue),
	});

	return `oklch(${formatNumber(mapped.lightness)} ${formatNumber(mapped.chroma)} ${formatNumber(mapped.hue)})`;
}

function parseThemeColor(color: ThemeColor): OklchColor {
	const match = /^oklch\((-?[\d.]+) (-?[\d.]+) (-?[\d.]+)\)$/.exec(color);

	if (match === null) {
		throw new TypeError(`Invalid theme color: ${color}`);
	}

	const [, lightness, chroma, hue] = match;
	return {
		lightness: Number(lightness),
		chroma: Number(chroma),
		hue: Number(hue),
	};
}

function calcBackground(baseLightness: number, zDepth: number): OklchColor {
	let lightness = baseLightness + zDepth * 0.04;

	while (lightness < 0 || lightness > 1) {
		if (lightness > 1) {
			lightness = 1.95 - lightness;
		}

		if (lightness < 0) {
			lightness = 0.05 - lightness;
		}
	}

	return { lightness, chroma: 0, hue: 0 };
}

function shouldInvert(background: OklchColor): boolean {
	return background.lightness > FOREGROUND_SWITCH_POINT;
}

function calcForeground(background: OklchColor): OklchColor {
	return {
		lightness: shouldInvert(background)
			? Math.max(0, background.lightness - HIGH_CONTRAST_DISTANCE)
			: Math.min(1, background.lightness + HIGH_CONTRAST_DISTANCE),
		chroma: 0,
		hue: 0,
	};
}

function calcAccent(background: OklchColor, hue: number): OklchColor {
	const lightness = shouldInvert(background)
		? clamp(0.55 + (background.lightness - 0.94) / 2, 0, 1)
		: clamp(0.8 + (background.lightness - 0.24) / 2, 0, 1);

	return { lightness, chroma: 0.15, hue };
}

function calcGrey(background: OklchColor): OklchColor {
	return { ...calcAccent(background, 0), chroma: 0 };
}

function calcPure(background: OklchColor): OklchColor {
	return {
		lightness: shouldInvert(background) ? 0.05 : 1,
		chroma: 0,
		hue: 0,
	};
}

function putColor(map: Map<number, ThemeColor>, zDepth: number, color: OklchColor): void {
	map.set(zDepth, makeThemeColor(color.lightness, color.chroma, color.hue));
}

export function createPalette(baseLightness = 0.3, accentHue = 255): ThemePalette {
	const normalizedBaseLightness = clamp(requireFinite(baseLightness, "baseLightness"), 0, 1);
	const normalizedAccentHue = normalizeHue(requireFinite(accentHue, "accentHue"));
	const bg = new Map<number, ThemeColor>();
	const fgAtopBg = new Map<number, ThemeColor>();
	const accentAtopBg = new Map<number, ThemeColor>();
	const errorAtopBg = new Map<number, ThemeColor>();
	const greyAtopBg = new Map<number, ThemeColor>();
	const fgAtopAccentAtopBg = new Map<number, ThemeColor>();
	const accentAtopAccentAtopBg = new Map<number, ThemeColor>();
	const greyAtopAccentAtopBg = new Map<number, ThemeColor>();
	const fgAtopGreyAtopBg = new Map<number, ThemeColor>();
	const pureAtopBg = new Map<number, ThemeColor>();
	const pureAtopAccentAtopBg = new Map<number, ThemeColor>();
	const pureAtopGreyAtopBg = new Map<number, ThemeColor>();
	const inversion = new Map<number, boolean>();

	for (let zDepth = MIN_Z_DEPTH; zDepth <= MAX_Z_DEPTH; zDepth += 1) {
		const background = calcBackground(normalizedBaseLightness, zDepth);
		const foreground = calcForeground(background);
		const accent = calcAccent(background, normalizedAccentHue);
		const error = calcAccent(background, ERROR_HUE);
		const grey = calcGrey(background);
		const foregroundAtopAccent = calcForeground(accent);
		const accentAtopAccent = calcAccent(accent, normalizedAccentHue);
		const greyAtopAccent = calcGrey(accent);
		const foregroundAtopGrey = calcForeground(grey);

		putColor(bg, zDepth, background);
		putColor(fgAtopBg, zDepth, foreground);
		putColor(accentAtopBg, zDepth, accent);
		putColor(errorAtopBg, zDepth, error);
		putColor(greyAtopBg, zDepth, grey);
		putColor(fgAtopAccentAtopBg, zDepth, foregroundAtopAccent);
		putColor(accentAtopAccentAtopBg, zDepth, accentAtopAccent);
		putColor(greyAtopAccentAtopBg, zDepth, greyAtopAccent);
		putColor(fgAtopGreyAtopBg, zDepth, foregroundAtopGrey);
		putColor(pureAtopBg, zDepth, calcPure(background));
		putColor(pureAtopAccentAtopBg, zDepth, calcPure(accent));
		putColor(pureAtopGreyAtopBg, zDepth, calcPure(grey));
		inversion.set(zDepth, shouldInvert(background));
	}

	return {
		bg,
		fgAtopBg,
		accentAtopBg,
		errorAtopBg,
		greyAtopBg,
		fgAtopAccentAtopBg,
		accentAtopAccentAtopBg,
		greyAtopAccentAtopBg,
		fgAtopGreyAtopBg,
		pureAtopBg,
		pureAtopAccentAtopBg,
		pureAtopGreyAtopBg,
		shouldInvert: inversion,
	};
}

export function clampZDepth(zDepth: number): number {
	requireFinite(zDepth, "zDepth");
	return clamp(Math.floor(zDepth), MIN_Z_DEPTH, MAX_Z_DEPTH);
}

function getAtDepth<T>(values: ReadonlyMap<number, T>, zDepth: number): T {
	const value = values.get(zDepth);

	if (value === undefined) {
		throw new RangeError(`The palette does not contain z-depth ${zDepth}.`);
	}

	return value;
}

export function createThemeContext(
	palette: ThemePalette,
	zDepth = 0,
	effects: ThemeEffects = defaultThemeEffects,
	motion: ThemeMotion = defaultThemeMotion,
): ThemeContext {
	const normalizedDepth = clampZDepth(zDepth);

	return {
		palette,
		zDepth: normalizedDepth,
		bg: getAtDepth(palette.bg, normalizedDepth),
		fgAtopBg: getAtDepth(palette.fgAtopBg, normalizedDepth),
		accentAtopBg: getAtDepth(palette.accentAtopBg, normalizedDepth),
		errorAtopBg: getAtDepth(palette.errorAtopBg, normalizedDepth),
		greyAtopBg: getAtDepth(palette.greyAtopBg, normalizedDepth),
		fgAtopAccentAtopBg: getAtDepth(palette.fgAtopAccentAtopBg, normalizedDepth),
		accentAtopAccentAtopBg: getAtDepth(palette.accentAtopAccentAtopBg, normalizedDepth),
		greyAtopAccentAtopBg: getAtDepth(palette.greyAtopAccentAtopBg, normalizedDepth),
		fgAtopGreyAtopBg: getAtDepth(palette.fgAtopGreyAtopBg, normalizedDepth),
		pureAtopBg: getAtDepth(palette.pureAtopBg, normalizedDepth),
		pureAtopAccentAtopBg: getAtDepth(palette.pureAtopAccentAtopBg, normalizedDepth),
		pureAtopGreyAtopBg: getAtDepth(palette.pureAtopGreyAtopBg, normalizedDepth),
		shouldInvert: getAtDepth(palette.shouldInvert, normalizedDepth),
		focus: getAtDepth(palette.accentAtopBg, normalizedDepth),
		effects,
		motion,
	};
}

export function withZOffset(theme: ThemeContext, deltaZ: number): ThemeContext {
	requireFinite(deltaZ, "deltaZ");
	return createThemeContext(theme.palette, theme.zDepth + deltaZ, theme.effects, theme.motion);
}

export function createIconTheme(theme: ThemeContext, options: IconThemeOptions): IconTheme {
	const background = options.background === "bg" ? theme.bg : theme.accentAtopBg;
	const primary =
		options.background === "bg"
			? options.foreground === "fg"
				? theme.fgAtopBg
				: options.foreground === "accent"
					? theme.accentAtopBg
					: theme.greyAtopBg
			: options.foreground === "accent"
				? theme.accentAtopAccentAtopBg
				: theme.fgAtopAccentAtopBg;
	const secondary =
		options.style === "mono"
			? primary
			: (`color-mix(in oklch, ${background} 40%, ${primary} 60%)` as const);
	const overlay =
		options.style !== "trio"
			? primary
			: options.background === "bg"
				? options.foreground === "accent"
					? theme.fgAtopBg
					: theme.accentAtopBg
				: options.foreground === "accent"
					? theme.fgAtopAccentAtopBg
					: theme.accentAtopAccentAtopBg;

	return Object.freeze({ background, primary, secondary, overlay });
}

export function toSrgb(color: ThemeColor): SrgbColor {
	const linear = oklchToLinearSrgb(parseThemeColor(color));
	return {
		red: clamp(linear.red, 0, 1),
		green: clamp(linear.green, 0, 1),
		blue: clamp(linear.blue, 0, 1),
	};
}

export function contrastRatio(first: ThemeColor, second: ThemeColor): number {
	const firstRgb = toSrgb(first);
	const secondRgb = toSrgb(second);
	const firstLuminance = 0.2126 * firstRgb.red + 0.7152 * firstRgb.green + 0.0722 * firstRgb.blue;
	const secondLuminance =
		0.2126 * secondRgb.red + 0.7152 * secondRgb.green + 0.0722 * secondRgb.blue;
	const lighter = Math.max(firstLuminance, secondLuminance);
	const darker = Math.min(firstLuminance, secondLuminance);

	return (lighter + 0.05) / (darker + 0.05);
}
