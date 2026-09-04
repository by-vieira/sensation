const SPRING_SPEED = 50;
const SPRING_EPSILON = 0.000_01;
const PREDICTION_WINDOW_SECONDS = 4 / 60;
const PREDICTION_LOOKAHEAD_SECONDS = 1 / 60;

interface Point {
	readonly x: number;
	readonly y: number;
}

interface PointerSample extends Point {
	readonly time: number;
}

interface SpringState {
	goal: number;
	position: number;
	velocity: number;
}

export interface GesturePointerEvent {
	readonly button: number;
	readonly clientX: number;
	readonly clientY: number;
	readonly isPrimary: boolean;
	readonly pointerId: number;
	readonly pointerType: string;
}

export interface GestureSurface {
	destroy(): void;
	pointerCancel(event: GesturePointerEvent): void;
	pointerDown(event: GesturePointerEvent): void;
	pointerEnter(event: GesturePointerEvent): void;
	pointerLeave(event: GesturePointerEvent): void;
	pointerMove(event: GesturePointerEvent): void;
	pointerUp(event: GesturePointerEvent): void;
	setEnabled(enabled: boolean): void;
}

export type ButtonGesture = GestureSurface;

function advanceSpring(spring: SpringState, elapsedSeconds: number): void {
	if (elapsedSeconds === 0 || (spring.position === spring.goal && spring.velocity === 0)) {
		return;
	}

	const timeSpeed = elapsedSeconds * SPRING_SPEED;
	const decay = Math.exp(-timeSpeed);
	const displacement = spring.position - spring.goal;
	const nextDisplacement =
		displacement * decay * (timeSpeed + 1) + spring.velocity * decay * elapsedSeconds;
	const nextVelocity =
		displacement * decay * (-timeSpeed * SPRING_SPEED) + spring.velocity * decay * (1 - timeSpeed);

	if (Math.abs(nextDisplacement) <= SPRING_EPSILON && Math.abs(nextVelocity) <= SPRING_EPSILON) {
		spring.position = spring.goal;
		spring.velocity = 0;
		return;
	}

	spring.position = spring.goal + nextDisplacement;
	spring.velocity = nextVelocity;
}

function isSpringMoving(spring: SpringState): boolean {
	return (
		Math.abs(spring.position - spring.goal) > SPRING_EPSILON ||
		Math.abs(spring.velocity) > SPRING_EPSILON
	);
}

function averageVelocity(samples: readonly PointerSample[]): Point {
	let x = 0;
	let y = 0;
	let totalWeight = 0;

	for (let index = 1; index < samples.length; index += 1) {
		const left = samples[index - 1];
		const right = samples[index];
		if (left === undefined || right === undefined) {
			continue;
		}

		const elapsed = right.time - left.time;
		if (elapsed <= 0) {
			continue;
		}

		x += ((right.x - left.x) / elapsed) * elapsed;
		y += ((right.y - left.y) / elapsed) * elapsed;
		totalWeight += elapsed;
	}

	return { x: x / totalWeight, y: y / totalWeight };
}

function averageAcceleration(samples: readonly PointerSample[]): Point {
	let x = 0;
	let y = 0;
	let totalWeight = 0;

	for (let index = 2; index < samples.length; index += 1) {
		const left = samples[index - 2];
		const middle = samples[index - 1];
		const right = samples[index];
		if (left === undefined || middle === undefined || right === undefined) {
			continue;
		}

		const leftElapsed = middle.time - left.time;
		const rightElapsed = right.time - middle.time;
		if (leftElapsed <= 0 || rightElapsed <= 0) {
			continue;
		}

		const leftVelocityX = (middle.x - left.x) / leftElapsed;
		const leftVelocityY = (middle.y - left.y) / leftElapsed;
		const rightVelocityX = (right.x - middle.x) / rightElapsed;
		const rightVelocityY = (right.y - middle.y) / rightElapsed;
		const accelerationX = (rightVelocityX - leftVelocityX) / rightElapsed;
		const accelerationY = (rightVelocityY - leftVelocityY) / rightElapsed;

		x += accelerationX * rightElapsed;
		y += accelerationY * rightElapsed;
		totalWeight += rightElapsed;
	}

	return { x: x / totalWeight, y: y / totalWeight };
}

function requireSheen(surface: HTMLElement): HTMLElement {
	const sheen = surface.querySelector<HTMLElement>(".sensation-gesture-sheen");
	if (sheen === null) {
		throw new Error("Gesture surface requires a sheen element.");
	}
	return sheen;
}

export function createGestureSurface(button: HTMLElement): GestureSurface {
	const view = button.ownerDocument.defaultView;
	const sheen = requireSheen(button);
	const hoverSpring: SpringState = { goal: 0, position: 0, velocity: 0 };
	const pressSpring: SpringState = { goal: 0, position: 0, velocity: 0 };
	const samples: PointerSample[] = [];
	const reducedMotionQuery = view?.matchMedia?.("(prefers-reduced-motion: reduce)");
	let bounds: DOMRect | null = null;
	let destroyed = false;
	let enabled = true;
	let frameId: number | null = null;
	let hovering = false;
	let lastClientPosition: Point | null = null;
	let lastFrameTime: number | null = null;
	let pressedPointerId: number | null = null;
	let reducedMotion = reducedMotionQuery?.matches ?? false;
	let touchHoverPointerId: number | null = null;

	function currentTime(): number {
		return view?.performance.now() ?? performance.now();
	}

	function renderPointer(position: Point): void {
		sheen.style.setProperty("--sensation-gesture-pointer-x", `${position.x}px`);
		sheen.style.setProperty("--sensation-gesture-pointer-y", `${position.y}px`);
	}

	function renderSprings(): void {
		const opacity = Math.max(0, (hoverSpring.position - pressSpring.position ** 2) * 0.5);
		const scale = Math.max(0, 1 - Math.sqrt(Math.max(0, pressSpring.position)));

		sheen.style.setProperty("--sensation-gesture-sheen-opacity", String(opacity));
		sheen.style.setProperty("--sensation-gesture-sheen-scale", String(scale));
	}

	function refreshBounds(): DOMRect {
		bounds = button.getBoundingClientRect();
		const longestSide = Math.max(bounds.width, bounds.height);
		sheen.style.setProperty("--sensation-gesture-sheen-size", `${longestSide * 4}px`);
		return bounds;
	}

	function updatePointer(clientPosition: Point): void {
		lastClientPosition = clientPosition;
		const currentBounds = bounds ?? refreshBounds();
		renderPointer({
			x: clientPosition.x - currentBounds.left,
			y: clientPosition.y - currentBounds.top,
		});
	}

	function rawPointerPosition(): Point | null {
		if (lastClientPosition === null) {
			return null;
		}

		const currentBounds = bounds ?? refreshBounds();
		return {
			x: lastClientPosition.x - currentBounds.left,
			y: lastClientPosition.y - currentBounds.top,
		};
	}

	function samplePointer(timeMilliseconds: number): void {
		const rawPosition = rawPointerPosition();
		if (rawPosition === null) {
			return;
		}

		const time = timeMilliseconds / 1000;
		const firstFreshSample = samples.findIndex(
			(sample) => time - sample.time < PREDICTION_WINDOW_SECONDS,
		);
		if (firstFreshSample === -1) {
			samples.length = 0;
		} else if (firstFreshSample > 1) {
			samples.splice(0, firstFreshSample - 1);
		}

		samples.push({ ...rawPosition, time });
		const velocity = averageVelocity(samples);
		const acceleration = averageAcceleration(samples);
		const predicted = {
			x:
				rawPosition.x +
				velocity.x * PREDICTION_LOOKAHEAD_SECONDS +
				0.5 * acceleration.x * PREDICTION_LOOKAHEAD_SECONDS ** 2,
			y:
				rawPosition.y +
				velocity.y * PREDICTION_LOOKAHEAD_SECONDS +
				0.5 * acceleration.y * PREDICTION_LOOKAHEAD_SECONDS ** 2,
		};

		renderPointer(
			Number.isFinite(predicted.x) && Number.isFinite(predicted.y) ? predicted : rawPosition,
		);
	}

	function advanceSprings(timeMilliseconds: number): void {
		if (lastFrameTime === null) {
			lastFrameTime = timeMilliseconds;
			return;
		}

		const elapsedSeconds = Math.max(0, timeMilliseconds - lastFrameTime) / 1000;
		lastFrameTime = timeMilliseconds;
		advanceSpring(hoverSpring, elapsedSeconds);
		advanceSpring(pressSpring, elapsedSeconds);
	}

	function shouldContinue(): boolean {
		return (hovering && enabled) || isSpringMoving(hoverSpring) || isSpringMoving(pressSpring);
	}

	function requestNextFrame(): void {
		if (destroyed || frameId !== null) {
			return;
		}

		if (view?.requestAnimationFrame === undefined) {
			hoverSpring.position = hoverSpring.goal;
			hoverSpring.velocity = 0;
			pressSpring.position = pressSpring.goal;
			pressSpring.velocity = 0;
			renderSprings();
			return;
		}

		lastFrameTime ??= currentTime();
		frameId = view.requestAnimationFrame(handleFrame);
	}

	function handleFrame(timeMilliseconds: number): void {
		frameId = null;
		advanceSprings(timeMilliseconds);
		if (hovering && enabled) {
			samplePointer(timeMilliseconds);
		}
		renderSprings();

		if (shouldContinue()) {
			requestNextFrame();
		} else {
			lastFrameTime = null;
		}
	}

	function setSpringGoal(spring: SpringState, goal: number, timeMilliseconds: number): void {
		advanceSprings(timeMilliseconds);
		spring.goal = goal;
		if (reducedMotion) {
			spring.position = goal;
			spring.velocity = 0;
		}
		renderSprings();
		requestNextFrame();
	}

	function invalidateBounds(): void {
		bounds = null;
	}

	function startGeometryTracking(): void {
		view?.addEventListener("resize", invalidateBounds);
		button.ownerDocument.addEventListener("scroll", invalidateBounds, true);
	}

	function stopGeometryTracking(): void {
		view?.removeEventListener("resize", invalidateBounds);
		button.ownerDocument.removeEventListener("scroll", invalidateBounds, true);
	}

	function setHover(nextHovering: boolean, timeMilliseconds: number): void {
		if (hovering === nextHovering) {
			return;
		}

		hovering = nextHovering;
		if (hovering) {
			samples.length = 0;
			startGeometryTracking();
		} else {
			stopGeometryTracking();
		}
		setSpringGoal(hoverSpring, hovering && enabled ? 1 : 0, timeMilliseconds);
	}

	function removePressListeners(): void {
		button.ownerDocument.removeEventListener("pointerup", handleDocumentPointerUp, true);
		button.ownerDocument.removeEventListener("pointercancel", handleDocumentPointerCancel, true);
	}

	function finishPress(event: Pick<GesturePointerEvent, "pointerId">, cancelled: boolean): void {
		if (pressedPointerId === null || event.pointerId !== pressedPointerId) {
			return;
		}

		const time = currentTime();
		pressedPointerId = null;
		removePressListeners();
		setSpringGoal(pressSpring, 0, time);
		if (touchHoverPointerId === event.pointerId) {
			touchHoverPointerId = null;
			setHover(false, time);
		}
		if (cancelled) {
			bounds = null;
		}
	}

	function handleDocumentPointerUp(event: PointerEvent): void {
		finishPress(event, false);
	}

	function handleDocumentPointerCancel(event: PointerEvent): void {
		finishPress(event, true);
	}

	function handleReducedMotionChange(event: MediaQueryListEvent): void {
		reducedMotion = event.matches;
		if (!reducedMotion) {
			return;
		}

		hoverSpring.position = hoverSpring.goal;
		hoverSpring.velocity = 0;
		pressSpring.position = pressSpring.goal;
		pressSpring.velocity = 0;
		renderSprings();
	}

	const ResizeObserverConstructor = view?.ResizeObserver;
	const resizeObserver =
		ResizeObserverConstructor === undefined
			? null
			: new ResizeObserverConstructor(() => {
					invalidateBounds();
				});
	resizeObserver?.observe(button);
	reducedMotionQuery?.addEventListener("change", handleReducedMotionChange);

	return {
		destroy() {
			destroyed = true;
			if (frameId !== null) {
				view?.cancelAnimationFrame(frameId);
			}
			removePressListeners();
			stopGeometryTracking();
			resizeObserver?.disconnect();
			reducedMotionQuery?.removeEventListener("change", handleReducedMotionChange);
		},
		pointerCancel(event) {
			finishPress(event, true);
		},
		pointerDown(event) {
			if (!enabled || event.button !== 0 || event.isPrimary === false) {
				return;
			}

			const time = currentTime();
			updatePointer({ x: event.clientX, y: event.clientY });
			pressedPointerId = event.pointerId;
			button.ownerDocument.addEventListener("pointerup", handleDocumentPointerUp, true);
			button.ownerDocument.addEventListener("pointercancel", handleDocumentPointerCancel, true);
			if (event.pointerType === "touch" && !hovering) {
				touchHoverPointerId = event.pointerId;
				setHover(true, time);
			}
			setSpringGoal(pressSpring, 1, time);
		},
		pointerEnter(event) {
			if (event.pointerType === "touch") {
				return;
			}

			bounds = null;
			updatePointer({ x: event.clientX, y: event.clientY });
			setHover(true, currentTime());
		},
		pointerLeave(event) {
			if (event.pointerType === "touch") {
				return;
			}

			bounds = null;
			setHover(false, currentTime());
		},
		pointerMove(event) {
			updatePointer({ x: event.clientX, y: event.clientY });
			if (hovering && enabled) {
				requestNextFrame();
			}
		},
		pointerUp(event) {
			finishPress(event, false);
		},
		setEnabled(nextEnabled) {
			enabled = nextEnabled;
			const time = currentTime();
			if (!enabled) {
				pressedPointerId = null;
				removePressListeners();
				if (touchHoverPointerId !== null) {
					touchHoverPointerId = null;
					setHover(false, time);
				}
				setSpringGoal(pressSpring, 0, time);
			}
			setSpringGoal(hoverSpring, hovering && enabled ? 1 : 0, time);
		},
	};
}

export function createButtonGesture(button: HTMLButtonElement): ButtonGesture {
	return createGestureSurface(button);
}
