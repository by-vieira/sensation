import { createIconTheme, withZOffset } from "@morgan-vieira-npm/sensation-theme";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { ButtonHTMLAttributes } from "react";
import { GestureSheen, useGestureSurface } from "./gesture-surface.js";
import { IconSlot } from "./IconSlot.js";
import type { IconContent } from "./IconSlot.js";
import { joinClasses } from "./styles.js";
import type { SensationStyles } from "./styles.js";
import { useTheme } from "./theme.js";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	readonly align?: "start" | "center";
	readonly flat?: boolean;
	readonly icon?: IconContent;
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
		icon,
		illuminated = false,
		loading = false,
		onClick,
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
	const [hovering, setHovering] = useState(false);
	const [iconAnimation, setIconAnimation] = useState(0);
	const previousIlluminated = useRef(illuminated);
	const parentTheme = useTheme();
	const raisedTheme = useMemo(() => withZOffset(parentTheme, 1), [parentTheme]);
	const buttonTheme = flat || (subtle && !hovering) ? parentTheme : raisedTheme;
	const iconColors = createIconTheme(buttonTheme, {
		background: illuminated ? "accentAtopBg" : "bg",
		foreground: subtle && !hovering ? "grey" : "fg",
		style: "trio",
	});
	const iconContext = { animation: iconAnimation, colors: iconColors, theme: buttonTheme };
	const gesture = useGestureSurface<HTMLButtonElement>(!(disabled || loading));
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
		"--sensation-button-accent-overlay": raisedTheme.pureAtopAccentAtopBg,
		"--sensation-button-radius": parentTheme.effects.controlRadius,
		"--sensation-effect-bevel-highlight": parentTheme.effects.bevelHighlight,
		"--sensation-effect-bevel-shadow": parentTheme.effects.bevelShadow,
		"--sensation-effect-bevel-thickness": parentTheme.effects.bevelThickness,
		"--sensation-effect-halo-color": parentTheme.focus,
		"--sensation-effect-halo-thickness": parentTheme.effects.haloThickness,
		"--sensation-effect-halo-offset": parentTheme.effects.haloOffset,
		"--sensation-effect-motion": parentTheme.motion.responsiveDuration,
		"--sensation-effect-motion-reduced": parentTheme.motion.reducedDuration,
		"--sensation-effect-easing": parentTheme.motion.easing,
		"--sensation-gesture-color": raisedTheme.pureAtopBg,
		"--sensation-button-motion": parentTheme.motion.responsiveDuration,
		"--sensation-button-motion-reduced": parentTheme.motion.reducedDuration,
		"--sensation-button-easing": parentTheme.motion.easing,
		...style,
	};
	const ariaBusy = loading ? true : buttonProps["aria-busy"];

	useEffect(() => {
		if (illuminated && !previousIlluminated.current) {
			setIconAnimation((animation) => animation + 1);
		}
		previousIlluminated.current = illuminated;
	}, [illuminated]);

	return (
		<button
			{...buttonProps}
			ref={ref}
			aria-busy={ariaBusy}
			className={joinClasses(
				"sensation-button",
				"sensation-effect--bevel-raised",
				"sensation-effect--halo",
				`sensation-button--${align}`,
				flat && "sensation-button--flat",
				illuminated && "sensation-button--illuminated",
				loading && "sensation-button--loading",
				subtle && "sensation-button--subtle",
				className,
			)}
			disabled={disabled || loading}
			onClick={(event) => {
				setIconAnimation((animation) => animation + 1);
				onClick?.(event);
			}}
			onPointerCancel={(event) => {
				gesture.onPointerCancel(event);
				onPointerCancel?.(event);
			}}
			onPointerDown={(event) => {
				gesture.onPointerDown(event);
				onPointerDown?.(event);
			}}
			onPointerEnter={(event) => {
				gesture.onPointerEnter(event);
				if (event.pointerType !== "touch") {
					setHovering(true);
				}
				onPointerEnter?.(event);
			}}
			onPointerLeave={(event) => {
				gesture.onPointerLeave(event);
				if (event.pointerType !== "touch") {
					setHovering(false);
				}
				onPointerLeave?.(event);
			}}
			onPointerMove={(event) => {
				gesture.onPointerMove(event);
				onPointerMove?.(event);
			}}
			onPointerUp={(event) => {
				gesture.onPointerUp(event);
				onPointerUp?.(event);
			}}
			style={buttonStyle}
		>
			<span className="sensation-button__content">
				{icon !== undefined && icon !== null && <IconSlot context={iconContext} icon={icon} />}
				{children}
			</span>
			{loading && (
				<span aria-hidden="true" className="sensation-button__loading-mark">
					•••
				</span>
			)}
			<GestureSheen />
		</button>
	);
});
