import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { joinClasses } from "./styles.js";
import type { SensationStyles } from "./styles.js";
import { useTheme } from "./theme.js";

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
	readonly elevation?: number;
	readonly transparency?: number;
}

function clampTransparency(transparency: number): number {
	return Math.min(Math.max(transparency, 0), 1);
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
	{ children, className, elevation = 0, style, transparency = 0, ...divProps },
	ref,
) {
	const theme = useTheme();
	const panelStyle: SensationStyles = {
		"--sensation-panel-bg": theme.bg,
		"--sensation-panel-radius": theme.effects.panelRadius,
		"--sensation-effect-shadow-color": theme.effects.shadow,
		"--sensation-effect-shadow-thickness": theme.effects.shadowThickness,
		opacity: 1 - clampTransparency(transparency),
		...style,
	};

	return (
		<div
			{...divProps}
			ref={ref}
			className={joinClasses(
				"sensation-panel",
				elevation < 0 ? "sensation-effect--shadow-inset" : "sensation-effect--shadow-raised",
				className,
			)}
			data-sensation-depth={theme.zDepth}
			style={panelStyle}
		>
			{children}
		</div>
	);
});
