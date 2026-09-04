<script lang="ts">
	import Button from "../src/lib/Button.svelte";
	import Panel from "../src/lib/Panel.svelte";
	import Text from "../src/lib/Text.svelte";

	let buttonElement = $state<HTMLButtonElement | null>(null);
	let panelElement = $state<HTMLDivElement | null>(null);
	let textElement = $state<HTMLSpanElement | null>(null);

	export function getElements() {
		return {
			button: buttonElement,
			panel: panelElement,
			text: textElement,
		};
	}
</script>

<Panel bind:element={panelElement}>
	<Text bind:element={textElement}>Text</Text>
	<Button bind:element={buttonElement}>Button</Button>
</Panel>
