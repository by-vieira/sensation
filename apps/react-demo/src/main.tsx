import "@morgan-vieira-npm/sensation-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const rootElement = document.getElementById("root");

if (rootElement === null) {
	throw new Error("Could not find the React demo root element.");
}

createRoot(rootElement).render(
	<StrictMode>
		<main>
			<h1>Sensation React</h1>
		</main>
	</StrictMode>,
);
