import { createGestureSurface } from "./button-gesture.js";

export function gestureSurface(node: HTMLElement, enabled = true) {
	let gesture: ReturnType<typeof createGestureSurface> | null = null;
	let currentEnabled = enabled;
	const getGesture = () => {
		gesture ??= createGestureSurface(node);
		gesture.setEnabled(currentEnabled);
		return gesture;
	};
	const handlers = {
		pointercancel: (event: PointerEvent) => getGesture().pointerCancel(event),
		pointerdown: (event: PointerEvent) => getGesture().pointerDown(event),
		pointerenter: (event: PointerEvent) => getGesture().pointerEnter(event),
		pointerleave: (event: PointerEvent) => getGesture().pointerLeave(event),
		pointermove: (event: PointerEvent) => getGesture().pointerMove(event),
		pointerup: (event: PointerEvent) => getGesture().pointerUp(event),
	};

	for (const [name, handler] of Object.entries(handlers)) {
		node.addEventListener(name, handler as EventListener);
	}
	return {
		destroy() {
			for (const [name, handler] of Object.entries(handlers)) {
				node.removeEventListener(name, handler as EventListener);
			}
			gesture?.destroy();
		},
		update(nextEnabled: boolean) {
			currentEnabled = nextEnabled;
			gesture?.setEnabled(nextEnabled);
		},
	};
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
