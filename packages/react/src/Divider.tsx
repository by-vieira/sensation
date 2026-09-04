import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { joinClasses } from "./styles.js";
import type { SensationStyles } from "./styles.js";
import { useTheme } from "./theme.js";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
	readonly orientation?: "horizontal" | "vertical";
}

export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
	{ className, orientation = "horizontal", style, ...divProps },
	ref,
) {
	const theme = useTheme();
	const dividerStyle: SensationStyles = {
		"--sensation-divider-color": theme.fgAtopBg,
		...style,
	};

	return (
		<div
			{...divProps}
			ref={ref}
			aria-orientation={orientation}
			className={joinClasses("sensation-divider", `sensation-divider--${orientation}`, className)}
			role="separator"
			style={dividerStyle}
		/>
	);
});
