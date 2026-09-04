import type { IconRenderContext } from "@morgan-vieira-npm/sensation-theme";
import type { ReactNode } from "react";
import type { SensationStyles } from "./styles.js";

export type IconContent = ReactNode | ((context: IconRenderContext) => ReactNode);

export interface IconSlotProps {
	readonly className?: string;
	readonly context: IconRenderContext;
	readonly icon: IconContent;
}

export function IconSlot({ className, context, icon }: IconSlotProps) {
	const style: SensationStyles = {
		"--sensation-icon-background": context.colors.background,
		"--sensation-icon-primary": context.colors.primary,
		"--sensation-icon-secondary": context.colors.secondary,
		"--sensation-icon-overlay": context.colors.overlay,
	};

	return (
		<span
			aria-hidden="true"
			className={["sensation-icon-slot", className].filter(Boolean).join(" ")}
			data-sensation-icon-animation={context.animation}
			style={style}
		>
			{typeof icon === "function" ? icon(context) : icon}
		</span>
	);
}
