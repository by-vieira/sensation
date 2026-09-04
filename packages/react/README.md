# Sensation React

`@morgan-vieira-npm/sensation-react` provides the React theme context and the first RbxSensation foundation components.

## Use the components

```tsx
import { Button, Panel, Text, ThemeDepth, ThemeProvider } from "@morgan-vieira-npm/sensation-react";

export function Example() {
	return (
		<ThemeProvider>
			<ThemeDepth offset={1}>
				<Panel>
					<Text variant="heading">Publish changes?</Text>
					<Button illuminated>Publish</Button>
				</Panel>
			</ThemeDepth>
		</ThemeProvider>
	);
}
```

`ThemeProvider` creates a dark palette with a 255 degree accent hue by default. Pass `palette` to share an existing palette. Pass `baseLightness`, `accentHue`, or `zDepth` to create another root context.

`ThemeDepth` changes the context depth without drawing an element. `useTheme` returns the current `ThemeContext`.

## Text

`Text` renders a `<span>`. It accepts native span attributes and a `ref`.

The `variant` prop accepts `normal`, `grey`, `heading`, `accent`, or `atopAccent`. The `align` prop accepts the original `start`, `mid`, and `end` positions for each axis. Vertical alignment applies when the span has extra block size.

The `heading` variant changes the visual size only. Place `Text` inside the correct HTML heading element when the text is a document heading.

Compose nested elements for rich text. The component does not parse a rich-text string.

## Panel

`Panel` renders a `<div>` and adds no padding. It accepts native div attributes and a `ref`.

A negative `elevation` draws the one-pixel shadow inside the panel. Zero and positive values draw it outside. `transparency` accepts a value from `0` through `1`. Wrap the panel in `ThemeDepth` to draw it at another depth.

## Button

`Button` renders a native `<button>`. Native attributes, form behavior, events, and refs pass through.

- `illuminated` uses the accent background.
- `flat` removes the raised bevel.
- `subtle` blends into the parent depth until hover.
- `align="start"` aligns content to the logical start edge. The default is `center`.
- `loading` sets `aria-busy`, disables the button, and shows a static loading mark.

Use `aria-pressed` for a selected or toggle state. The component styles `aria-pressed="true"` with the illuminated treatment. Always set `type="button"` when a button inside a form must not submit the form.

Place SVGs or other icon content beside the label inside `Button`. The button aligns composed content and adds the reference four-pixel gap. The consumer owns the icon and its animation.

## Reference boundaries

The browser measures and wraps text. Use a ref and `ResizeObserver` when an application needs measured output.

The button surface uses the reference speed-50 hover and press springs, 66 ms pointer sample window, one-frame prediction, and release or cancel lifecycle. Reduced motion snaps each spring to its goal.

The hover surface uses the original sheen image as an alpha mask, so theme colors can tint it with the same light-or-dark relationship as the Roblox decal. Roblox layout properties and `IconPlayer` are not part of the web API.
