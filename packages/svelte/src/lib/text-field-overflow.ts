export interface TextFieldOverflowObserver {
	destroy(): void;
	update(): void;
}

export function observeTextFieldOverflow(
	input: HTMLInputElement | HTMLTextAreaElement,
	target: HTMLElement,
): TextFieldOverflowObserver {
	const view = input.ownerDocument.defaultView;

	function update(): void {
		if (input instanceof HTMLTextAreaElement) {
			target.toggleAttribute("data-sensation-scroll-start", false);
			target.toggleAttribute("data-sensation-scroll-end", false);
			target.style.removeProperty("--sensation-field-scroll-start-width");
			target.style.removeProperty("--sensation-field-scroll-end-width");
			return;
		}

		const maximum = Math.max(0, input.scrollWidth - input.clientWidth);
		const direction = view?.getComputedStyle(input).direction ?? "ltr";
		const position =
			direction === "rtl"
				? input.scrollLeft < 0
					? -input.scrollLeft
					: maximum - input.scrollLeft
				: input.scrollLeft;
		const hasOverflow = maximum > 1;
		const startWidth = hasOverflow ? Math.min(32, (6 + position) * 2) : 0;
		const endWidth = hasOverflow ? Math.min(32, (6 + maximum - position) * 2) : 0;
		target.toggleAttribute("data-sensation-scroll-start", hasOverflow);
		target.toggleAttribute("data-sensation-scroll-end", hasOverflow);
		target.style.setProperty("--sensation-field-scroll-start-width", `${startWidth}px`);
		target.style.setProperty("--sensation-field-scroll-end-width", `${endWidth}px`);
	}

	input.addEventListener("focus", update);
	input.addEventListener("input", update);
	input.addEventListener("scroll", update);
	input.addEventListener("select", update);
	view?.addEventListener("resize", update);
	const observer = view?.ResizeObserver === undefined ? null : new view.ResizeObserver(update);
	observer?.observe(input);
	update();

	return {
		destroy() {
			input.removeEventListener("focus", update);
			input.removeEventListener("input", update);
			input.removeEventListener("scroll", update);
			input.removeEventListener("select", update);
			view?.removeEventListener("resize", update);
			observer?.disconnect();
			target.style.removeProperty("--sensation-field-scroll-start-width");
			target.style.removeProperty("--sensation-field-scroll-end-width");
		},
		update,
	};
}
