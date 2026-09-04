import { describe, expect, it } from "vitest";
import {
	MAX_Z_DEPTH,
	MIN_Z_DEPTH,
	clampZDepth,
	contrastRatio,
	createPalette,
	createThemeContext,
	toSrgb,
	withZOffset,
} from "./index.js";

describe("createPalette", () => {
	it("creates every RbxSensation depth and semantic color", () => {
		const palette = createPalette(0.3, 255);

		expect(palette.bg.size).toBe(MAX_Z_DEPTH - MIN_Z_DEPTH + 1);
		expect(palette.bg.has(MIN_Z_DEPTH)).toBe(true);
		expect(palette.bg.has(MAX_Z_DEPTH)).toBe(true);
		expect(palette.accentAtopBg.size).toBe(palette.bg.size);
		expect(palette.pureAtopGreyAtopBg.size).toBe(palette.bg.size);
	});

	it("maps generated colors into the sRGB gamut", () => {
		const palette = createPalette(0.3, 255);
		const colors = [
			...palette.bg.values(),
			...palette.fgAtopBg.values(),
			...palette.accentAtopBg.values(),
			...palette.greyAtopBg.values(),
		];

		for (const color of colors) {
			const rendered = toSrgb(color);
			expect(rendered.red).toBeGreaterThanOrEqual(0);
			expect(rendered.red).toBeLessThanOrEqual(1);
			expect(rendered.green).toBeGreaterThanOrEqual(0);
			expect(rendered.green).toBeLessThanOrEqual(1);
			expect(rendered.blue).toBeGreaterThanOrEqual(0);
			expect(rendered.blue).toBeLessThanOrEqual(1);
		}
	});

	it("keeps normal text at AAA contrast on the working depth range", () => {
		const palette = createPalette(0.3, 255);

		for (let zDepth = -2; zDepth <= 2; zDepth += 1) {
			const theme = createThemeContext(palette, zDepth);
			expect(contrastRatio(theme.fgAtopBg, theme.bg)).toBeGreaterThanOrEqual(7);
		}
	});

	it("normalizes hue and clamps base lightness", () => {
		const normalized = createThemeContext(createPalette(2, -105));
		const equivalent = createThemeContext(createPalette(1, 255));

		expect(normalized.bg).toBe(equivalent.bg);
		expect(normalized.accentAtopBg).toBe(equivalent.accentAtopBg);
	});
});

describe("theme context", () => {
	it("floors and clamps z-depth", () => {
		expect(clampZDepth(-100)).toBe(MIN_Z_DEPTH);
		expect(clampZDepth(2.9)).toBe(2);
		expect(clampZDepth(100)).toBe(MAX_Z_DEPTH);
	});

	it("carries the palette and tokens through nested depth", () => {
		const root = createThemeContext(createPalette());
		const raised = withZOffset(root, 1);
		const clamped = withZOffset(root, 100);

		expect(raised.palette).toBe(root.palette);
		expect(raised.zDepth).toBe(1);
		expect(raised.bg).not.toBe(root.bg);
		expect(raised.effects).toBe(root.effects);
		expect(raised.motion).toBe(root.motion);
		expect(clamped.zDepth).toBe(MAX_Z_DEPTH);
	});

	it("rejects non-finite inputs", () => {
		expect(() => createPalette(Number.NaN)).toThrow(TypeError);
		expect(() => clampZDepth(Number.POSITIVE_INFINITY)).toThrow(TypeError);
	});
});
