import { createIconTheme, withZOffset } from "@morgan-vieira-npm/sensation-theme";
import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type {
	CSSProperties,
	FocusEvent as ReactFocusEvent,
	FocusEventHandler,
	InputHTMLAttributes,
	ReactNode,
	TextareaHTMLAttributes,
} from "react";
import { GestureSheen, useGestureSurface } from "./gesture-surface.js";
import { IconSlot } from "./IconSlot.js";
import type { IconContent } from "./IconSlot.js";
import { joinClasses } from "./styles.js";
import type { SensationStyles } from "./styles.js";
import { observeTextFieldOverflow } from "./text-field-overflow.js";
import { useTheme } from "./theme.js";

interface TextFieldSharedProps {
	readonly containerClassName?: string;
	readonly containerStyle?: CSSProperties;
	readonly error?: ReactNode;
	readonly helpText?: ReactNode;
	readonly icon?: IconContent;
	readonly jumbo?: boolean;
	readonly label?: ReactNode;
}

export interface TextFieldInputProps
	extends TextFieldSharedProps, InputHTMLAttributes<HTMLInputElement> {
	readonly multiline?: false;
}

export interface TextFieldTextareaProps
	extends TextFieldSharedProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
	readonly multiline: true;
}

export type TextFieldProps = TextFieldInputProps | TextFieldTextareaProps;
export type TextFieldElement = HTMLInputElement | HTMLTextAreaElement;

function joinIds(...ids: Array<string | undefined>): string | undefined {
	const presentIds = ids.filter((id): id is string => id !== undefined && id.length > 0);
	return presentIds.length === 0 ? undefined : presentIds.join(" ");
}

export const TextField = forwardRef<TextFieldElement, TextFieldProps>(
	function TextField(props, ref) {
		const [focused, setFocused] = useState(false);
		const [iconAnimation, setIconAnimation] = useState(0);
		const elementRef = useRef<TextFieldElement | null>(null);
		const inputAreaRef = useRef<HTMLDivElement | null>(null);
		const generatedId = useId();
		const parentTheme = useTheme();
		const fieldTheme = withZOffset(parentTheme, -1);
		const {
			"aria-describedby": describedBy,
			"aria-invalid": ariaInvalid,
			className,
			containerClassName,
			containerStyle,
			disabled,
			error,
			helpText,
			icon,
			id = `sensation-field-${generatedId}`,
			jumbo = false,
			label,
			multiline = false,
			onBlur,
			onFocus,
			placeholder,
			readOnly,
			style,
			...controlProps
		} = props;
		const hasError = error !== undefined && error !== null && error !== false;
		const helpId = helpText === undefined || helpText === null ? undefined : `${id}-help`;
		const errorId = hasError ? `${id}-error` : undefined;
		const iconColors = createIconTheme(fieldTheme, {
			background: "bg",
			foreground: "fg",
			style: "trio",
		});
		const iconContext = { animation: iconAnimation, colors: iconColors, theme: fieldTheme };
		const gesture = useGestureSurface<HTMLLabelElement>(!disabled && !focused);
		const fieldStyle: SensationStyles = {
			"--sensation-field-bg": fieldTheme.bg,
			"--sensation-field-fg": fieldTheme.fgAtopBg,
			"--sensation-field-placeholder": fieldTheme.fgAtopBg,
			"--sensation-field-error": parentTheme.errorAtopBg,
			"--sensation-field-radius": parentTheme.effects.controlRadius,
			"--sensation-effect-bevel-highlight": parentTheme.effects.bevelHighlight,
			"--sensation-effect-bevel-shadow": parentTheme.effects.bevelShadow,
			"--sensation-effect-bevel-thickness": parentTheme.effects.bevelThickness,
			"--sensation-effect-halo-color": parentTheme.focus,
			"--sensation-effect-halo-thickness": parentTheme.effects.haloThickness,
			"--sensation-effect-halo-offset": parentTheme.effects.haloOffset,
			"--sensation-effect-motion": parentTheme.motion.responsiveDuration,
			"--sensation-effect-motion-reduced": parentTheme.motion.reducedDuration,
			"--sensation-effect-easing": parentTheme.motion.easing,
			"--sensation-gesture-color": fieldTheme.pureAtopBg,
			"--sensation-field-motion": parentTheme.motion.responsiveDuration,
			"--sensation-field-motion-reduced": parentTheme.motion.reducedDuration,
			"--sensation-field-easing": parentTheme.motion.easing,
			...containerStyle,
		};
		const setElement = (element: TextFieldElement | null): void => {
			elementRef.current = element;
			if (typeof ref === "function") {
				ref(element);
			} else if (ref !== null) {
				ref.current = element;
			}
		};
		const handleFocus = (event: ReactFocusEvent<TextFieldElement>): void => {
			setFocused(true);
			setIconAnimation((animation) => animation + 1);
			(onFocus as FocusEventHandler<TextFieldElement> | undefined)?.(event);
		};
		const handleBlur = (event: ReactFocusEvent<TextFieldElement>): void => {
			setFocused(false);
			(onBlur as FocusEventHandler<TextFieldElement> | undefined)?.(event);
		};
		const nativeAccessibility = {
			"aria-describedby": joinIds(describedBy, helpId, errorId),
			"aria-invalid": hasError ? true : ariaInvalid,
		};
		const nativeControl = multiline ? (
			<textarea
				{...(controlProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
				{...nativeAccessibility}
				ref={setElement}
				className={joinClasses("sensation-text-field__input", className)}
				disabled={disabled}
				id={id}
				onBlur={handleBlur}
				onFocus={handleFocus}
				placeholder={placeholder}
				readOnly={readOnly}
				style={style}
			/>
		) : (
			<input
				{...(controlProps as InputHTMLAttributes<HTMLInputElement>)}
				{...nativeAccessibility}
				ref={setElement}
				className={joinClasses("sensation-text-field__input", className)}
				disabled={disabled}
				id={id}
				onBlur={handleBlur}
				onFocus={handleFocus}
				placeholder={placeholder}
				readOnly={readOnly}
				style={style}
			/>
		);

		useEffect(() => {
			const element = elementRef.current;
			const inputArea = inputAreaRef.current;
			if (element === null || inputArea === null) {
				return;
			}

			const observer = observeTextFieldOverflow(element, inputArea);
			return () => observer.destroy();
		}, [multiline]);

		return (
			<div
				className={joinClasses(
					"sensation-text-field",
					jumbo && "sensation-text-field--jumbo",
					multiline && "sensation-text-field--multiline",
					containerClassName,
				)}
				data-disabled={disabled || undefined}
				data-invalid={hasError || undefined}
				data-readonly={readOnly || undefined}
				style={fieldStyle}
			>
				{label !== undefined && label !== null && (
					<label className="sensation-text-field__label" htmlFor={id}>
						{label}
					</label>
				)}
				<label
					{...gesture}
					className="sensation-text-field__control sensation-effect--bevel-inset sensation-effect--halo"
					data-sensation-halo-visible={hasError || undefined}
					htmlFor={id}
				>
					{icon !== undefined && icon !== null && (
						<IconSlot className="sensation-text-field__icon" context={iconContext} icon={icon} />
					)}
					<div ref={inputAreaRef} className="sensation-text-field__input-area">
						{nativeControl}
						{placeholder !== undefined && (
							<span aria-hidden="true" className="sensation-text-field__placeholder">
								{placeholder}
							</span>
						)}
						<span
							aria-hidden="true"
							className="sensation-text-field__scroll-fade sensation-text-field__scroll-fade--start"
						/>
						<span
							aria-hidden="true"
							className="sensation-text-field__scroll-fade sensation-text-field__scroll-fade--end"
						/>
					</div>
					<GestureSheen />
				</label>
				{helpText !== undefined && helpText !== null && (
					<span className="sensation-text-field__help" id={helpId}>
						{helpText}
					</span>
				)}
				{hasError && (
					<span className="sensation-text-field__error" id={errorId}>
						{error}
					</span>
				)}
			</div>
		);
	},
);
