import { createRawSnippet, flushSync, mount, unmount } from "svelte";
import type { Component } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import Button from "../src/lib/Button.svelte";
import Text from "../src/lib/Text.svelte";
import { createButtonGesture } from "../src/lib/button-gesture.js";
import Bindings from "./Bindings.svelte";
import DepthPanel from "./DepthPanel.svelte";
import IconButton from "./IconButton.svelte";

const components: Array<Record<string, unknown>> = [];
const content = (text: string) =>
	createRawSnippet(() => ({
		render: () => text,
	}));

function render<Props extends Record<string, unknown>>(
	component: Component<Props>,
	props: NoInfer<Props>,
	target: HTMLElement = document.body,
): void {
	components.push(mount(component, { props, target }) as Record<string, unknown>);
	flushSync();
}

function mockAnimationFrames() {
	let currentTime = 0;
	let nextFrameId = 1;
	let frames = new Map<number, FrameRequestCallback>();

	vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
		const frameId = nextFrameId;
		nextFrameId += 1;
		frames.set(frameId, callback);
		return frameId;
	});
	vi.stubGlobal("cancelAnimationFrame", (frameId: number) => frames.delete(frameId));
	vi.spyOn(window.performance, "now").mockImplementation(() => currentTime);

	return {
		step(elapsed = 1000 / 60) {
			currentTime += elapsed;
			const currentFrames = frames;
			frames = new Map();
			for (const callback of currentFrames.values()) {
				callback(currentTime);
			}
		},
	};
}

function appendSheen(button: HTMLButtonElement): HTMLSpanElement {
	const sheen = document.createElement("span");
	sheen.className = "sensation-button__sheen";
	button.append(sheen);
	return sheen;
}

afterEach(async () => {
	for (const component of components.splice(0)) {
		await unmount(component);
	}

	document.body.replaceChildren();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("Text", () => {
	it("maps RbxSensation text variants to the current theme", () => {
		render(Text, {
			align: { x: "end", y: "mid" },
			children: content("Grey"),
			"data-kind": "grey",
			variant: "grey",
		});
		const text = document.querySelector<HTMLElement>("[data-kind='grey']");

		expect(text?.classList).toContain("sensation-text--grey");
		expect(text?.style.getPropertyValue("--sensation-text-color")).not.toBe("");
		expect(text?.style.alignContent).toBe("center");
		expect(text?.style.display).toBe("inline-grid");
		expect(text?.style.textAlign).toBe("end");
	});
});

describe("Panel", () => {
	it("uses the surrounding clamped depth", () => {
		render(DepthPanel, {});
		const panel = document.querySelector<HTMLElement>("[data-panel='raised']");

		expect(panel?.dataset.sensationDepth).toBe("10");
		expect(panel?.style.getPropertyValue("--sensation-panel-bg")).not.toBe("");
	});
});

describe("Button", () => {
	it("keeps native attributes, form behavior, and events", () => {
		const clicked = vi.fn();
		const submitted = vi.fn((event: SubmitEvent) => event.preventDefault());
		const form = document.createElement("form");
		document.body.append(form);
		form.addEventListener("submit", submitted);
		render(
			Button,
			{
				children: content("Save"),
				"data-action": "save",
				name: "intent",
				onclick: clicked,
				value: "save",
			},
			form,
		);
		const button = form.querySelector<HTMLButtonElement>("[data-action='save']");

		button?.click();

		expect(button?.name).toBe("intent");
		expect(button?.value).toBe("save");
		expect(button?.type).toBe("submit");
		expect(button?.style.getPropertyValue("--sensation-button-sheen-image")).not.toBe("");
		expect(clicked).toHaveBeenCalledOnce();
		expect(submitted).toHaveBeenCalledOnce();
	});

	it("uses native disabled and pressed states for loading and selection", () => {
		const clicked = vi.fn();
		render(Button, {
			children: content("Save"),
			"data-action": "loading",
			loading: true,
			onclick: clicked,
		});
		render(Button, {
			"aria-pressed": true,
			children: content("Selected"),
			"data-action": "selected",
		});
		const loading = document.querySelector<HTMLButtonElement>("[data-action='loading']");
		const selected = document.querySelector<HTMLButtonElement>("[data-action='selected']");

		loading?.click();

		expect(loading?.disabled).toBe(true);
		expect(loading?.getAttribute("aria-busy")).toBe("true");
		expect(loading?.textContent).toContain("Save");
		expect(selected?.getAttribute("aria-pressed")).toBe("true");
		expect(clicked).not.toHaveBeenCalled();
	});

	it("tracks the pointer for the hover sheen and forwards pointer events", () => {
		const moved = vi.fn();
		render(Button, {
			children: content("Hover"),
			"data-action": "hover",
			onpointermove: moved,
		});
		const button = document.querySelector<HTMLButtonElement>("[data-action='hover']");
		const sheen = button?.querySelector<HTMLElement>(".sensation-button__sheen");
		vi.spyOn(button!, "getBoundingClientRect").mockReturnValue(new DOMRect(10, 5, 100, 24));

		button?.dispatchEvent(
			new MouseEvent("pointermove", { bubbles: true, clientX: 35, clientY: 17 }),
		);

		expect(sheen?.style.getPropertyValue("--sensation-button-pointer-x")).toBe("25px");
		expect(sheen?.style.getPropertyValue("--sensation-button-pointer-y")).toBe("12px");
		expect(moved).toHaveBeenCalledOnce();
	});

	it("uses the reference springs, pointer prediction, and release-outside lifecycle", () => {
		const animation = mockAnimationFrames();
		const button = document.createElement("button");
		document.body.append(button);
		const sheen = appendSheen(button);
		vi.spyOn(button, "getBoundingClientRect").mockReturnValue(new DOMRect(10, 5, 100, 24));
		const gesture = createButtonGesture(button);
		const pointer = {
			button: 0,
			clientX: 35,
			clientY: 17,
			isPrimary: true,
			pointerId: 7,
			pointerType: "mouse",
		};

		gesture.pointerEnter(pointer);
		animation.step();
		const firstFrameResponse = 1 - Math.exp(-50 / 60) * (1 + 50 / 60);
		expect(Number(sheen.style.getPropertyValue("--sensation-button-sheen-opacity"))).toBeCloseTo(
			firstFrameResponse * 0.5,
			8,
		);
		expect(sheen.style.getPropertyValue("--sensation-button-sheen-size")).toBe("400px");

		gesture.pointerMove({ ...pointer, clientX: 45 });
		animation.step();
		gesture.pointerMove({ ...pointer, clientX: 55 });
		animation.step();
		expect(
			Number.parseFloat(sheen.style.getPropertyValue("--sensation-button-pointer-x")),
		).toBeCloseTo(55, 8);

		gesture.pointerDown({ ...pointer, clientX: 55 });
		animation.step();
		const hoverResponse = 1 - Math.exp((-50 * 4) / 60) * (1 + (50 * 4) / 60);
		const expectedOpacity = (hoverResponse - firstFrameResponse ** 2) * 0.5;
		expect(Number(sheen.style.getPropertyValue("--sensation-button-sheen-opacity"))).toBeCloseTo(
			expectedOpacity,
			8,
		);
		expect(Number(sheen.style.getPropertyValue("--sensation-button-sheen-scale"))).toBeCloseTo(
			1 - Math.sqrt(firstFrameResponse),
			8,
		);

		const pointerUp = new Event("pointerup", { bubbles: true });
		Object.defineProperty(pointerUp, "pointerId", { value: pointer.pointerId });
		document.dispatchEvent(pointerUp);
		for (let frame = 0; frame < 20; frame += 1) {
			animation.step();
		}
		expect(Number(sheen.style.getPropertyValue("--sensation-button-sheen-scale"))).toBeGreaterThan(
			0.99,
		);

		gesture.destroy();
	});

	it("snaps the reference springs when reduced motion is requested", () => {
		mockAnimationFrames();
		vi.stubGlobal("matchMedia", () => ({
			addEventListener: vi.fn(),
			matches: true,
			removeEventListener: vi.fn(),
		}));
		const button = document.createElement("button");
		document.body.append(button);
		const sheen = appendSheen(button);
		vi.spyOn(button, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 100, 24));
		const gesture = createButtonGesture(button);
		const pointer = {
			button: 0,
			clientX: 50,
			clientY: 12,
			isPrimary: true,
			pointerId: 8,
			pointerType: "mouse",
		};

		gesture.pointerEnter(pointer);
		expect(sheen.style.getPropertyValue("--sensation-button-sheen-opacity")).toBe("0.5");
		gesture.pointerDown(pointer);
		expect(sheen.style.getPropertyValue("--sensation-button-sheen-opacity")).toBe("0");
		expect(sheen.style.getPropertyValue("--sensation-button-sheen-scale")).toBe("0");

		gesture.destroy();
	});

	it("lays out composed icons and labels without an icon API", () => {
		render(IconButton, {});
		const content = document.querySelector<HTMLElement>(".sensation-button__content");

		expect(content?.querySelector("[data-icon='check']")).toBeInstanceOf(SVGElement);
		expect(content?.textContent).toContain("Save");
	});
});

describe("element bindings", () => {
	it("exposes each native element", () => {
		const component = mount(Bindings, { target: document.body });
		components.push(component);
		flushSync();
		const elements = component.getElements();

		expect(elements.button).toBeInstanceOf(HTMLButtonElement);
		expect(elements.panel).toBeInstanceOf(HTMLDivElement);
		expect(elements.text).toBeInstanceOf(HTMLSpanElement);
	});
});
