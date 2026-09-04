<script lang="ts">
	import {
		Button,
		Panel,
		Text,
		ThemeDepth,
		ThemeProvider,
	} from "@morgan-vieira-npm/sensation-svelte";

	const accentHue = 255;
	let selected = $state(true);
</script>

<ThemeProvider {accentHue}>
	<main>
		<header class="fixture-header">
			<Text class="fixture-block" variant="heading">Sensation Svelte</Text>
			<Text class="fixture-block" variant="grey">Theme, Text, Panel, and Button</Text>
		</header>

		<section aria-labelledby="text-heading" class="fixture-section">
			<Text class="fixture-title" id="text-heading" variant="accent">Text</Text>
			<div class="text-states">
				<Text>Normal text</Text>
				<Text variant="grey">Grey text</Text>
				<Text variant="accent">Accent text</Text>
				<Text variant="heading">Heading text</Text>
			</div>
			<Panel class="alignment-panel">
				<Text align={{ x: "end", y: "end" }} class="alignment-sample" variant="grey">
					Fixed box, end aligned
				</Text>
			</Panel>
		</section>

		<section aria-labelledby="depth-heading" class="fixture-section">
			<Text class="fixture-title" id="depth-heading" variant="accent">Depth and panels</Text>
			<div class="depth-grid">
				<ThemeDepth offset={-1}>
					<Panel class="depth-sample">
						<Text class="fixture-block" variant="grey">z -1</Text>
						<Text class="fixture-block">Background</Text>
					</Panel>
				</ThemeDepth>
				<ThemeDepth offset={0}>
					<Panel class="depth-sample">
						<Text class="fixture-block" variant="grey">z 0</Text>
						<Text class="fixture-block">Background</Text>
					</Panel>
				</ThemeDepth>
				<ThemeDepth offset={1}>
					<Panel class="depth-sample">
						<Text class="fixture-block" variant="grey">z 1</Text>
						<Text class="fixture-block">Background</Text>
					</Panel>
				</ThemeDepth>
			</div>
			<ThemeDepth offset={1}>
				<Panel class="panel-sample" elevation={1}>
					<Text class="fixture-block" variant="heading">Raised panel</Text>
					<Text class="fixture-block" variant="grey">
						Children use the surrounding theme depth.
					</Text>
					<ThemeDepth offset={-1}>
						<Panel class="nested-panel" elevation={-1}>
							<Text>Inset panel at the parent depth</Text>
						</Panel>
					</ThemeDepth>
				</Panel>
			</ThemeDepth>
		</section>

		<section aria-labelledby="button-heading" class="fixture-section">
			<Text class="fixture-title" id="button-heading" variant="accent">Button states</Text>
			<ThemeDepth offset={1}>
				<Panel class="button-fixture">
					<div class="button-row">
						<Text variant="grey">Treatments</Text>
						<div class="button-set">
							<Button>Normal</Button>
							<Button illuminated>Illuminated</Button>
							<Button flat>Flat</Button>
							<Button subtle>Subtle</Button>
							<Button>
								<svg aria-hidden="true" class="fixture-icon" focusable="false" viewBox="0 0 16 16">
									<path d="m3 8 3 3 7-7" />
								</svg>
								Composed icon
							</Button>
						</div>
					</div>
					<div class="button-row">
						<Text variant="grey">State</Text>
						<div class="button-set">
							<Button disabled>Disabled</Button>
							<Button aria-pressed={selected} onclick={() => (selected = !selected)}
								>Selected</Button
							>
							<Button loading>Loading</Button>
						</div>
					</div>
					<div class="button-row">
						<Text variant="grey">Input</Text>
						<div class="button-set">
							<Button>Hover, press, or focus me</Button>
							<Button align="start" class="wide-button">Start aligned</Button>
						</div>
					</div>
				</Panel>
			</ThemeDepth>
		</section>
	</main>
</ThemeProvider>
