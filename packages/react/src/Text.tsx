import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { joinClasses } from "./styles.js";
import type { SensationStyles } from "./styles.js";
import { useTheme } from "./theme.js";

export type TextVariant = "normal" | "grey" | "heading" | "accent" | "atopAccent";
export type TextAlignment = "start" | "mid" | "end";

export interface TextAlign {
	readonly x?: TextAlignment;
	readonly y?: TextAlignment;
}

export interface TextProps extends HTMLAttributes<HTMLSpanElement> {
	readonly align?: TextAlign;
	readonly variant?: TextVariant;
}

export const Text = forwardRef<HTMLSpanElement, TextProps>(function Text(
	{ align, className, style, variant = "normal", ...spanProps },
	ref,
) {
	const theme = useTheme();
	const color =
		variant === "accent"
			? theme.accentAtopBg
			: variant === "atopAccent"
				? theme.fgAtopAccentAtopBg
				: variant === "grey"
					? theme.greyAtopBg
					: theme.fgAtopBg;
	const textStyle: SensationStyles = {
		"--sensation-text-color": color,
		alignContent:
			align?.y === "mid"
				? "center"
				: align?.y === "start" || align?.y === "end"
					? align.y
					: undefined,
		display: align?.y === undefined ? undefined : "inline-grid",
		textAlign: align?.x === "mid" ? "center" : align?.x,
		...style,
	};

	return (
		<span
			{...spanProps}
			ref={ref}
			className={joinClasses("sensation-text", `sensation-text--${variant}`, className)}
			style={textStyle}
		/>
	);
});
