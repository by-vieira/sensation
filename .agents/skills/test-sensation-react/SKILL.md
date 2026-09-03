---
name: test-sensation-react
description: Launch, retain, and test the Sensation React workbench, including worktree-safe Vite sessions, controlled browser interaction, component-state fixtures, visual evidence, and focused package verification. Use after React component changes, when reproducing React behavior, or when handing an interactive workbench to the user.
---

# Test Sensation React

Use this skill for `@morgan-vieira-npm/sensation-react`. For the Svelte implementation, use the sibling [`test-sensation-svelte`](../test-sensation-svelte/SKILL.md) skill.

## Start or reuse the React workbench

1. Run commands from the repository root.
2. Check for an existing React Vite process and browser tab from the current testing loop. Reuse them when they belong to this worktree and still load the current source.
3. If dependencies are unavailable, run `pnpm install --frozen-lockfile`. Do not reinstall dependencies for every test pass.
4. Start the workbench with `pnpm dev:react`. Keep the terminal session alive and read the actual local URL from Vite's output.
5. Open that URL with the controlled in-app browser or browser-automation surface available to the agent. Do not pass `--open` or launch an uncontrolled system browser during automated testing.

Vite can select another port when its default is occupied. Trust the current process output instead of assuming port `5173`. Before reusing a server, verify its working directory and rendered content. Do not stop a server owned by another worktree or task.

When the user needs to inspect the workbench, open the URL yourself first and confirm that the app renders. Then give the user the non-secret URL and keep the environment running.

## Preserve the environment while iterating

Treat the testing or implementation loop as the environment lifetime. An assistant turn is not that boundary.

- Keep the Vite process, selected port, browser tab, and useful workbench fixtures alive while the user may inspect the result or request another change.
- Before starting another process, check whether the existing server and browser tab still serve the task.
- On a later turn, reuse the existing URL when it remains healthy. If the process exited, restart it from the same worktree and read the newly selected URL.
- Tell the user when the workbench remains available.

## Expose the behavior under test

Read the diff, the changed component, its tests, and the matching file under `.repos/lib-studio-elttob/LibStudioElttob/RbxSensation`. Use the reference to identify behavior and states, not Roblox implementation details.

Use `apps/react-demo` as the test harness. If it does not expose the changed behavior, add the smallest fixture that makes the relevant states and transitions reachable. Keep a fixture when it remains useful as a component example or regression case. Otherwise remove only the temporary fixture changes that you made.

Do not change package behavior merely to make a test pass unless the user also asked for a fix. Preserve unrelated work in both the package and the workbench.

## Drive and observe the affected flow

Apply the state checklist in `AGENTS.md` to the changed behavior. Test only the entries that apply and record any entries that you skipped.

Use semantic browser locators and current page state instead of fixed coordinates. Exercise mouse, keyboard, touch emulation, and assistive semantics where each input applies. Check native element behavior, visible focus, forms, controlled state, forwarded attributes and refs, rapid repeated input, cleanup under React Strict Mode, narrow layouts, increased text size, and reduced motion.

Watch the browser console while interacting. A rendered screenshot does not prove focus, keyboard, pointer, scrolling, or transition behavior.

Capture before and after images for visual changes. Capture a short recording when motion, drag, scroll, or timing behavior changed.

## Run focused verification

Run these commands from the repository root:

```powershell
pnpm exec oxfmt --check packages/react apps/react-demo
pnpm exec oxlint packages/react apps/react-demo
pnpm --filter @morgan-vieira-npm/sensation-react check
pnpm --filter @morgan-vieira-npm/sensation-react build
pnpm --filter @morgan-vieira-npm/sensation-react-demo check
pnpm --filter @morgan-vieira-npm/sensation-react-demo build
```

Run focused unit tests when the package defines them. Use the committed script instead of inventing a command. Keep verification scoped to the affected implementation unless the change touches shared theme behavior or the user asks for the full repository check.

## Tear down only when the loop is finished

Stop the Vite process when the user confirms that the iteration is finished or the overall task has no pending human review. Do not stop it merely because one verification pass or assistant turn ended.

After interrupting the terminal session, verify that the selected port no longer has a listener. On Windows, the pnpm parent can exit while Vite remains alive. If that happens, inspect the listener's command line and stop it only when it points to this worktree's `apps/react-demo` directory.

Before finishing, report the URL if the workbench remains available, the commands that passed, the browser and input methods used, the states covered, and the evidence captured. Describe failures with reproduction steps and distinguish package behavior from workbench or tooling failures.

## Troubleshoot predictable failures

- If the browser shows stale output, verify the server's worktree and URL before restarting anything. Reload the controlled tab after confirming both.
- If Vite selected another port, use the printed URL rather than stopping the process that owns `5173`.
- If an import fails after dependency changes, compare `package.json` and `pnpm-lock.yaml`, then run `pnpm install --frozen-lockfile` when they agree.
- If behavior differs only outside React Strict Mode, investigate missing cleanup or duplicate effects before treating the workbench as the cause.
