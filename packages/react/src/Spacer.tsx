import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { joinClasses } from "./styles.js";
import type { SensationStyles } from "./styles.js";

export interface SpacerProps extends HTMLAttributes<HTMLSpanElement> {
	readonly size: number | string;
}

function toCssLength(value: number | string): number | string {
	return typeof value === "number" ? `${value}px` : value;
}

export const Spacer = forwardRef<HTMLSpanElement, SpacerProps>(function Spacer(
	{ className, size, style, ...spanProps },
	ref,
) {
	const spacerStyle: SensationStyles = {
		"--sensation-spacer-size": toCssLength(size),
		...style,
	};

	return (
		<span
			{...spanProps}
			ref={ref}
			aria-hidden="true"
			className={joinClasses("sensation-spacer", className)}
			style={spacerStyle}
		/>
	);
});
