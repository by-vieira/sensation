# TODO

Sensation needs to turn its working scaffold into a small, tested component library. Start with the shared theme and a complete `Text`, `Panel`, and `Button` slice in React and Svelte, then use that pattern for form controls, layout components, and compound interactions. Leave scrolling, virtualization, and custom pointer behavior until real browser limitations justify them. Before publishing, document the public API, test accessibility and interaction states in both demos, verify the packed packages in clean projects, and automate the checks in CI.

Work from top to bottom. Complete each component in both frameworks before adding the next one. Read the matching RbxSensation file first, record the behavior worth keeping, then design for HTML and browser conventions.

## Current state

- [x] Scaffold the pnpm workspace, React and Svelte packages, theme package, and demo apps.
- [x] Add formatting, linting, type checking, production builds, and workbench testing workflows.
- [x] Export a public API from the theme, React, and Svelte packages.
- [x] Add component tests and package documentation.
- [ ] Add continuous integration.

`pnpm check` and `pnpm build` pass on 2026-09-04.

## Now: build the first usable slice

Build the theme, `Text`, `Panel`, and `Button` as one complete vertical slice across React and Svelte. The theme comes first because every component depends on its color and depth relationships, while the three components are enough to prove that the shared model works without committing to a large API. Finish the slice with state fixtures and focused tests so the next components can reuse a tested pattern instead of extending the scaffold on assumptions.

- [x] Define the framework-independent theme model in `packages/theme`.
  - [x] Generate semantic colors from base lightness, accent hue, and z-depth.
  - [x] Clamp z-depth and expose tokens for backgrounds, foregrounds, accents, greys, focus, and reduced motion.
  - [x] Test palette boundaries and rendered contrast after gamut mapping.
- [x] Add a theme provider and nested z-depth context to `packages/react` and `packages/svelte`.
- [x] Build `Text`, `Panel`, and `Button` in React and Svelte.
  - [x] Start `Button` with the native `<button>` element and preserve refs, attributes, events, and form behavior.
  - [x] Cover rest, hover, active, `focus-visible`, disabled, selected, and loading states.
  - [x] Use shared depth and effect tokens. Do not add component-local colors or shadows.
- [x] Turn both demo apps into state fixtures for the first three components.
- [x] Add focused tests for the theme and the public behavior of each component.

## Next: complete the foundation set

- [x] Build `TextField` on native `<input>` and `<textarea>` elements.
  - [x] Support labels, help text, errors, disabled and read-only states, autofill, and form submission.
  - [x] Test keyboard use, focus, selection, long content, and increased text size.
- [x] Build `Switch` on a native checkbox with a controlled value and no hidden state.
- [x] Build `Divider`, `Spacer`, `Bullet`, and `Expander` only where they improve composition over plain HTML and CSS.
- [x] Match the reference gesture surface on `TextField`, `Switch`, and `Expander`.
- [x] Match the reference transition behavior and geometry for the switch knob, expander height, text placeholder and fades, and bullet mark.
- [x] Define themed icon channels and interaction animation signals without copying assets from `.repos/`.
- [x] Express bevel, animated halo, and shadow behavior as reusable theme rules. Keep them private until a consumer needs a public effect component.
- [x] Add fixtures for narrow and wide layouts, right-to-left text, browser zoom, reduced motion, and alternate z-depths.

## Then: add compound interactions

- [ ] Build `Modal` with native dialog behavior where it fits.
  - [ ] Handle focus entry and return, Escape, backdrop dismissal, nested overlays, and scroll locking.
- [ ] Build `MultiButton` with the appropriate radio-group or toolbar keyboard contract.
- [ ] Build `Warning` and `EmptyState` from the foundation components.
- [ ] Add overlay and transition helpers only after the compound components prove the shared API.

## Later: performance-sensitive controls

- [ ] Write browser-specific behavior notes for `Scroller` and `VirtualList` before choosing an API.
- [ ] Prefer native scrolling, CSS scroll snap, and browser observers over ports of the Roblox input machinery.
- [ ] Measure large-list rendering, pointer work, and layout reads before adding virtualization or prediction.
- [ ] Test wheel, touch, keyboard, drag, resize, interrupted input, and writing direction in a real browser.

## Release readiness

- [ ] Document installation, theming, component APIs, accessibility behavior, and framework examples.
- [ ] Add package metadata, licences, release tooling, and a versioning policy.
- [ ] Verify packed React, Svelte, and theme packages in clean consumer projects.
- [ ] Add CI for `pnpm check`, `pnpm build`, tests, and package smoke checks.
- [ ] Review bundle output, CSS delivery, side-effect declarations, and exported types.
- [ ] Publish only after both demos consume the packed artifacts successfully.

## Do not port by default

- [x] Reassess `MouseTracker`, `MousePredictor`, `OnHover`, and `GestureSurface`. Keep only the small pointer-event gesture surface required by the reference behavior.
- [ ] Reassess `OnDrag` when a component needs drag behavior that native events cannot provide.
- [ ] Reassess `LightweightCanvas` against normal DOM containment and compositing.
- [ ] Replace `LoadingSpinner` with a non-continuous loading treatment. The project rules prohibit continuously repainting spinners.
- [ ] Keep `.repos/` read-only. Use it as a behavior reference and do not copy unlicensed assets or Roblox-specific mechanisms.

## Done means

A component is done when its reference inventory has no unexplained gaps, its public contract is typed and documented, both frameworks expose the same behavior where their conventions allow it, the demos show every applicable state, focused tests cover its state changes, geometry, transitions, icon signals, and keyboard contract, and `pnpm check` plus `pnpm build` pass. Passing checks alone do not establish completeness.
