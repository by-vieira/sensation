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

- `bg`, `fgAtopBg`, `accentAtopBg`, `errorAtopBg`, and `greyAtopBg`
- `fgAtopAccentAtopBg`, `accentAtopAccentAtopBg`, and `greyAtopAccentAtopBg`
- `fgAtopGreyAtopBg`
- `pureAtopBg`, `pureAtopAccentAtopBg`, and `pureAtopGreyAtopBg`
- `focus` and `shouldInvert`

Colors use CSS `oklch()` syntax. Palette generation reduces chroma until each color fits the sRGB gamut. Use `toSrgb` and `contrastRatio` to inspect rendered values.

`ThemeContext` also contains shared panel, control, shadow, bevel, halo, and motion tokens. Shadow, bevel, and halo thicknesses live beside their colors, so components do not invent local effect values. Replace the complete `ThemeEffects` or `ThemeMotion` value through `createThemeContext` when a consumer theme needs different rules.

`createIconTheme` derives the four RbxSensation icon channels from a theme context and a background, foreground, and style choice. React and Svelte re-export it with `IconRenderContext` for consumer-owned icons.

The framework packages load the shared private effect rules from `effects.css`. Those rules own raised and inset bevels, raised and inset shadows, and the halo opacity and thickness transition. Components provide only theme values and select the applicable rule.

## Reference boundaries

The web package accepts hue in degrees. RbxSensation accepts the equivalent value as a normalized turn. Web palettes reduce chroma until each generated colour fits the sRGB gamut.

The package does not port `Theme.palette.plugin`. Applications can select a light or dark palette from their own state or `prefers-color-scheme` handling.
