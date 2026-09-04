import { forwardRef, useEffect, useId, useRef } from "react";
import type { CSSProperties, InputHTMLAttributes, ReactNode } from "react";
import { animateSwitchSmudge, GestureSheen, useGestureSurface } from "./gesture-surface.js";
import { joinClasses } from "./styles.js";
import type { SensationStyles } from "./styles.js";
import { useTheme } from "./theme.js";

export interface SwitchProps extends Omit<
	InputHTMLAttributes<HTMLInputElement>,
	"checked" | "defaultChecked" | "type"
> {
	readonly checked: boolean;
	readonly containerClassName?: string;
	readonly containerStyle?: CSSProperties;
	readonly description?: ReactNode;
	readonly label?: ReactNode;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
	{
		checked,
		className,
		containerClassName,
		containerStyle,
		description,
		disabled,
		id,
		label,
		style,
		...inputProps
	},
	ref,
) {
	const knobRef = useRef<HTMLSpanElement>(null);
	const mounted = useRef(false);
	const generatedId = useId();
	const inputId = id ?? `sensation-switch-${generatedId}`;
	const descriptionId =
		description === undefined || description === null ? undefined : `${inputId}-description`;
	const describedBy = [inputProps["aria-describedby"], descriptionId]
		.filter((value): value is string => value !== undefined && value.length > 0)
		.join(" ");
	const theme = useTheme();
	const gesture = useGestureSurface<HTMLSpanElement>(!disabled);
	const switchStyle: SensationStyles = {
		"--sensation-switch-label": theme.fgAtopBg,
		"--sensation-switch-description": theme.greyAtopBg,
		"--sensation-switch-off-bg": theme.greyAtopBg,
		"--sensation-switch-off-fg": theme.fgAtopGreyAtopBg,
		"--sensation-switch-on-bg": theme.accentAtopBg,
		"--sensation-switch-on-fg": theme.fgAtopAccentAtopBg,
		"--sensation-effect-bevel-highlight": theme.effects.bevelHighlight,
		"--sensation-effect-bevel-shadow": theme.effects.bevelShadow,
		"--sensation-effect-bevel-thickness": theme.effects.bevelThickness,
		"--sensation-effect-halo-color": theme.focus,
		"--sensation-effect-halo-thickness": theme.effects.haloThickness,
		"--sensation-effect-halo-offset": theme.effects.haloOffset,
		"--sensation-effect-motion": theme.motion.responsiveDuration,
		"--sensation-effect-motion-reduced": theme.motion.reducedDuration,
		"--sensation-effect-easing": theme.motion.easing,
		"--sensation-gesture-color": theme.pureAtopAccentAtopBg,
		"--sensation-switch-motion": theme.motion.responsiveDuration,
		"--sensation-switch-motion-reduced": theme.motion.reducedDuration,
		"--sensation-switch-easing": theme.motion.easing,
		...containerStyle,
	};

	useEffect(() => {
		if (mounted.current && knobRef.current !== null && knobRef.current.animate !== undefined) {
			animateSwitchSmudge(knobRef.current);
		}
		mounted.current = true;
	}, [checked]);

	return (
		<label
			className={joinClasses("sensation-switch", containerClassName)}
			data-disabled={disabled || undefined}
			style={switchStyle}
		>
			{(label !== undefined && label !== null) ||
			(description !== undefined && description !== null) ? (
				<span className="sensation-switch__copy">
					{label !== undefined && label !== null && (
						<span className="sensation-switch__label">{label}</span>
					)}
					{description !== undefined && description !== null && (
						<span className="sensation-switch__description" id={descriptionId}>
							{description}
						</span>
					)}
				</span>
			) : null}
			<span {...gesture} className="sensation-switch__control sensation-effect--halo">
				<input
					{...inputProps}
					ref={ref}
					aria-describedby={describedBy.length === 0 ? undefined : describedBy}
					checked={checked}
					className={joinClasses("sensation-switch__input", className)}
					disabled={disabled}
					id={inputId}
					style={style}
					type="checkbox"
				/>
				<span aria-hidden="true" className="sensation-switch__track sensation-effect--bevel-raised">
					<span ref={knobRef} className="sensation-switch__knob" />
				</span>
				<GestureSheen />
			</span>
		</label>
	);
});
