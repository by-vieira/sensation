<script lang="ts">
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
	} from "@morgan-vieira-npm/sensation-svelte";
	import type { IconRenderContext } from "@morgan-vieira-npm/sensation-svelte";

	const defaultAccentColor = "#a2caff";
	const reducedMotion = {
		...defaultThemeMotion,
		quickDuration: defaultThemeMotion.reducedDuration,
		responsiveDuration: defaultThemeMotion.reducedDuration,
	};
	let accentColor = $state(defaultAccentColor);
	let accentHue = $state(255);
	let selected = $state(true);
	let packageName = $state("@morgan-vieira-npm/sensation-svelte");
	let createRelease = $state(true);
	let submitted = $state("");

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
		const short = Math.cbrt(
			0.088_302_461_9 * red + 0.281_718_837_6 * green + 0.629_978_700_5 * blue,
		);
		const a = 1.977_998_495_1 * lightness - 2.428_592_205 * medium + 0.450_593_709_9 * short;
		const b = 0.025_904_037_1 * lightness + 0.782_771_766_2 * medium - 0.808_675_766 * short;

		if (Math.hypot(a, b) < 0.0001) {
			return fallback;
		}

		return (Math.atan2(b, a) * 180) / Math.PI + (b < 0 ? 360 : 0);
	}

	function changeAccent(event: Event): void {
		if (!(event.currentTarget instanceof HTMLInputElement)) {
			return;
		}

		accentColor = event.currentTarget.value;
		accentHue = getAccentHue(accentColor, accentHue);
	}

	function submitForm(event: SubmitEvent): void {
		event.preventDefault();
		if (!(event.currentTarget instanceof HTMLFormElement)) {
			return;
		}

		const data = new FormData(event.currentTarget);
		submitted = `${data.get("package")} · ${data.has("release") ? "release" : "no release"}`;
	}
</script>

{#snippet checkIcon(context: IconRenderContext)}
	<svg
		aria-hidden="true"
		class="fixture-icon"
		data-animation={context.animation}
		focusable="false"
		viewBox="0 0 16 16"
	>
		<path d="m3 8 3 3 7-7" data-sensation-icon-channel="primary"></path>
	</svg>
{/snippet}

{#snippet searchIcon(context: IconRenderContext)}
	<svg
		aria-hidden="true"
		class="fixture-icon"
		data-animation={context.animation}
		focusable="false"
		viewBox="0 0 16 16"
	>
		<circle cx="7" cy="7" data-sensation-icon-channel="primary" r="4.5"></circle>
		<path d="m10.5 10.5 3 3" data-sensation-icon-channel="secondary"></path>
	</svg>
{/snippet}

{#snippet packageIcon(context: IconRenderContext)}
	<svg
		aria-hidden="true"
		class="fixture-icon"
		data-animation={context.animation}
		focusable="false"
		viewBox="0 0 16 16"
	>
		<path
			d="M3 5.5 8 3l5 2.5v5L8 13l-5-2.5zM3 5.5 8 8l5-2.5M8 8v5"
			data-sensation-icon-channel="primary"
		></path>
	</svg>
{/snippet}

<ThemeProvider {accentHue}>
	<main>
		<header class="fixture-header">
			<div class="fixture-header-copy">
				<Text class="fixture-block" variant="heading">Sensation Svelte</Text>
				<Text class="fixture-block" variant="grey">Complete foundation set</Text>
			</div>
			<label class="accent-picker">
				<Text>Accent colour</Text>
				<input aria-label="Accent colour" oninput={changeAccent} type="color" value={accentColor} />
			</label>
		</header>

		<section aria-labelledby="text-heading" class="fixture-section">
			<Text class="fixture-title" id="text-heading" variant="accent">Text</Text>
			<div class="text-states">
				<Text>Normal text</Text>
				<Text variant="grey">Grey text</Text>
				<Text variant="accent">Accent text</Text>
				<Text variant="heading">Heading text</Text>
			</div>
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
							<Button icon={checkIcon}>Composed icon</Button>
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
				</Panel>
			</ThemeDepth>
		</section>

		<section aria-labelledby="form-heading" class="fixture-section">
			<Text class="fixture-title" id="form-heading" variant="accent">TextField and Switch</Text>
			<ThemeDepth offset={1}>
				<Panel class="foundation-panel">
					<form class="form-fixture" onsubmit={submitForm}>
						<TextField
							autocomplete="organization-title"
							helpText="Published package name."
							icon={searchIcon}
							label="Package"
							name="package"
							oninput={(event) => (packageName = event.currentTarget.value)}
							placeholder="Package name"
							value={packageName}
						/>
						<TextField
							error="Use letters, numbers, dots, or hyphens."
							label="Release tag"
							name="tag"
							value="latest!"
						/>
						<TextField
							label="Notes"
							multiline
							name="notes"
							rows={3}
							value="Adds the remaining foundation components in React and Svelte."
						/>
						<div class="field-pair">
							<TextField label="Registry" readonly value="npm" />
							<TextField disabled label="Mirror" value="Unavailable" />
						</div>
						<Divider />
						<div class="switch-stack">
							<Switch
								checked={createRelease}
								description="Create a release after the package build."
								label="Create release"
								name="release"
								onchange={(event) => (createRelease = event.currentTarget.checked)}
							/>
							<Switch checked={false} disabled label="Publish immediately" />
						</div>
						<div class="form-actions">
							<Button illuminated type="submit">Publish</Button>
							{#if submitted.length > 0}<Text aria-live="polite" variant="grey">{submitted}</Text
								>{/if}
						</div>
					</form>
				</Panel>
			</ThemeDepth>
		</section>

		<section aria-labelledby="composition-heading" class="fixture-section">
			<Text class="fixture-title" id="composition-heading" variant="accent">Composition</Text>
			<Expander icon={packageIcon} open title="Package contents">
				<div class="expander-content">
					<Text class="fixture-block">The package includes:</Text>
					<Spacer size={8} />
					<ul class="bullet-list">
						<Bullet>React and Svelte components</Bullet>
						<Bullet>Shared theme rules</Bullet>
						<Bullet>Types and source maps</Bullet>
					</ul>
				</div>
			</Expander>
			<Expander title="Collapsed section">
				<div class="expander-content"><Text>This content starts collapsed.</Text></div>
			</Expander>
		</section>

		<section aria-labelledby="layout-heading" class="fixture-section">
			<Text class="fixture-title" id="layout-heading" variant="accent">Layout and preferences</Text>
			<div class="layout-fixtures">
				<Panel class="layout-sample narrow-sample">
					<Text class="fixture-block" variant="grey">Narrow · 18 rem</Text>
					<TextField
						label="Long content"
						value="A very long value that keeps native selection and horizontal scrolling"
					/>
				</Panel>
				<Panel class="layout-sample" dir="rtl">
					<Text class="fixture-block" variant="grey">Right to left</Text>
					<TextField label="اسم الحزمة" value="واجهة عربية" />
					<Switch checked label="إنشاء إصدار" />
				</Panel>
				<Panel class="layout-sample zoom-sample">
					<Text class="fixture-block" variant="grey">150% zoom</Text>
					<TextField label="Zoomed field" value="Readable at larger sizes" />
				</Panel>
				<ThemeProvider {accentHue} motion={reducedMotion}>
					<Panel class="layout-sample">
						<Text class="fixture-block" variant="grey">Reduced motion</Text>
						<Switch checked label="Transitions snap" />
					</Panel>
				</ThemeProvider>
			</div>
		</section>
	</main>
</ThemeProvider>
