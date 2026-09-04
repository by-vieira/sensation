<script lang="ts">
	import type { IconRenderContext } from "@morgan-vieira-npm/sensation-theme";
	import Button from "../src/lib/Button.svelte";
</script>

{#snippet icon(context: IconRenderContext)}
	<svg aria-hidden="true" data-animation={context.animation} data-icon="check">
		<path data-sensation-icon-channel="primary"></path>
	</svg>
{/snippet}

<Button data-action="icon" {icon}>Save</Button>
