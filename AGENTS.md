# Sensation

Sensation is RbxSensation for the web. It carries the ideas behind Studio Elttob's UI system into browsers without pretending that the DOM is a Roblox GUI tree.

The original library lives in `.repos/lib-studio-elttob/LibStudioElttob/RbxSensation`. It is a design and behavior reference. The web implementation should feel related, but it must use the strengths of HTML, CSS, and the browser.

## What makes Sensation special?

Sensation exists to make tool interfaces feel coherent and unusually responsive. These are the things we cannot compromise on while the library grows.

### 1. Feel is part of the behavior

A control is not finished when it looks right in a still image. Hover, press, focus, drag, scroll, selection, and transition behavior all shape how it feels. Input should produce an immediate and predictable response.

Motion must explain a change or preserve spatial continuity. If removing an animation makes the interaction clearer, remove it.

### 2. Depth means something

RbxSensation derives color from theme and z-depth instead of styling every component in isolation. Keep that model. Raised, inset, selected, and overlaid elements should use shared relationships between background, foreground, accent, and grey.

Do not collect arbitrary shadows and colors until the right screenshot happens to appear. Add a token or a rule that the rest of the system can reuse.

### 3. Native at the edges

Browsers already know how buttons, links, inputs, focus, scrolling, text selection, forms, and assistive technology work. Use those behaviors. A styled native control is a better foundation than a div that spends a thousand lines becoming a worse one.

Match the original library's intent, not its Roblox-specific machinery.

### 4. Small on purpose

Sensation should be easy to understand as a whole. Prefer a small set of composable components over a catalogue of near-duplicates. Prefer one clear prop over several booleans whose combinations need a truth table.

Do not add an abstraction for one call site. Do not preserve an abstraction after its reason has disappeared.

### 5. Performance without compromise

The interface should stay responsive under real load. Watch for layout thrashing, unnecessary renders, large DOM trees, expensive effects, and code that handles every pointer move on the main thread.

Never use continuously repainting animation such as shimmer, blur, or pulse. It burns GPU time on high-refresh displays. Prefer short, interruptible transitions on transform and opacity, and respect `prefers-reduced-motion`.

## A note from Morgan

I like expressive interfaces and simple systems. Sensation should have personality, but none of that personality should come from making the code or the interaction harder to explain.

Study the real constraint. Then find the smallest model that makes the right behavior feel obvious. Port ideas deliberately. Do not translate Luau into web code line by line, and do not sand away everything distinctive because the browser gives you a generic control for free.

Channel both "measure twice, cut once" and YAGNI. Keep the result ambitious and the mechanism boring.

The rest of this document contains good defaults for working in this repository. A maintainer's direction can override them.

Do not use the `html-communication` skill in this repository. Work from the RbxSensation reference and maintainer direction without publishing static mocks first.

## A small glossary

We need to use the same words when we discuss the library:

- **you** means the agent reading this file and changing Sensation.
- **we, us, and maintainers** mean Morgan and the people building Sensation.
- **user** means the person interacting with an interface built with Sensation.
- **consumer** means an application that depends on Sensation.
- **foundation component** means a small reusable control such as Button, TextField, Panel, or Scroller.
- **compound component** means a composed interaction such as Modal, Warning, or EmptyState.
- **effect** means visual behavior such as depth, a halo, or a transition. An effect does not own application state.
- **theme** means the rules that derive usable colors and other visual values from a small set of inputs.
- **z-depth** means a component's logical depth relative to its parent. It is not a raw CSS `z-index`.
- **reference** means the original RbxSensation source under `.repos/`.

## The three ways to hurt yourself

1. **Porting the mechanism.** Roblox instances, Fusion scopes, `Color3`, and `UDim2` solve platform-specific problems. Recreate the behavior with semantic HTML and CSS instead of inventing browser-shaped copies of Roblox APIs.
2. **Losing native behavior.** A custom control can look correct while breaking the keyboard, forms, focus, selection, touch, or a screen reader. Start with the right HTML element and preserve its contract.
3. **Adding exceptions instead of rules.** One-off colors, timing values, shadows, and layout fixes make the system drift. Find the shared relationship and encode it once.

## Use the reference well

- Read the matching file under `.repos/lib-studio-elttob/LibStudioElttob/RbxSensation` before building or changing a component.
- When asked to complete a set, inspect every sibling in the matching reference directory and account for each one before deciding the set is complete.
- Record the states and relationships that matter. Ignore implementation details that exist only because of Roblox.
- Treat `.repos/` as read-only. Never edit it, import runtime code from it, or make the web package depend on it.
- Keep original names when the concept survives the port. Use the browser's name when the platform concept differs.
- Do not claim pixel parity. Font rendering, layout, input, and accessibility differ on the web.
- Do not copy removed or unlicensed assets. A behavior reference is not an asset licence.
- Separate restrictions from implementation choices. Restricted source or assets may not be copied, but their observable behavior can still require a clean-room web implementation. Complexity, missing tests, and planned follow-up work are not restrictions.

## Port the complete component

- Before implementation, inventory every consumer-visible feature in the matching reference and its direct dependencies. Include props, states, outputs, composition, effects, and transitions.
- Compare the finished component against that inventory again. Check exact geometry, timing, theme channels, icon animation signals, and dependency behavior rather than only the public prop surface.
- Implement every item that has a useful web equivalent. Use native HTML, CSS, framework composition, and browser APIs instead of copying Roblox mechanisms.
- When the browser already provides a feature, preserve and test the native behavior. Do not add a Roblox-shaped compatibility prop.
- A browser substitution is complete only when it preserves the same consumer-visible result. Do not label a known gap an approximation unless the platform replaces that result or a maintainer accepts the difference.
- List each omitted or approximated item in the handoff. Give a specific reason, such as Roblox-only behavior, an unavailable asset, a native browser replacement, or work outside the approved scope.
- Do not call a component equivalent or complete until the inventory has no unexplained gaps.

## Hit every state

The most common component bug is a state that looked fine in one demo and failed everywhere else. Before calling UI work done, walk this list and say which entries applied:

- **Input.** Mouse, touch, keyboard, and assistive technology must reach the same action where the platform supports them.
- **Interaction.** Check rest, hover where available, active, `focus-visible`, disabled, selected, loading, and error states.
- **Content.** Check empty content, long content, wrapping, truncation, icons, and labels written in another language.
- **Layout.** Check narrow containers, wide containers, browser zoom, increased text size, and nested components.
- **Motion.** Check interrupted transitions, rapid repeated input, and reduced motion.
- **Composition.** Check the component alone, beside its peers, inside an overlay, and at a different z-depth.
- **Direction.** Do not bake left and right into behavior that should follow writing direction.

## Accessibility is behavior

- Use the native element with the correct semantics before reaching for ARIA.
- Every interactive component needs an accessible name and a visible keyboard focus state.
- Keyboard behavior should follow the established browser or ARIA pattern for that control.
- Do not communicate state through color or motion alone.
- Keep focus sensible when content opens, closes, appears, disappears, or moves into a portal.
- Associate form help and errors with their controls. Do not make a placeholder do a label's job.
- Preserve user settings for reduced motion, contrast, color scheme, and text size where the browser exposes them.

## Visual language

- Project-owned demos and interfaces use dark mode, a true black `#000` background, and white primary text unless a maintainer asks for another direction. Consumer themes do not have to share that default.
- Use OKLCH for generated palettes and color relationships. Check the rendered contrast after gamut mapping.
- Express depth through theme relationships first. Use borders, shadows, and bevels only when they clarify the relationship.
- Do not wrap every section in a rounded card. Do not turn every action or label into a pill.
- Keep copy short. Do not add pale subtitle lines above headings as decoration.
- Motion is interruptible. A control must respond to its current state, not finish an obsolete animation first.

## Component contracts

- Keep state ownership explicit. A component must not appear controlled while maintaining a second hidden truth.
- Preserve native attributes, events, form behavior, and refs where the chosen framework allows it.
- Prefer composition to mode props. Avoid boolean combinations that create undocumented variants.
- Keep visual tokens separate from application data. Components consume the theme; they do not invent local palettes.
- Keep foundation components independent of product-specific state, routing, analytics, and data fetching.
- Add a dependency only when it removes more complexity than it brings.
- Breaking changes need a deliberate migration path. A rename without a reason is churn.

## CSS and motion

- Let CSS handle layout, interaction states, and responsive behavior when JavaScript adds no value.
- Keep selectors local and unsurprising. Components should not restyle unrelated descendants.
- Use logical properties when direction matters.
- Avoid measuring layout during render. Batch unavoidable reads and writes.
- Animate transform and opacity where possible. Avoid transitions on broad properties such as `all`.
- Stop work that no longer matters. Observers, timers, animation frames, and global listeners need cleanup.
- Test the final pixels. Correct arithmetic can still produce bad browser output.

## Verifying

- Use the smallest proof that the change works. Run the focused tests, lint, and typecheck commands for the files you touched.
- Test observable behavior. Do not add a test that merely repeats the component's implementation.
- New component behavior needs focused coverage for its state transitions and keyboard contract.
- Passing tests prove only the behavior they assert. They do not prove reference parity or inventory completeness.
- Add focused checks for reference-critical geometry, transition triggers, theme channels, and fallback behavior. Do not mark a checklist item complete while one of those gaps is known.
- Visual changes need before and after images. Motion or timing changes need a short recording.
- Check interaction in a real browser when the maintainer requests browser work. Static markup is not proof of focus, scrolling, pointer capture, or animation behavior.
- Do not invent commands while the repository is being scaffolded. Use the scripts committed to the project, and update this section when those scripts settle.

## Pull requests

- Never open a pull request unless the maintainer explicitly asks.
- Rebase onto the latest `main` before opening one.
- Follow the repository's title convention. Keep the title plain and specific.
- Open the body with the problem, then explain the fix. End with the model and harness that made the changes.
- Put visual evidence on the pull request. Do not commit PR-only screenshots or recordings to the package.
- Keep one concern per pull request. If the description needs an "also", split the work.

## Where code lives

The project is a pnpm workspace. Public packages use the `@morgan-vieira-npm` scope.

- `.agents/skills` contains repository testing workflows.
- `apps/react-demo` contains the private React component workbench.
- `apps/svelte-demo` contains the private Svelte component workbench.
- `packages/react` contains the React components.
- `packages/svelte` contains the Svelte components.
- `packages/theme` contains framework-independent theme rules and values.
- `.repos/lib-studio-elttob/LibStudioElttob/RbxSensation` contains the read-only RbxSensation reference.
- `.repos/lib-studio-elttob/LibStudioElttob/RbxVanilla` contains related icon behavior used by parts of the reference.

## Taste

- A component should have one obvious default and a small number of meaningful variants.
- Design tokens describe relationships. `raised-bg` is useful; `slightly-lighter-black` is not.
- Types should make invalid combinations hard to express. Do not reach for an escape hatch before fixing the contract.
- Comments explain why a decision exists or how a public piece is used. They do not narrate syntax.
- Defaults belong in the lowest shared layer that can own them without surprising consumers.
- If a rule here fights the task in front of you, say so clearly and get a maintainer's approval before breaking it.

## Additional tips

- Keep the dependency graph boring. A UI component library should not drag an application framework behind it.
- Avoid global state unless the browser itself makes the state global, such as the active pointer or the document's focus.
- Treat scroll, drag, and pointer prediction as performance-sensitive code. Measure before making them clever.
- Security matters, but do not make local demos or maintainer tooling harder based on an imagined production threat.
