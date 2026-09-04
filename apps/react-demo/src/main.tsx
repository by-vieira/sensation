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
	defaultThemeMotion,
	useTheme,
} from "@morgan-vieira-npm/sensation-react";
import type { IconRenderContext } from "@morgan-vieira-npm/sensation-react";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const DEFAULT_ACCENT_COLOR = "#a2caff";
const DEFAULT_ACCENT_HUE = 255;
const REDUCED_MOTION = {
	...defaultThemeMotion,
	quickDuration: defaultThemeMotion.reducedDuration,
	responsiveDuration: defaultThemeMotion.reducedDuration,
};

function toLinearSrgb(channel: number): number {
	return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function getAccentHue(color: string, fallback: number): number {
	const red = toLinearSrgb(Number.parseInt(color.slice(1, 3), 16) / 255);
	const green = toLinearSrgb(Number.parseInt(color.slice(3, 5), 16) / 255);
	const blue = toLinearSrgb(Number.parseInt(color.slice(5, 7), 16) / 255);
	const lightness = Math.cbrt(
		0.412_221_470_8 * red + 0.536_332_536_3 * green + 0.051_445_992_9 * blue,
	);
	const medium = Math.cbrt(
		0.211_903_498_2 * red + 0.680_699_545_1 * green + 0.107_396_956_6 * blue,
	);
	const short = Math.cbrt(0.088_302_461_9 * red + 0.281_718_837_6 * green + 0.629_978_700_5 * blue);
	const a = 1.977_998_495_1 * lightness - 2.428_592_205 * medium + 0.450_593_709_9 * short;
	const b = 0.025_904_037_1 * lightness + 0.782_771_766_2 * medium - 0.808_675_766 * short;

	if (Math.hypot(a, b) < 0.0001) {
		return fallback;
	}

	return (Math.atan2(b, a) * 180) / Math.PI + (b < 0 ? 360 : 0);
}

function CheckIcon({ animation }: IconRenderContext) {
	return (
		<svg
			aria-hidden="true"
			className="fixture-icon"
			data-animation={animation}
			focusable="false"
			viewBox="0 0 16 16"
		>
			<path d="m3 8 3 3 7-7" data-sensation-icon-channel="primary" />
		</svg>
	);
}

function SearchIcon({ animation }: IconRenderContext) {
	return (
		<svg
			aria-hidden="true"
			className="fixture-icon"
			data-animation={animation}
			focusable="false"
			viewBox="0 0 16 16"
		>
			<circle cx="7" cy="7" data-sensation-icon-channel="primary" r="4.5" />
			<path d="m10.5 10.5 3 3" data-sensation-icon-channel="secondary" />
		</svg>
	);
}

function PackageIcon({ animation }: IconRenderContext) {
	return (
		<svg
			aria-hidden="true"
			className="fixture-icon"
			data-animation={animation}
			focusable="false"
			viewBox="0 0 16 16"
		>
			<path
				d="M3 5.5 8 3l5 2.5v5L8 13l-5-2.5zM3 5.5 8 8l5-2.5M8 8v5"
				data-sensation-icon-channel="primary"
			/>
		</svg>
	);
}

function DepthSample({ offset }: { readonly offset: number }) {
	const rootTheme = useTheme();

	return (
		<ThemeDepth offset={offset}>
			<Panel className="depth-sample">
				<Text className="fixture-block" variant="grey">
					z {rootTheme.zDepth + offset}
				</Text>
				<Text className="fixture-block">Background</Text>
			</Panel>
		</ThemeDepth>
	);
}

function FormFixture() {
	const [packageName, setPackageName] = useState("@morgan-vieira-npm/sensation-react");
	const [createRelease, setCreateRelease] = useState(true);
	const [submitted, setSubmitted] = useState("");

	return (
		<form
			className="form-fixture"
			onSubmit={(event) => {
				event.preventDefault();
				const data = new FormData(event.currentTarget);
				setSubmitted(`${data.get("package")} · ${data.has("release") ? "release" : "no release"}`);
			}}
		>
			<TextField
				autoComplete="organization-title"
				helpText="Published package name."
				icon={SearchIcon}
				label="Package"
				name="package"
				onChange={(event) => setPackageName(event.currentTarget.value)}
				placeholder="Package name"
				value={packageName}
			/>
			<TextField
				defaultValue="latest!"
				error="Use letters, numbers, dots, or hyphens."
				label="Release tag"
				name="tag"
			/>
			<TextField
				defaultValue="Adds the remaining foundation components in React and Svelte."
				label="Notes"
				multiline
				name="notes"
				rows={3}
			/>
			<div className="field-pair">
				<TextField defaultValue="npm" label="Registry" readOnly />
				<TextField defaultValue="Unavailable" disabled label="Mirror" />
			</div>
			<Divider />
			<div className="switch-stack">
				<Switch
					checked={createRelease}
					description="Create a release after the package build."
					label="Create release"
					name="release"
					onChange={(event) => setCreateRelease(event.currentTarget.checked)}
				/>
				<Switch checked={false} disabled label="Publish immediately" />
			</div>
			<div className="form-actions">
				<Button illuminated type="submit">
					Publish
				</Button>
				{submitted.length > 0 && (
					<Text aria-live="polite" variant="grey">
						{submitted}
					</Text>
				)}
			</div>
		</form>
	);
}

interface FixtureProps {
	readonly accentColor: string;
	readonly accentHue: number;
	readonly onAccentColorChange: (color: string) => void;
}

function Fixture({ accentColor, accentHue, onAccentColorChange }: FixtureProps) {
	const [selected, setSelected] = useState(true);
	const [rtlSelected, setRtlSelected] = useState(true);
	const [reducedSelected, setReducedSelected] = useState(true);

	return (
		<main>
			<header className="fixture-header">
				<div className="fixture-header-copy">
					<Text className="fixture-block" variant="heading">
						Sensation React
					</Text>
					<Text className="fixture-block" variant="grey">
						Complete foundation set
					</Text>
				</div>
				<label className="accent-picker">
					<Text>Accent colour</Text>
					<input
						aria-label="Accent colour"
						onInput={(event) => onAccentColorChange(event.currentTarget.value)}
						type="color"
						value={accentColor}
					/>
				</label>
			</header>

			<section aria-labelledby="text-heading" className="fixture-section">
				<Text className="fixture-title" id="text-heading" variant="accent">
					Text
				</Text>
				<div className="text-states">
					<Text>Normal text</Text>
					<Text variant="grey">Grey text</Text>
					<Text variant="accent">Accent text</Text>
					<Text variant="heading">Heading text</Text>
				</div>
			</section>

			<section aria-labelledby="depth-heading" className="fixture-section">
				<Text className="fixture-title" id="depth-heading" variant="accent">
					Depth and panels
				</Text>
				<div className="depth-grid">
					<DepthSample offset={-1} />
					<DepthSample offset={0} />
					<DepthSample offset={1} />
				</div>
			</section>

			<section aria-labelledby="button-heading" className="fixture-section">
				<Text className="fixture-title" id="button-heading" variant="accent">
					Button states
				</Text>
				<ThemeDepth offset={1}>
					<Panel className="button-fixture">
						<div className="button-row">
							<Text variant="grey">Treatments</Text>
							<div className="button-set">
								<Button>Normal</Button>
								<Button illuminated>Illuminated</Button>
								<Button flat>Flat</Button>
								<Button subtle>Subtle</Button>
								<Button icon={CheckIcon}>Composed icon</Button>
							</div>
						</div>
						<div className="button-row">
							<Text variant="grey">State</Text>
							<div className="button-set">
								<Button disabled>Disabled</Button>
								<Button aria-pressed={selected} onClick={() => setSelected((current) => !current)}>
									Selected
								</Button>
								<Button loading>Loading</Button>
							</div>
						</div>
					</Panel>
				</ThemeDepth>
			</section>

			<section aria-labelledby="form-heading" className="fixture-section">
				<Text className="fixture-title" id="form-heading" variant="accent">
					TextField and Switch
				</Text>
				<ThemeDepth offset={1}>
					<Panel className="foundation-panel">
						<FormFixture />
					</Panel>
				</ThemeDepth>
			</section>

			<section aria-labelledby="composition-heading" className="fixture-section">
				<Text className="fixture-title" id="composition-heading" variant="accent">
					Composition
				</Text>
				<Expander icon={PackageIcon} open title="Package contents">
					<div className="expander-content">
						<Text className="fixture-block">The package includes:</Text>
						<Spacer size={8} />
						<ul className="bullet-list">
							<Bullet>React and Svelte components</Bullet>
							<Bullet>Shared theme rules</Bullet>
							<Bullet>Types and source maps</Bullet>
						</ul>
					</div>
				</Expander>
				<Expander title="Collapsed section">
					<div className="expander-content">
						<Text>This content starts collapsed.</Text>
					</div>
				</Expander>
			</section>

			<section aria-labelledby="layout-heading" className="fixture-section">
				<Text className="fixture-title" id="layout-heading" variant="accent">
					Layout and preferences
				</Text>
				<div className="layout-fixtures">
					<Panel className="layout-sample narrow-sample">
						<Text className="fixture-block" variant="grey">
							Narrow · 18 rem
						</Text>
						<TextField
							defaultValue="A very long value that keeps native selection and horizontal scrolling"
							label="Long content"
						/>
					</Panel>
					<Panel className="layout-sample" dir="rtl">
						<Text className="fixture-block" variant="grey">
							Right to left
						</Text>
						<TextField defaultValue="واجهة عربية" label="اسم الحزمة" />
						<Switch
							checked={rtlSelected}
							label="إنشاء إصدار"
							onChange={(event) => setRtlSelected(event.currentTarget.checked)}
						/>
					</Panel>
					<Panel className="layout-sample zoom-sample">
						<Text className="fixture-block" variant="grey">
							150% zoom
						</Text>
						<TextField defaultValue="Readable at larger sizes" label="Zoomed field" />
					</Panel>
					<ThemeProvider accentHue={accentHue} motion={REDUCED_MOTION}>
						<Panel className="layout-sample">
							<Text className="fixture-block" variant="grey">
								Reduced motion
							</Text>
							<Switch
								checked={reducedSelected}
								label="Transitions snap"
								onChange={(event) => setReducedSelected(event.currentTarget.checked)}
							/>
						</Panel>
					</ThemeProvider>
				</div>
			</section>
		</main>
	);
}

function Demo() {
	const [accent, setAccent] = useState({
		color: DEFAULT_ACCENT_COLOR,
		hue: DEFAULT_ACCENT_HUE,
	});

	return (
		<ThemeProvider accentHue={accent.hue}>
			<Fixture
				accentColor={accent.color}
				accentHue={accent.hue}
				onAccentColorChange={(color) =>
					setAccent((current) => ({ color, hue: getAccentHue(color, current.hue) }))
				}
			/>
		</ThemeProvider>
	);
}

const rootElement = document.getElementById("root");

if (rootElement === null) {
	throw new Error("Could not find the React demo root element.");
}

createRoot(rootElement).render(
	<StrictMode>
		<Demo />
	</StrictMode>,
);
