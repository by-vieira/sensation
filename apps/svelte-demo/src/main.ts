import { mount } from "svelte";
import App from "./App.svelte";
import "./styles.css";

const appElement = document.getElementById("app");

if (appElement === null) {
	throw new Error("Could not find the Svelte demo root element.");
}

mount(App, {
	target: appElement,
});
