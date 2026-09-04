import { copyFile } from "node:fs/promises";

await copyFile(
	new URL("../src/styles.css", import.meta.url),
	new URL("../dist/styles.css", import.meta.url),
);

await copyFile(
	new URL("../src/sheen.png", import.meta.url),
	new URL("../dist/sheen.png", import.meta.url),
);
