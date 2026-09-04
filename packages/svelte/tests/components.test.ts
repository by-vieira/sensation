import { createRawSnippet, flushSync, mount, unmount } from "svelte";
import type { Component } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import Button from "../src/lib/Button.svelte";
import Bullet from "../src/lib/Bullet.svelte";
import Divider from "../src/lib/Divider.svelte";
import Expander from "../src/lib/Expander.svelte";
import Spacer from "../src/lib/Spacer.svelte";
import Switch from "../src/lib/Switch.svelte";
import Text from "../src/lib/Text.svelte";
import TextField from "../src/lib/TextField.svelte";
import { createButtonGesture } from "../src/lib/button-gesture.js";
import { animateSwitchSmudge } from "../src/lib/gesture-surface.js";
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
	sheen.className = "sensation-gesture-sheen";
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
		const sheen = button?.querySelector<HTMLElement>(".sensation-gesture-sheen");
		vi.spyOn(button!, "getBoundingClientRect").mockReturnValue(new DOMRect(10, 5, 100, 24));

		button?.dispatchEvent(
			new MouseEvent("pointermove", { bubbles: true, clientX: 35, clientY: 17 }),
		);

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
		render(IconButton, {});
		const content = document.querySelector<HTMLElement>(".sensation-button__content");
		const button = document.querySelector<HTMLButtonElement>("[data-action='icon']");
		const icon = document.querySelector<HTMLElement>(".sensation-icon-slot");

		expect(content?.querySelector("[data-icon='check']")).toBeInstanceOf(SVGElement);
		expect(content?.textContent).toContain("Save");
		expect(icon?.dataset.sensationIconAnimation).toBe("0");
		expect(icon?.style.getPropertyValue("--sensation-icon-primary")).not.toBe("");

		button?.click();
		flushSync();
		expect(icon?.dataset.sensationIconAnimation).toBe("1");
	});
});

describe("TextField", () => {
	it("associates its label, help text, and error with a native input", () => {
		render(TextField, {
			value: "latest!",
			error: "Use a valid tag.",
			helpText: "The npm distribution tag.",
			label: "Release tag",
			name: "tag",
		});
		const input = document.querySelector<HTMLInputElement>("input");
		const label = document.querySelector<HTMLLabelElement>("label");
		const describedBy = input?.getAttribute("aria-describedby")?.split(" ") ?? [];

		expect(label?.htmlFor).toBe(input?.id);
		expect(input?.getAttribute("aria-invalid")).toBe("true");
		expect(describedBy).toHaveLength(2);
		expect(describedBy.every((id) => document.getElementById(id) !== null)).toBe(true);
	});

	it("keeps native form, focus, selection, disabled, and read-only behavior", () => {
		const form = document.createElement("form");
		document.body.append(form);
		render(
			TextField,
			{
				label: "Package",
				name: "package",
				value: "sensation",
			},
			form,
		);
		render(
			TextField,
			{
				label: "Registry",
				name: "registry",
				readonly: true,
				value: "locked",
			},
			form,
		);
		render(
			TextField,
			{
				disabled: true,
				label: "Disabled",
				name: "disabled",
				value: "ignored",
			},
			form,
		);
		const packageInput = form.querySelector<HTMLInputElement>("[name='package']");

		packageInput?.focus();
		packageInput?.setSelectionRange(2, 7);
		const data = new FormData(form);

		expect(document.activeElement).toBe(packageInput);
		expect(packageInput?.selectionStart).toBe(2);
		expect(packageInput?.selectionEnd).toBe(7);
		expect(data.get("package")).toBe("sensation");
		expect(data.get("registry")).toBe("locked");
		expect(data.has("disabled")).toBe(false);
	});

	it("renders a native textarea and a consumer-owned icon", () => {
		const icon = createRawSnippet(() => ({
			render: () => '<svg data-icon="search"></svg>',
		}));
		render(TextField, {
			icon,
			label: "Notes",
			multiline: true,
			rows: 4,
		});
		const textarea = document.querySelector<HTMLTextAreaElement>("textarea");
		const iconSlot = document.querySelector<HTMLElement>(".sensation-icon-slot");

		expect(textarea?.rows).toBe(4);
		expect(iconSlot?.querySelector("[data-icon='search']")).toBeInstanceOf(SVGElement);
	});

	it("renders the animated foreground placeholder, edge fades, and gesture surface", () => {
		const icon = createRawSnippet(() => ({ render: () => "<svg></svg>" }));
		render(TextField, { icon, label: "Search", placeholder: "Find a package" });
		const control = document.querySelector<HTMLElement>(".sensation-text-field__control");
		const input = document.querySelector<HTMLInputElement>("input");
		const placeholder = document.querySelector<HTMLElement>(".sensation-text-field__placeholder");
		const iconSlot = document.querySelector<HTMLElement>(".sensation-icon-slot");

		expect(control?.classList).toContain("sensation-effect--bevel-inset");
		expect(control?.classList).toContain("sensation-effect--halo");
		expect(control?.querySelector(".sensation-gesture-sheen")).not.toBeNull();
		expect(control?.querySelectorAll(".sensation-text-field__scroll-fade")).toHaveLength(2);
		expect(placeholder?.textContent).toBe("Find a package");
		expect(iconSlot?.dataset.sensationIconAnimation).toBe("0");

		input?.focus();
		flushSync();
		expect(iconSlot?.dataset.sensationIconAnimation).toBe("1");
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

	it("keeps one controlled native checkbox and its form value", async () => {
		const changed = vi.fn();
		const form = document.createElement("form");
		document.body.append(form);
		components.push(
			mount(Switch, {
				props: {
					checked: true,
					description: "Publish after the build.",
					label: "Create release",
					name: "release",
					onchange: changed,
					value: "yes",
				},
				target: form,
			}) as Record<string, unknown>,
		);
		flushSync();
		const checkbox = form.querySelector<HTMLInputElement>("input[type='checkbox']");
		const data = new FormData(form);

		expect(form.querySelectorAll("input")).toHaveLength(1);
		expect(checkbox?.checked).toBe(true);
		expect(checkbox?.getAttribute("aria-describedby")).not.toBeNull();
		expect(data.get("release")).toBe("yes");
		expect(document.querySelector(".sensation-switch__control")?.classList).toContain(
			"sensation-effect--halo",
		);
		expect(
			document.querySelector(".sensation-switch__control .sensation-gesture-sheen"),
		).not.toBeNull();

		checkbox?.click();
		expect(changed).toHaveBeenCalledOnce();
		await Promise.resolve();
		expect(checkbox?.checked).toBe(true);
	});
});

describe("composition components", () => {
	it("uses semantic elements and preserves native disclosure state", async () => {
		const icon = createRawSnippet(() => ({
			render: () => '<svg data-icon="package"></svg>',
		}));
		render(Divider, { "data-divider": "vertical", orientation: "vertical" });
		components.push(
			mount(Spacer, {
				props: { "data-spacer": "small", size: 12 },
				target: document.body,
			}) as Record<string, unknown>,
		);
		flushSync();
		const list = document.createElement("ul");
		document.body.append(list);
		render(
			Bullet,
			{
				children: createRawSnippet(() => ({ render: () => "<span>Source maps</span>" })),
				"data-bullet": "item",
			},
			list,
		);
		components.push(
			mount(Expander, {
				props: {
					children: createRawSnippet(() => ({
						render: () => "<span>React components</span>",
					})),
					icon,
					open: true,
					title: "Package contents",
				},
				target: document.body,
			}) as Record<string, unknown>,
		);
		flushSync();
		const divider = document.querySelector<HTMLElement>("[data-divider='vertical']");
		const spacer = document.querySelector<HTMLElement>("[data-spacer='small']");
		const bullet = document.querySelector<HTMLElement>("[data-bullet='item']");
		const details = document.querySelector<HTMLDetailsElement>("details");

		expect(divider?.getAttribute("role")).toBe("separator");
		expect(divider?.getAttribute("aria-orientation")).toBe("vertical");
		expect(spacer?.style.getPropertyValue("--sensation-spacer-size")).toBe("12px");
		expect(bullet?.tagName).toBe("LI");
		expect(details?.open).toBe(true);
		expect(details?.querySelector("summary")).not.toBeNull();
		expect(details?.querySelector("summary")?.classList).toContain("sensation-effect--halo");
		expect(details?.querySelector(".sensation-gesture-sheen")).not.toBeNull();
		expect(details?.querySelector("[data-icon='package']")).toBeInstanceOf(SVGElement);
		expect(
			details?.querySelector<HTMLElement>(".sensation-icon-slot")?.dataset.sensationIconAnimation,
		).toBe("0");
		expect(details?.textContent).toContain("React components");

		details?.querySelector("summary")?.click();
		await new Promise((resolve) => setTimeout(resolve, 0));
		flushSync();
		expect(
			details?.querySelector<HTMLElement>(".sensation-icon-slot")?.dataset.sensationIconAnimation,
		).toBe("1");
	});
});

describe("element bindings", () => {
	it("exposes each native element", () => {
		const component = mount(Bindings, { target: document.body });
		components.push(component);
		flushSync();
		const elements = component.getElements();

		expect(elements.button).toBeInstanceOf(HTMLButtonElement);
		expect(elements.bullet).toBeInstanceOf(HTMLLIElement);
		expect(elements.divider).toBeInstanceOf(HTMLDivElement);
		expect(elements.expander).toBeInstanceOf(HTMLDetailsElement);
		expect(elements.panel).toBeInstanceOf(HTMLDivElement);
		expect(elements.spacer).toBeInstanceOf(HTMLSpanElement);
		expect(elements.switch).toBeInstanceOf(HTMLInputElement);
		expect(elements.text).toBeInstanceOf(HTMLSpanElement);
		expect(elements.textField).toBeInstanceOf(HTMLInputElement);
	});
});
