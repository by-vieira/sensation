import { act, createRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createButtonGesture } from "./button-gesture.js";
import { animateSwitchSmudge } from "./gesture-surface.js";
import {
	Bullet,
	Button,
	Divider,
	Expander,
	Panel,
	Spacer,
	Switch,
	Text,
	TextField,
	ThemeDepth,
	ThemeProvider,
} from "./index.js";
import type { IconRenderContext } from "./index.js";

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
	sheen.className = "sensation-gesture-sheen";
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
		expect(
			button
				?.querySelector<HTMLElement>(".sensation-gesture-sheen")
				?.style.getPropertyValue("--sensation-gesture-image"),
		).not.toBe("");
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
		const sheen = button?.querySelector<HTMLElement>(".sensation-gesture-sheen");
		vi.spyOn(button!, "getBoundingClientRect").mockReturnValue(new DOMRect(10, 5, 100, 24));

		act(() => {
			button?.dispatchEvent(
				new MouseEvent("pointermove", { bubbles: true, clientX: 35, clientY: 17 }),
			);
		});

		expect(sheen?.style.getPropertyValue("--sensation-gesture-pointer-x")).toBe("25px");
		expect(sheen?.style.getPropertyValue("--sensation-gesture-pointer-y")).toBe("12px");
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
		expect(Number(sheen.style.getPropertyValue("--sensation-gesture-sheen-opacity"))).toBeCloseTo(
			firstFrameResponse * 0.5,
			8,
		);
		expect(sheen.style.getPropertyValue("--sensation-gesture-sheen-size")).toBe("400px");

		gesture.pointerMove({ ...pointer, clientX: 45 });
		animation.step();
		gesture.pointerMove({ ...pointer, clientX: 55 });
		animation.step();
		expect(
			Number.parseFloat(sheen.style.getPropertyValue("--sensation-gesture-pointer-x")),
		).toBeCloseTo(55, 8);

		gesture.pointerDown({ ...pointer, clientX: 55 });
		animation.step();
		const hoverResponse = 1 - Math.exp((-50 * 4) / 60) * (1 + (50 * 4) / 60);
		const expectedOpacity = (hoverResponse - firstFrameResponse ** 2) * 0.5;
		expect(Number(sheen.style.getPropertyValue("--sensation-gesture-sheen-opacity"))).toBeCloseTo(
			expectedOpacity,
			8,
		);
		expect(Number(sheen.style.getPropertyValue("--sensation-gesture-sheen-scale"))).toBeCloseTo(
			1 - Math.sqrt(firstFrameResponse),
			8,
		);

		const pointerUp = new Event("pointerup", { bubbles: true });
		Object.defineProperty(pointerUp, "pointerId", { value: pointer.pointerId });
		document.dispatchEvent(pointerUp);
		for (let frame = 0; frame < 20; frame += 1) {
			animation.step();
		}
		expect(Number(sheen.style.getPropertyValue("--sensation-gesture-sheen-scale"))).toBeGreaterThan(
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
		expect(sheen.style.getPropertyValue("--sensation-gesture-sheen-opacity")).toBe("0.5");
		gesture.pointerDown(pointer);
		expect(sheen.style.getPropertyValue("--sensation-gesture-sheen-opacity")).toBe("0");
		expect(sheen.style.getPropertyValue("--sensation-gesture-sheen-scale")).toBe("0");

		gesture.destroy();
	});

	it("gives consumer icons themed channels and an interaction animation signal", () => {
		let receivedContext: IconRenderContext | undefined;
		const container = render(
			<ThemeProvider>
				<Button
					data-action="icon"
					icon={(context) => {
						receivedContext = context;
						return <svg aria-hidden="true" data-icon="check" />;
					}}
				>
					Save
				</Button>
			</ThemeProvider>,
		);
		const button = container.querySelector<HTMLButtonElement>("[data-action='icon']");
		const content = container.querySelector<HTMLElement>(".sensation-button__content");
		const icon = container.querySelector<HTMLElement>(".sensation-icon-slot");

		expect(content?.querySelector("[data-icon='check']")).toBeInstanceOf(SVGElement);
		expect(content?.textContent).toContain("Save");
		expect(icon?.dataset.sensationIconAnimation).toBe("0");
		expect(icon?.style.getPropertyValue("--sensation-icon-primary")).toBe(
			receivedContext?.colors.primary,
		);

		act(() => button?.click());
		expect(icon?.dataset.sensationIconAnimation).toBe("1");
	});
});

describe("TextField", () => {
	it("associates its label, help text, and error with a native input", () => {
		const ref = createRef<HTMLInputElement>();
		const container = render(
			<ThemeProvider>
				<TextField
					ref={ref}
					defaultValue="latest!"
					error="Use a valid tag."
					helpText="The npm distribution tag."
					label="Release tag"
					name="tag"
				/>
			</ThemeProvider>,
		);
		const input = container.querySelector<HTMLInputElement>("input");
		const label = container.querySelector<HTMLLabelElement>("label");
		const describedBy = input?.getAttribute("aria-describedby")?.split(" ") ?? [];

		expect(ref.current).toBe(input);
		expect(label?.htmlFor).toBe(input?.id);
		expect(input?.getAttribute("aria-invalid")).toBe("true");
		expect(describedBy).toHaveLength(2);
		expect(describedBy.every((id) => document.getElementById(id) !== null)).toBe(true);
	});

	it("keeps native form, editing, selection, disabled, and read-only behavior", () => {
		const submitted = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
		const container = render(
			<ThemeProvider>
				<form onSubmit={submitted}>
					<TextField defaultValue="sensation" label="Package" name="package" />
					<TextField defaultValue="locked" label="Registry" name="registry" readOnly />
					<TextField defaultValue="ignored" disabled label="Disabled" name="disabled" />
					<button type="submit">Submit</button>
				</form>
			</ThemeProvider>,
		);
		const packageInput = container.querySelector<HTMLInputElement>("[name='package']");
		const form = container.querySelector<HTMLFormElement>("form");
		const submit = container.querySelector<HTMLButtonElement>("button");

		packageInput?.focus();
		packageInput?.setSelectionRange(2, 7);
		act(() => submit?.click());
		const data = new FormData(form ?? undefined);

		expect(document.activeElement).toBe(packageInput);
		expect(packageInput?.selectionStart).toBe(2);
		expect(packageInput?.selectionEnd).toBe(7);
		expect(data.get("package")).toBe("sensation");
		expect(data.get("registry")).toBe("locked");
		expect(data.has("disabled")).toBe(false);
		expect(submitted).toHaveBeenCalledOnce();
	});

	it("renders a native textarea and a consumer-owned icon", () => {
		const ref = createRef<HTMLTextAreaElement>();
		const container = render(
			<ThemeProvider>
				<TextField ref={ref} icon={<svg data-icon="search" />} label="Notes" multiline rows={4} />
			</ThemeProvider>,
		);
		const textarea = container.querySelector<HTMLTextAreaElement>("textarea");
		const iconSlot = container.querySelector<HTMLElement>(".sensation-icon-slot");

		expect(ref.current).toBe(textarea);
		expect(textarea?.rows).toBe(4);
		expect(iconSlot?.querySelector("[data-icon='search']")).toBeInstanceOf(SVGElement);
	});

	it("renders the animated foreground placeholder, edge fades, and gesture surface", () => {
		const container = render(
			<ThemeProvider>
				<TextField icon={() => <svg />} label="Search" placeholder="Find a package" />
			</ThemeProvider>,
		);
		const control = container.querySelector<HTMLElement>(".sensation-text-field__control");
		const input = container.querySelector<HTMLInputElement>("input");
		const placeholder = container.querySelector<HTMLElement>(".sensation-text-field__placeholder");
		const icon = container.querySelector<HTMLElement>(".sensation-icon-slot");

		expect(control?.classList).toContain("sensation-effect--bevel-inset");
		expect(control?.classList).toContain("sensation-effect--halo");
		expect(control?.querySelector(".sensation-gesture-sheen")).not.toBeNull();
		expect(control?.querySelectorAll(".sensation-text-field__scroll-fade")).toHaveLength(2);
		expect(placeholder?.textContent).toBe("Find a package");
		expect(icon?.dataset.sensationIconAnimation).toBe("0");

		act(() => input?.focus());
		expect(icon?.dataset.sensationIconAnimation).toBe("1");
	});
});

describe("Switch", () => {
	it("omits the transition smudge under reduced motion", () => {
		const animate = vi.fn();
		const knob = document.createElement("span");
		Object.defineProperty(knob, "animate", { configurable: true, value: animate });
		vi.stubGlobal("matchMedia", () => ({ matches: true }));

		animateSwitchSmudge(knob);

		expect(animate).not.toHaveBeenCalled();
	});

	it("keeps one controlled native checkbox and its form value", () => {
		const animate = vi.fn(() => ({ cancel: vi.fn() }) as unknown as Animation);
		function Fixture() {
			const [checked, setChecked] = useState(false);

			return (
				<form>
					<Switch
						checked={checked}
						description="Publish after the build."
						label="Create release"
						name="release"
						onChange={(event) => setChecked(event.currentTarget.checked)}
						value="yes"
					/>
				</form>
			);
		}

		const container = render(
			<ThemeProvider>
				<Fixture />
			</ThemeProvider>,
		);
		const checkbox = container.querySelector<HTMLInputElement>("input[type='checkbox']");
		const control = container.querySelector<HTMLElement>(".sensation-switch__control");
		const knob = container.querySelector<HTMLElement>(".sensation-switch__knob");
		if (knob !== null)
			Object.defineProperty(knob, "animate", { configurable: true, value: animate });

		act(() => checkbox?.click());
		const data = new FormData(container.querySelector("form") ?? undefined);

		expect(container.querySelectorAll("input")).toHaveLength(1);
		expect(checkbox?.checked).toBe(true);
		expect(checkbox?.getAttribute("aria-describedby")).not.toBeNull();
		expect(data.get("release")).toBe("yes");
		expect(control?.classList).toContain("sensation-effect--halo");
		expect(control?.querySelector(".sensation-gesture-sheen")).not.toBeNull();
		expect(animate).toHaveBeenCalledOnce();
	});
});

describe("composition components", () => {
	it("uses semantic elements and preserves native disclosure state", async () => {
		const expanderRef = createRef<HTMLDetailsElement>();
		const container = render(
			<ThemeProvider>
				<Divider data-divider="vertical" orientation="vertical" />
				<Spacer data-spacer="small" size={12} />
				<ul>
					<Bullet data-bullet="item">Source maps</Bullet>
				</ul>
				<Expander
					ref={expanderRef}
					icon={<svg data-icon="package" />}
					open
					title="Package contents"
				>
					<Text data-expander-content="text">React components</Text>
				</Expander>
			</ThemeProvider>,
		);
		const divider = container.querySelector<HTMLElement>("[data-divider='vertical']");
		const spacer = container.querySelector<HTMLElement>("[data-spacer='small']");
		const bullet = container.querySelector<HTMLElement>("[data-bullet='item']");
		const details = container.querySelector<HTMLDetailsElement>("details");

		expect(divider?.getAttribute("role")).toBe("separator");
		expect(divider?.getAttribute("aria-orientation")).toBe("vertical");
		expect(spacer?.style.getPropertyValue("--sensation-spacer-size")).toBe("12px");
		expect(bullet?.tagName).toBe("LI");
		expect(expanderRef.current).toBe(details);
		expect(details?.open).toBe(true);
		expect(details?.querySelector("summary")).not.toBeNull();
		expect(details?.querySelector("summary")?.classList).toContain("sensation-effect--halo");
		expect(details?.querySelector(".sensation-gesture-sheen")).not.toBeNull();
		expect(details?.querySelector("[data-icon='package']")).toBeInstanceOf(SVGElement);
		expect(
			details?.querySelector<HTMLElement>(".sensation-icon-slot")?.dataset.sensationIconAnimation,
		).toBe("0");
		expect(container.querySelector("[data-expander-content='text']")).not.toBeNull();

		await act(async () => {
			details?.querySelector("summary")?.click();
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		expect(
			details?.querySelector<HTMLElement>(".sensation-icon-slot")?.dataset.sensationIconAnimation,
		).toBe("1");
	});
});
