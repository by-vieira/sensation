import { act, createRef } from "react";
import type { FormEvent, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createButtonGesture } from "./button-gesture.js";
import { Button, Panel, Text, ThemeDepth, ThemeProvider } from "./index.js";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const roots: Root[] = [];

function render(node: ReactNode): HTMLElement {
	const container = document.createElement("div");
	document.body.append(container);
	const root = createRoot(container);
	roots.push(root);
	act(() => root.render(node));
	return container;
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

afterEach(() => {
	for (const root of roots.splice(0)) {
		act(() => root.unmount());
	}

	document.body.replaceChildren();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("Text", () => {
	it("maps RbxSensation text variants to the current theme", () => {
		const ref = createRef<HTMLSpanElement>();
		const container = render(
			<ThemeProvider>
				<Text ref={ref} align={{ x: "end", y: "mid" }} data-kind="normal">
					Normal
				</Text>
				<Text data-kind="grey" variant="grey">
					Grey
				</Text>
				<Text data-kind="heading" variant="heading">
					Heading
				</Text>
			</ThemeProvider>,
		);

		const normal = container.querySelector<HTMLElement>("[data-kind='normal']");
		const grey = container.querySelector<HTMLElement>("[data-kind='grey']");
		const heading = container.querySelector<HTMLElement>("[data-kind='heading']");

		expect(normal?.style.getPropertyValue("--sensation-text-color")).not.toBe("");
		expect(ref.current).toBe(normal);
		expect(normal?.style.alignContent).toBe("center");
		expect(normal?.style.display).toBe("inline-grid");
		expect(normal?.style.textAlign).toBe("end");
		expect(grey?.style.getPropertyValue("--sensation-text-color")).not.toBe(
			normal?.style.getPropertyValue("--sensation-text-color"),
		);
		expect(heading?.classList).toContain("sensation-text--heading");
	});
});

describe("Panel", () => {
	it("uses the surrounding depth and forwards its ref", () => {
		const ref = createRef<HTMLDivElement>();
		const container = render(
			<ThemeProvider zDepth={9}>
				<ThemeDepth offset={4}>
					<Panel ref={ref} data-panel="raised">
						<Text data-child="text">Nested</Text>
					</Panel>
				</ThemeDepth>
			</ThemeProvider>,
		);

		const panel = container.querySelector<HTMLElement>("[data-panel='raised']");
		const child = container.querySelector<HTMLElement>("[data-child='text']");

		expect(ref.current).toBe(panel);
		expect(panel?.dataset.sensationDepth).toBe("10");
		expect(panel?.style.getPropertyValue("--sensation-panel-bg")).not.toBe("");
		expect(child?.style.getPropertyValue("--sensation-text-color")).not.toBe("");
	});
});

describe("Button", () => {
	it("keeps native attributes, form behavior, events, and refs", () => {
		const clicked = vi.fn();
		const submitted = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
		const ref = createRef<HTMLButtonElement>();
		const container = render(
			<ThemeProvider>
				<form onSubmit={submitted}>
					<Button ref={ref} data-action="save" name="intent" onClick={clicked} value="save">
						Save
					</Button>
				</form>
			</ThemeProvider>,
		);
		const button = container.querySelector<HTMLButtonElement>("[data-action='save']");

		act(() => button?.click());

		expect(ref.current).toBe(button);
		expect(button?.name).toBe("intent");
		expect(button?.value).toBe("save");
		expect(button?.type).toBe("submit");
		expect(button?.style.getPropertyValue("--sensation-button-sheen-image")).not.toBe("");
		expect(clicked).toHaveBeenCalledOnce();
		expect(submitted).toHaveBeenCalledOnce();
	});

	it("uses native disabled and pressed states for loading and selection", () => {
		const clicked = vi.fn();
		const container = render(
			<ThemeProvider>
				<Button aria-pressed="true" data-action="selected">
					Selected
				</Button>
				<Button data-action="loading" loading onClick={clicked}>
					Save
				</Button>
			</ThemeProvider>,
		);
		const selected = container.querySelector<HTMLButtonElement>("[data-action='selected']");
		const loading = container.querySelector<HTMLButtonElement>("[data-action='loading']");

		act(() => loading?.click());

		expect(selected?.getAttribute("aria-pressed")).toBe("true");
		expect(loading?.disabled).toBe(true);
		expect(loading?.getAttribute("aria-busy")).toBe("true");
		expect(loading?.textContent).toContain("Save");
		expect(clicked).not.toHaveBeenCalled();
	});

	it("tracks the pointer for the hover sheen and forwards pointer events", () => {
		const moved = vi.fn();
		const container = render(
			<ThemeProvider>
				<Button data-action="hover" onPointerMove={moved}>
					Hover
				</Button>
			</ThemeProvider>,
		);
		const button = container.querySelector<HTMLButtonElement>("[data-action='hover']");
		const sheen = button?.querySelector<HTMLElement>(".sensation-button__sheen");
		vi.spyOn(button!, "getBoundingClientRect").mockReturnValue(new DOMRect(10, 5, 100, 24));

		act(() => {
			button?.dispatchEvent(
				new MouseEvent("pointermove", { bubbles: true, clientX: 35, clientY: 17 }),
			);
		});

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
		const container = render(
			<ThemeProvider>
				<Button data-action="icon">
					<svg aria-hidden="true" data-icon="check" />
					Save
				</Button>
			</ThemeProvider>,
		);
		const content = container.querySelector<HTMLElement>(".sensation-button__content");

		expect(content?.querySelector("[data-icon='check']")).toBeInstanceOf(SVGElement);
		expect(content?.textContent).toContain("Save");
	});
});
