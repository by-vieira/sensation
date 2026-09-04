import { withZOffset } from "@morgan-vieira-npm/sensation-theme";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { createButtonGesture } from "./button-gesture.js";
import type { ButtonGesture } from "./button-gesture.js";
import sheenImage from "./sheen.png";
import { joinClasses } from "./styles.js";
import type { SensationStyles } from "./styles.js";
import { useTheme } from "./theme.js";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	readonly align?: "start" | "center";
	readonly flat?: boolean;
	readonly illuminated?: boolean;
	readonly loading?: boolean;
	readonly subtle?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{
		align = "center",
		children,
		className,
		disabled,
		flat = false,
		illuminated = false,
		loading = false,
		onPointerCancel,
		onPointerDown,
		onPointerEnter,
		onPointerLeave,
		onPointerMove,
		onPointerUp,
		style,
		subtle = false,
		...buttonProps
	},
	ref,
) {
	const gesture = useRef<ButtonGesture | null>(null);
	const parentTheme = useTheme();
	const raisedTheme = useMemo(() => withZOffset(parentTheme, 1), [parentTheme]);
	const buttonStyle: SensationStyles = {
		"--sensation-button-bg": raisedTheme.bg,
		"--sensation-button-fg": raisedTheme.fgAtopBg,
		"--sensation-button-accent-bg": raisedTheme.accentAtopBg,
		"--sensation-button-accent-fg": raisedTheme.fgAtopAccentAtopBg,
		"--sensation-button-flat-bg": parentTheme.bg,
		"--sensation-button-flat-fg": parentTheme.fgAtopBg,
		"--sensation-button-flat-accent-bg": parentTheme.accentAtopBg,
		"--sensation-button-flat-accent-fg": parentTheme.fgAtopAccentAtopBg,
		"--sensation-button-grey": parentTheme.greyAtopBg,
		"--sensation-button-focus": parentTheme.focus,
		"--sensation-button-focus-gap": parentTheme.bg,
		"--sensation-button-overlay": raisedTheme.pureAtopBg,
		"--sensation-button-accent-overlay": raisedTheme.pureAtopAccentAtopBg,
		"--sensation-button-radius": parentTheme.effects.controlRadius,
		"--sensation-button-bevel-highlight": parentTheme.effects.bevelHighlight,
		"--sensation-button-bevel-shadow": parentTheme.effects.bevelShadow,
		"--sensation-button-motion": parentTheme.motion.responsiveDuration,
		"--sensation-button-motion-reduced": parentTheme.motion.reducedDuration,
		"--sensation-button-easing": parentTheme.motion.easing,
		"--sensation-button-sheen-image": `url("${sheenImage}")`,
		...style,
	};
	const ariaBusy = loading ? true : buttonProps["aria-busy"];
	const getGesture = (button: HTMLButtonElement): ButtonGesture => {
		gesture.current ??= createButtonGesture(button);
		return gesture.current;
	};

	useEffect(() => {
		gesture.current?.setEnabled(!(disabled || loading));
	}, [disabled, loading]);

	useEffect(
		() => () => {
			gesture.current?.destroy();
		},
		[],
	);

	return (
		<button
			{...buttonProps}
			ref={ref}
			aria-busy={ariaBusy}
			className={joinClasses(
				"sensation-button",
				`sensation-button--${align}`,
				flat && "sensation-button--flat",
				illuminated && "sensation-button--illuminated",
				loading && "sensation-button--loading",
				subtle && "sensation-button--subtle",
				className,
			)}
			disabled={disabled || loading}
			onPointerCancel={(event) => {
				getGesture(event.currentTarget).pointerCancel(event);
				onPointerCancel?.(event);
			}}
			onPointerDown={(event) => {
				getGesture(event.currentTarget).pointerDown(event);
				onPointerDown?.(event);
			}}
			onPointerEnter={(event) => {
				getGesture(event.currentTarget).pointerEnter(event);
				onPointerEnter?.(event);
			}}
			onPointerLeave={(event) => {
				getGesture(event.currentTarget).pointerLeave(event);
				onPointerLeave?.(event);
			}}
			onPointerMove={(event) => {
				getGesture(event.currentTarget).pointerMove(event);
				onPointerMove?.(event);
			}}
			onPointerUp={(event) => {
				getGesture(event.currentTarget).pointerUp(event);
				onPointerUp?.(event);
			}}
			style={buttonStyle}
		>
			<span className="sensation-button__content">{children}</span>
			{loading && (
				<span aria-hidden="true" className="sensation-button__loading-mark">
					•••
				</span>
			)}
			<span aria-hidden="true" className="sensation-button__sheen" />
		</button>
	);
});
