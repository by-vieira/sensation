# Sensation theme

`@morgan-vieira-npm/sensation-theme` contains the color and depth rules shared by the React and Svelte packages.

## Create a palette

```ts
import { createPalette, createThemeContext, withZOffset } from "@morgan-vieira-npm/sensation-theme";

const palette = createPalette(0.3, 255);
const root = createThemeContext(palette);
const raised = withZOffset(root, 1);
```

`createPalette` accepts an OKLCH base lightness from `0` through `1` and an accent hue in degrees. The default values create the dark blue RbxSensation palette.

The palette contains z-depths `-10` through `10`. `createThemeContext` and `withZOffset` floor and clamp each depth to that range.

## Color roles

Each `ThemeContext` exposes the RbxSensation color relationships:

- `bg`, `fgAtopBg`, `accentAtopBg`, and `greyAtopBg`
- `fgAtopAccentAtopBg`, `accentAtopAccentAtopBg`, and `greyAtopAccentAtopBg`
- `fgAtopGreyAtopBg`
- `pureAtopBg`, `pureAtopAccentAtopBg`, and `pureAtopGreyAtopBg`
- `focus` and `shouldInvert`

Colors use CSS `oklch()` syntax. Palette generation reduces chroma until each color fits the sRGB gamut. Use `toSrgb` and `contrastRatio` to inspect rendered values.

`ThemeContext` also contains the shared panel, control, shadow, bevel, and motion tokens. Replace these tokens through `createThemeContext` when a consumer theme needs different effects.

## Reference boundaries

The web package accepts hue in degrees. RbxSensation accepts the equivalent value as a normalized turn. Web palettes reduce chroma until each generated colour fits the sRGB gamut.

The package does not port `Theme.palette.plugin`. Applications can select a light or dark palette from their own state or `prefers-color-scheme` handling.
