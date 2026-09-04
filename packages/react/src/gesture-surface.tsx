import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createGestureSurface } from "./button-gesture.js";
import type { GestureSurface } from "./button-gesture.js";
import sheenImage from "./sheen.png";
import type { SensationStyles } from "./styles.js";

export interface GestureSurfaceHandlers<Element extends HTMLElement> {
	onPointerCancel(event: ReactPointerEvent<Element>): void;
	onPointerDown(event: ReactPointerEvent<Element>): void;
	onPointerEnter(event: ReactPointerEvent<Element>): void;
	onPointerLeave(event: ReactPointerEvent<Element>): void;
	onPointerMove(event: ReactPointerEvent<Element>): void;
	onPointerUp(event: ReactPointerEvent<Element>): void;
}

export function useGestureSurface<Element extends HTMLElement>(
	enabled = true,
): GestureSurfaceHandlers<Element> {
	const gesture = useRef<GestureSurface | null>(null);
	const target = useRef<Element | null>(null);
	const enabledRef = useRef(enabled);
	enabledRef.current = enabled;

	const getGesture = (element: Element): GestureSurface => {
		if (target.current !== element) {
			gesture.current?.destroy();
			target.current = element;
			gesture.current = createGestureSurface(element);
			gesture.current.setEnabled(enabledRef.current);
		}
		const current = gesture.current;
		if (current === null) {
			throw new Error("Gesture surface was not initialized.");
		}
		return current;
	};

	useEffect(() => {
		gesture.current?.setEnabled(enabled);
	}, [enabled]);

	useEffect(
		() => () => {
			gesture.current?.destroy();
		},
		[],
	);

	return {
		onPointerCancel: (event) => getGesture(event.currentTarget).pointerCancel(event),
		onPointerDown: (event) => getGesture(event.currentTarget).pointerDown(event),
		onPointerEnter: (event) => getGesture(event.currentTarget).pointerEnter(event),
		onPointerLeave: (event) => getGesture(event.currentTarget).pointerLeave(event),
		onPointerMove: (event) => getGesture(event.currentTarget).pointerMove(event),
		onPointerUp: (event) => getGesture(event.currentTarget).pointerUp(event),
	};
}

export function GestureSheen() {
	const style: SensationStyles = {
		"--sensation-gesture-image": `url("${sheenImage}")`,
	};

	return <span aria-hidden="true" className="sensation-gesture-sheen" style={style} />;
}

export function animateSwitchSmudge(knob: HTMLElement): void {
	const view = knob.ownerDocument.defaultView;
	if (
		(view?.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false) ||
		knob.animate === undefined
	) {
		return;
	}

	for (const animation of knob.getAnimations?.() ?? []) {
		animation.cancel();
	}
	knob.animate([{ scale: "1 1" }, { scale: "1.18 0.82" }, { scale: "1 1" }], {
		duration: 160,
		easing: "cubic-bezier(0.2, 0, 0, 1)",
	});
}
