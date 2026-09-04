import type { CSSProperties } from "react";

export type SensationStyles = CSSProperties & {
	[key: `--sensation-${string}`]: string | number;
};

export function joinClasses(...classes: Array<string | false | undefined>): string {
	return classes
		.filter((className): className is string => typeof className === "string")
		.join(" ");
}
