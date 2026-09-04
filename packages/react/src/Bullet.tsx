import { forwardRef } from "react";
import type { LiHTMLAttributes } from "react";
import { joinClasses } from "./styles.js";
import type { SensationStyles } from "./styles.js";
import { useTheme } from "./theme.js";

export type BulletProps = LiHTMLAttributes<HTMLLIElement>;

export const Bullet = forwardRef<HTMLLIElement, BulletProps>(function Bullet(
	{ className, style, ...liProps },
	ref,
) {
	const theme = useTheme();
	const bulletStyle: SensationStyles = {
		"--sensation-bullet-color": theme.fgAtopBg,
		...style,
	};

	return (
		<li
			{...liProps}
			ref={ref}
			className={joinClasses("sensation-bullet", className)}
			style={bulletStyle}
		/>
	);
});
