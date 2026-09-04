# Sensation React

`@morgan-vieira-npm/sensation-react` provides the React theme context and the first RbxSensation foundation components.

## Use the components

```tsx
import { useState } from "react";
import {
	Button,
	Panel,
	Switch,
	Text,
	TextField,
	ThemeDepth,
	ThemeProvider,
} from "@morgan-vieira-npm/sensation-react";

export function Example() {
	const [createRelease, setCreateRelease] = useState(true);

	return (
		<ThemeProvider>
			<ThemeDepth offset={1}>
				<Panel>
					<Text variant="heading">Publish changes?</Text>
					<TextField label="Package" name="package" />
					<Switch
						checked={createRelease}
						label="Create release"
						name="release"
						onChange={(event) => setCreateRelease(event.currentTarget.checked)}
					/>
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

Pass consumer-owned icon content through `icon`. A render function receives an `IconRenderContext` with themed `background`, `primary`, `secondary`, and `overlay` colors plus an incrementing `animation` signal. Mark SVG parts with `data-sensation-icon-channel` to apply a channel automatically. The button advances the signal on activation and when `illuminated` turns on.

## TextField

`TextField` renders a native `<input>` by default. Set `multiline` to render a native `<textarea>`. Native attributes, events, form behavior, editing, selection, autofill, and refs pass through.

Use `label`, `helpText`, and `error` to render text with the correct `for`, `aria-describedby`, and `aria-invalid` relationships. Use `jumbo` for the reference 32-pixel control and 16-pixel text. The default control is 24 pixels tall with 14-pixel text.

`className` and `style` apply to the input or textarea. `containerClassName` and `containerStyle` apply to the component root. The `icon` render function receives the field icon theme and advances its animation signal on focus.

The placeholder uses the field foreground, then fades and moves when text appears. Single-line fields fade overflowing text at each scroll edge while retaining native editing, selection, and scrolling.

## Switch

`Switch` contains one native checkbox. Pass the controlled `checked` value and update it in `onChange`. Native checkbox attributes, keyboard behavior, touch behavior, form submission, and refs pass through.

Use `label` and `description` for visible text. `className` and `style` apply to the checkbox. `containerClassName` and `containerStyle` apply to the root label.

The knob moves with an interruptible CSS transition. Each controlled value change adds the short reference smudge independently of press state. Reduced motion omits the smudge and snaps the transition.

## Composition

- `Divider` renders a themed separator. Set `orientation` to `vertical` when needed.
- `Spacer` renders an inert square with the given CSS `size`. Prefer layout `gap` when every sibling uses the same spacing.
- `Bullet` renders a semantic `<li>` with the reference four-pixel mark. Place it inside a `<ul>` or `<ol>`.
- `Expander` renders a native `<details>` and `<summary>`. Native `open` and `onToggle` behavior pass through. Its closed height is 32 pixels, and supporting browsers transition the native details content height. The contents use a theme depth one level above the parent. Its optional `icon` receives the accent icon theme and a signal that advances on toggle.

## Reference boundaries

The browser measures and wraps text. Use a ref and `ResizeObserver` when an application needs measured output.

The button surface uses the reference speed-50 hover and press springs, 66 ms pointer sample window, one-frame prediction, and release or cancel lifecycle. Reduced motion snaps each spring to its goal.

The hover surface uses the original sheen image as an alpha mask, so theme colors can tint it with the same light-or-dark relationship as the Roblox decal. Roblox layout properties and `IconPlayer` are not part of the web API.

`TextField` uses native input scrolling instead of the Roblox text scroller. Focus the element through its ref instead of `OnManualFocus`. `Expander` uses native disclosure layout and CSS intrinsic-size interpolation instead of requiring `InnerSize` measurements.

The package does not include RbxVanilla icons or `IconPlayer`. Consumers provide icon content and decide how to respond to the animation signal.
