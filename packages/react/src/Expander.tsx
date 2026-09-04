import { createIconTheme, withZOffset } from "@morgan-vieira-npm/sensation-theme";
import { forwardRef, useRef, useState } from "react";
import type { DetailsHTMLAttributes, ReactNode } from "react";
import { GestureSheen, useGestureSurface } from "./gesture-surface.js";
import { IconSlot } from "./IconSlot.js";
import type { IconContent } from "./IconSlot.js";
import { joinClasses } from "./styles.js";
import type { SensationStyles } from "./styles.js";
import { ThemeDepth, useTheme } from "./theme.js";

export interface ExpanderProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
	readonly icon?: IconContent;
	readonly title: ReactNode;
}

export const Expander = forwardRef<HTMLDetailsElement, ExpanderProps>(function Expander(
	{ children, className, icon, onToggle, style, title, ...detailsProps },
	ref,
) {
	const [iconAnimation, setIconAnimation] = useState(0);
	const previousOpen = useRef(Boolean(detailsProps.open));
	const parentTheme = useTheme();
	const panelTheme = withZOffset(parentTheme, 1);
	const iconColors = createIconTheme(panelTheme, {
		background: "bg",
		foreground: "accent",
		style: "trio",
	});
	const iconContext = { animation: iconAnimation, colors: iconColors, theme: panelTheme };
	const gesture = useGestureSurface<HTMLElement>();
	const expanderStyle: SensationStyles = {
		"--sensation-expander-bg": panelTheme.bg,
		"--sensation-expander-fg": panelTheme.fgAtopBg,
		"--sensation-expander-accent": panelTheme.accentAtopBg,
		"--sensation-expander-radius": panelTheme.effects.panelRadius,
		"--sensation-effect-shadow-color": panelTheme.effects.shadow,
		"--sensation-effect-shadow-thickness": panelTheme.effects.shadowThickness,
		"--sensation-effect-halo-color": panelTheme.focus,
		"--sensation-effect-halo-thickness": panelTheme.effects.haloThickness,
		"--sensation-effect-halo-offset": panelTheme.effects.haloOffset,
		"--sensation-effect-motion": panelTheme.motion.responsiveDuration,
		"--sensation-effect-motion-reduced": panelTheme.motion.reducedDuration,
		"--sensation-effect-easing": panelTheme.motion.easing,
		"--sensation-gesture-color": panelTheme.pureAtopBg,
		"--sensation-expander-motion": panelTheme.motion.responsiveDuration,
		"--sensation-expander-motion-reduced": panelTheme.motion.reducedDuration,
		"--sensation-expander-easing": panelTheme.motion.easing,
		...style,
	};

	return (
		<ThemeDepth offset={1}>
			<details
				{...detailsProps}
				ref={ref}
				className={joinClasses("sensation-expander", "sensation-effect--shadow-raised", className)}
				onToggle={(event) => {
					if (event.currentTarget.open !== previousOpen.current) {
						setIconAnimation((animation) => animation + 1);
					}
					previousOpen.current = event.currentTarget.open;
					onToggle?.(event);
				}}
				style={expanderStyle}
			>
				<summary {...gesture} className="sensation-expander__summary sensation-effect--halo">
					{icon !== undefined && icon !== null && (
						<IconSlot className="sensation-expander__icon" context={iconContext} icon={icon} />
					)}
					<span className="sensation-expander__title">{title}</span>
					{(icon === undefined || icon === null) && (
						<svg aria-hidden="true" className="sensation-expander__chevron" viewBox="0 0 16 16">
							<path d="m6 4 4 4-4 4" />
						</svg>
					)}
					<GestureSheen />
				</summary>
				<div className="sensation-expander__content">{children}</div>
			</details>
		</ThemeDepth>
	);
});
