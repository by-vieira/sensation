<script lang="ts">
	import Panel from "../src/lib/Panel.svelte";
	import Text from "../src/lib/Text.svelte";
	import ThemeDepth from "../src/lib/ThemeDepth.svelte";
	import ThemeProvider from "../src/lib/ThemeProvider.svelte";
</script>

<ThemeProvider zDepth={9}>
	<ThemeDepth offset={4}>
		<Panel data-panel="raised">
			<Text data-child="text">Nested</Text>
		</Panel>
	</ThemeDepth>
</ThemeProvider>
