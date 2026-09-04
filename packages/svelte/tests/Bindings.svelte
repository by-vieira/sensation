<script lang="ts">
	import Button from "../src/lib/Button.svelte";
	import Bullet from "../src/lib/Bullet.svelte";
	import Divider from "../src/lib/Divider.svelte";
	import Expander from "../src/lib/Expander.svelte";
	import Panel from "../src/lib/Panel.svelte";
	import Spacer from "../src/lib/Spacer.svelte";
	import Switch from "../src/lib/Switch.svelte";
	import Text from "../src/lib/Text.svelte";
	import TextField from "../src/lib/TextField.svelte";

	let buttonElement = $state<HTMLButtonElement | null>(null);
	let bulletElement = $state<HTMLLIElement | null>(null);
	let dividerElement = $state<HTMLDivElement | null>(null);
	let expanderElement = $state<HTMLDetailsElement | null>(null);
	let panelElement = $state<HTMLDivElement | null>(null);
	let spacerElement = $state<HTMLSpanElement | null>(null);
	let switchElement = $state<HTMLInputElement | null>(null);
	let textElement = $state<HTMLSpanElement | null>(null);
	let textFieldElement = $state<HTMLInputElement | HTMLTextAreaElement | null>(null);

	export function getElements() {
		return {
			button: buttonElement,
			bullet: bulletElement,
			divider: dividerElement,
			expander: expanderElement,
			panel: panelElement,
			spacer: spacerElement,
			switch: switchElement,
			text: textElement,
			textField: textFieldElement,
		};
	}
</script>

<Panel bind:element={panelElement}>
	<Text bind:element={textElement}>Text</Text>
	<Button bind:element={buttonElement}>Button</Button>
	<TextField bind:element={textFieldElement} label="Name" />
	<Switch bind:element={switchElement} checked={true} label="Enabled" />
	<Divider bind:element={dividerElement} />
	<Spacer bind:element={spacerElement} size={4} />
	<ul><Bullet bind:element={bulletElement}>Item</Bullet></ul>
	<Expander bind:element={expanderElement} title="More">Contents</Expander>
</Panel>
