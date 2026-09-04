import {
	Button,
	Panel,
	Text,
	ThemeDepth,
	ThemeProvider,
	useTheme,
} from "@morgan-vieira-npm/sensation-react";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const ACCENT_HUE = 255;

function CheckIcon() {
	return (
		<svg aria-hidden="true" className="fixture-icon" focusable="false" viewBox="0 0 16 16">
			<path d="m3 8 3 3 7-7" />
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

function Fixture() {
	const [selected, setSelected] = useState(true);

	return (
		<main>
			<header className="fixture-header">
				<Text className="fixture-block" variant="heading">
					Sensation React
				</Text>
				<Text className="fixture-block" variant="grey">
					Theme, Text, Panel, and Button
				</Text>
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
				<Panel className="alignment-panel">
					<Text align={{ x: "end", y: "end" }} className="alignment-sample" variant="grey">
						Fixed box, end aligned
					</Text>
				</Panel>
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
				<ThemeDepth offset={1}>
					<Panel className="panel-sample" elevation={1}>
						<Text className="fixture-block" variant="heading">
							Raised panel
						</Text>
						<Text className="fixture-block" variant="grey">
							Children use the surrounding theme depth.
						</Text>
						<ThemeDepth offset={-1}>
							<Panel className="nested-panel" elevation={-1}>
								<Text>Inset panel at the parent depth</Text>
							</Panel>
						</ThemeDepth>
					</Panel>
				</ThemeDepth>
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
								<Button>
									<CheckIcon />
									Composed icon
								</Button>
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
						<div className="button-row">
							<Text variant="grey">Input</Text>
							<div className="button-set">
								<Button>Hover, press, or focus me</Button>
								<Button align="start" className="wide-button">
									Start aligned
								</Button>
							</div>
						</div>
					</Panel>
				</ThemeDepth>
			</section>
		</main>
	);
}

const rootElement = document.getElementById("root");

if (rootElement === null) {
	throw new Error("Could not find the React demo root element.");
}

createRoot(rootElement).render(
	<StrictMode>
		<ThemeProvider accentHue={ACCENT_HUE}>
			<Fixture />
		</ThemeProvider>
	</StrictMode>,
);
