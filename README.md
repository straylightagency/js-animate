# @straylightagency/animate

A lightweight JavaScript animation library for the modern web.

`@straylightagency/animate` provides a simple API for creating animations, controlling their playback, and orchestrating complex motion sequences. From animating numeric values to building DOM transitions and scroll-driven interactions, it gives you the building blocks to create dynamic web experiences with vanilla JavaScript.

- **Zero runtime dependencies**
- **ES modules**
- **Composable animations**
- **Timeline sequences and parallel playback**
- **Built-in easing functions**
- **DOM animations powered by the Web Animations API**

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Core concepts](#core-concepts)
- [Animating values](#animating-values)
- [Animating DOM elements](#animating-dom-elements)
- [Playback controls](#playback-controls)
- [Sequences and timelines](#sequences-and-timelines)
- [Parallel animations](#parallel-animations)
- [Stagger animations](#stagger-animations)
- [Visibility-based animations](#visibility-based-animations)
- [Scroll-driven animations](#scroll-driven-animations)
- [Easing functions](#easing-functions)
- [Callbacks and lifecycle](#callbacks-and-lifecycle)
- [API reference](#api-reference)
- [Browser support](#browser-support)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install the package using npm:

```bash
npm install @straylightagency/animate
```

The library uses ES modules and can be imported into any JavaScript project with npm package support.

```javascript
import {
    animate,
    sequence,
    parallel,
    wait,
    stagger,
    useViewIntersection,
    useScrollAnimation,
} from '@straylightagency/animate';
```

For browser projects, use a bundler such as Vite or another tool that supports ES modules.

## Quick start

Create an animation that interpolates a numeric value from `0` to `100` over one second.

```javascript
import { animate } from '@straylightagency/animate';

const animation = animate({
    from: 0,
    to: 100,
    duration: 1_000,
    easing: 'easeOutCubic',

    update(value) {
        console.log(value);
    },
});
```

The `update` callback receives the interpolated value on every animation frame.

You can use this value to animate anything that JavaScript can control: canvas drawings, counters, custom properties, or application state.

## Core concepts

The library provides a few fundamental building blocks.

| API | Purpose |
| --- | --- |
| `animate()` | Interpolate numbers or objects over time. |
| `sequence()` | Run animations in a timeline, with optional overlaps and offsets. |
| `parallel()` | Group animations so they run together. |
| `wait()` | Create a delay that can be added to a sequence. |
| `delay()` | Place an existing animation after a delay. |
| `stagger()` | Create a sequence of animations with progressive delays. |
| `useViewIntersection()` | Trigger animations when elements enter or leave an observed area. |
| `useScrollAnimation()` | Synchronize an animation's progress with scrolling. |

DOM-specific transitions are implemented by `domAnimate`, which uses the browser's native Web Animations API.

## Animating values

The `animate()` function creates an animation between a starting value and an ending value.

### Numeric values

```javascript
import { animate } from '@straylightagency/animate';

const counter = { value: 0 };

animate({
    from: 0,
    to: 1_000,
    duration: 2_000,
    easing: 'easeOutCubic',

    update(value) {
        counter.value = value;

        document.querySelector('.counter').textContent =
            Math.round(value).toLocaleString();
    },
});
```

### Multiple values

You can animate an object containing multiple numeric properties.

```javascript
import { animate } from '@straylightagency/animate';

animate({
    from: {
        x: 0,
        y: 0,
        opacity: 0,
    },

    to: {
        x: 300,
        y: 100,
        opacity: 1,
    },

    duration: 1200,
    easing: 'easeInOutCubic',

    update(values) {
        console.log(values.x, values.y, values.opacity);
    },
});
```

Each property is interpolated independently. The `update` callback receives an object containing the current values.

This approach is useful for canvas rendering, custom visualizations, counters, and other animations that aren't tied directly to CSS.

## Animating DOM elements

For DOM animations, use the `domAnimate` function and provide a target element, keyframes, and a duration.

```javascript
import { domAnimate } from '@straylightagency/animate';

const element = document.querySelector('.box');

const animation = domAnimate({
    element,

    keyframes: [
        { opacity: 0, transform: 'translateY(30px)' },
        { opacity: 1, transform: 'translateY(0)' },
    ],

    duration: 600,
    easing: 'ease-out',
    autoplay: true,
});
```

The `keyframes` property follows the browser's [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) format.

You can animate CSS properties such as:

- `opacity`
- `transform`
- `width` and `height`
- `backgroundColor`
- `borderRadius`
- Other properties supported by the Web Animations API

### Control autoplay

Set `autoplay` to `false` when you want to prepare an animation without starting it immediately.

```javascript
const animation = domAnimate({
    element: document.querySelector('.panel'),

    keyframes: [
        { opacity: 0 },
        { opacity: 1 },
    ],

    duration: 500,
    autoplay: false,
});

animation.start();
```

This is useful when animations are controlled by events, sequences, or scroll interactions.

### Animating with DOM Helpers

Pre-configured animation factories designed to drop directly into timelines or run standalone.

```javascript
import { fadeShow, slideShow, sequence } from "@straylightagency/animate";

const seq = sequence([
    fadeShow({
        element: document.querySelector('.box'),
        duration: 1_000,
        onComplete: () => {
            console.log( 'Animation Complete' )
        }
    }),
    slideShow({
        element: document.querySelector('.box2'),
        duration: 600,
    })
]);

seq.resume();
```

Available helpers functions : 
- `fadeShow(config)`
- `fadeHide(config)`
- `fadeTo(config)`
- `fadeToggle(config)`
- `slideShow(config)`
- `slideHide(config)`
- `slideToggle(config)`
- `scaleShow(config)`
- `scaleHide(config)`
- `scaleToggle(config)`

## Playback controls

Animations share a common playback interface through the `Playable` base class.

### Start and pause

```javascript
const animation = animate({
    from: 0,
    to: 100,
    duration: 2_000,
    update(value) {
        console.log(value);
    },
    autoplay: false,
});

animation.start();
```

Pause an animation and resume it later:

```javascript
animation.pause();

// Resume from the current position.
animation.resume();
```

### Reverse playback

```javascript
animation.reverse();
animation.start();
```

You can also specify a direction explicitly:

```javascript
animation.reverse('reverse');
animation.start();
```

Supported directions are `normal` and `reverse`.

### Change playback speed

```javascript
animation.setTimeScale(2);
```

A time scale of `2` plays the animation twice as fast. A time scale of `0.5` plays it at half speed.

### Seek to a specific time

```javascript
// Move to 500 milliseconds into the animation.
animation.to(500);
```

The supplied time is expressed in milliseconds.

### Abort an animation

```javascript
animation.abort();
```

Aborting stops the animation. The playback promise may reject with an `AbortError`, so handle cancellation when using asynchronous flows.

### Looping

The playback configuration also supports looping and alternate playback.

```javascript
const animation = animate({
    from: 0,
    to: 100,
    duration: 1_000,
    looping: true,
    alternate: true,

    update(value) {
        console.log(value);
    },
});
```

With `looping: true`, the animation repeats. With `alternate: true`, its direction alternates between iterations.

## Sequences and timelines

Use `sequence()` to orchestrate multiple animations on a shared timeline.

Animations can run one after another, overlap, or start at a specific time.

### Sequential animations

```javascript
import { sequence } from '@straylightagency/animate';

const box = document.querySelector('.box');

const timeline = sequence([
    {
        element: box,
        keyframes: [
            { transform: 'translateX(0)' },
            { transform: 'translateX(200px)' },
        ],
        duration: 800,
        easing: 'ease-out',
    },

    {
        element: box,
        keyframes: [
            { transform: 'translateX(200px) scale(1)' },
            { transform: 'translateX(200px) scale(1.2)' },
        ],
        duration: 300,
        easing: 'ease-in-out',
    },
]);

timeline.start();
```

Each animation begins after the preceding animation by default.

### Add an animation to a timeline

```javascript
import { sequence, wait } from '@straylightagency/animate';

const timeline = sequence([]);

timeline.add({
    element: document.querySelector('.title'),
    keyframes: [
        { opacity: 0 },
        { opacity: 1 },
    ],
    duration: 500,
});

timeline.add(wait(200));

timeline.add({
    element: document.querySelector('.description'),
    keyframes: [
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' },
    ],
    duration: 700,
});

timeline.start();
```

The description begins after the title animation and the additional delay.

### Position animations on the timeline

The `add()` method accepts an optional position argument.

```javascript
const timeline = sequence([]);

timeline.add(firstAnimation);
timeline.add(secondAnimation, '<');
timeline.add(thirdAnimation, '>');

timeline.start();
```

The supported position forms are:

| Position | Meaning |
| --- | --- |
| Omitted | Append after the current timeline duration. |
| A number | Start at the specified time in milliseconds. |
| `'<`' | Start at the same time as the previous animation. |
| `'>'` | Start at the end time of the previous animation. |
| `'+=200'` | Start 200 milliseconds after the current timeline duration. |
| `'-=200'` | Start 200 milliseconds before the current timeline duration. |

For example, start an animation at a precise point in the timeline:

```javascript
timeline.add(thirdAnimation, 1200);
```

You can also use `addAt()` as an explicit alternative to `add()` with a numeric position:

```javascript
timeline.addAt(thirdAnimation, 1200);
```

### Reverse a timeline

```javascript
timeline.reverse();
timeline.start();
```

A sequence can also be created with configuration options inherited from `Playable`, such as `timeScale`, `direction`, and lifecycle callbacks.

## Parallel animations

Use `parallel()` to group existing `Playable` instances so they share the same playback timeline.

```javascript
import { animate, parallel } from '@straylightagency/animate';

const move = animate({
    from: 0,
    to: 300,
    duration: 1_000,
    autoplay: false,

    update(value) {
        document.querySelector('.box').style.transform =
            `translateX(${value}px)`;
    },
});

const fade = animate({
    from: 0,
    to: 1,
    duration: 600,
    autoplay: false,

    update(value) {
        document.querySelector('.box').style.opacity = value;
    },
});

const animation = parallel([move, fade]);

animation.start();
```

Both animations begin together. The duration of the group is determined by its longest child animation, including its configured delay.

**Note:** `parallel()` expects instances of `Playable`, such as those returned by `animate()`.

## Stagger animations

Use `stagger()` to create a sequence of animations for multiple elements.

```javascript
import { stagger, domAnimate } from '@straylightagency/animate';

const items = document.querySelectorAll('.card');

const animation = stagger(
    items,

    (element) => domAnimate({
        element,

        keyframes: [
            { opacity: 0, transform: 'translateY(30px)' },
            { opacity: 1, transform: 'translateY(0)' },
        ],

        duration: 600,
        easing: 'ease-out',
        autoplay: false,
    }),

    100,
);

animation.start();
```

The third argument defines the stagger interval in milliseconds.

You can also specify the starting direction:

```javascript
const animation = stagger(
    document.querySelectorAll('.card'),
    createAnimation,
    100,
    'end',
);

animation.start();
```

Supported `from` values are:

- `start` — animate in the original order.
- `end` — animate in reverse order.
- `center` — accepted by the documented parameter type; center-out ordering should be verified against the current implementation before relying on it.

The callback receives the current element and its index, allowing you to customize each animation.

## Visibility-based animations

`useViewIntersection()` uses the browser's `IntersectionObserver` API to trigger a `Playable` when target elements enter or leave an observed region.

This is useful for reveal-on-scroll effects, animated content sections, and progressive page entrances.

### Animate when an element enters the viewport

```javascript
import { useViewIntersection, domAnimate } from '@straylightagency/animate';

const elements = document.querySelectorAll('.reveal');

const cleanup = useViewIntersection(
    elements,

    (element) => domAnimate({
        element,

        keyframes: [
            { opacity: 0, transform: 'translateY(24px)' },
            { opacity: 1, transform: 'translateY(0)' },
        ],

        duration: 700,
        easing: 'ease-out',
        autoplay: false,
    }),

    {
        threshold: 0.2,
        once: true,
    },
);
```

Each element is observed for intersection with the viewport. The created animations are coordinated through a sequence.

### Available options

| Option | Default | Description |
| --- | --- | --- |
| `threshold` | `0.2` | Intersection ratio that triggers observation callbacks. |
| `rootMargin` | `'0px'` | Margin around the observer's root. |
| `root` | `null` | Optional scrolling container used as the observer root. |
| `once` | `true` | Stop observing elements after their first intersection when toggling is disabled. |
| `toggle` | `false` | Reverse playback when elements enter and leave the observed area. |
| `onEnter` | `null` | Callback invoked when an observed element enters. |
| `onLeave` | `null` | Callback invoked when an observed element leaves. |

The callbacks receive the `IntersectionObserverEntry` and the associated sequence.

```javascript
const cleanup = useViewIntersection(
    document.querySelectorAll('.reveal'),
    createAnimation,
    {
        threshold: 0.25,

        onEnter(entry, animation) {
            console.log('Entered:', entry.target);
        },

        onLeave(entry, animation) {
            console.log('Left:', entry.target);
        },
    },
);
```

### Cleanup

The function returns a cleanup callback that disconnects the observer.

```javascript
cleanup();
```

Call it when the associated component or page section is removed.

## Scroll-driven animations

`useScrollAnimation()` links the progress of a `Playable` animation to the scroll position of a container.

```javascript
import {
    animate,
    useScrollAnimation,
} from '@straylightagency/animate';

const element = document.querySelector('.progress');

const animation = animate({
    from: 0,
    to: 100,
    duration: 1_000,

    update(value) {
        element.style.width = `${value}%`;
    },
});

const cleanup = useScrollAnimation(animation);
```

The animation is paused and its position is updated according to the scroll progress.

The function accepts an optional scroll container:

```javascript
const container = document.querySelector('.scroll-container');

const cleanup = useScrollAnimation(animation, container);
```

When a custom container is provided, its scroll position and scrollable height determine the progress.

### Cleanup

Remove the event listeners when they are no longer needed:

```javascript
cleanup();
```

The implementation listens for scroll events and window resizing to keep the animation synchronized.

## Easing functions

Easing functions control the rate of change during an animation.

The library includes easing implementations for linear, quadratic, cubic, quartic, quintic, sinusoidal, exponential, circular, elastic, and back curves.

Examples of easing names used by the value-animation API include:

```javascript
animate({
    from: 0,
    to: 100,
    duration: 800,
    easing: 'easeOutCubic',
    update(value) {
        console.log(value);
    },
});
```

Other available implementations include:

| Easing family | Examples |
| --- | --- |
| Linear | `easeLinear` |
| Quadratic | `easeInQuad`, `easeOutQuad`, `easeInOutQuad` |
| Cubic | `easeInCubic`, `easeOutCubic`, `easeInOutCubic` |
| Quartic | `easeInQuart`, `easeOutQuart`, `easeInOutQuart` |
| Quintic | `easeInQuint`, `easeOutQuint`, `easeInOutQuint` |
| Sine | `easeInSine`, `easeOutSine`, `easeInOutSine` |
| Exponential | `easeInExpo`, `easeOutExpo`, `easeInOutExpo` |
| Circular | `easeInCirc`, `easeOutCirc`, `easeInOutCirc` |
| Elastic | `easeInElastic`, `easeOutElastic`, `easeInOutElastic` |
| Back | `easeInBack`, `easeOutBack`, `easeInOutBack` |

### Import easing functions directly

The package exposes an easing entry point:

```javascript
import * as easing from '@straylightagency/animate/easing';

console.log(easing.easeOutCubic);
```

You can also import individual functions:

```javascript
import {
    easeInOutCubic,
    easeOutElastic,
} from '@straylightagency/animate/easing';
```

The numeric easing functions use the conventional four-argument signature:

```javascript
easingFunction(time, startValue, changeInValue, duration);
```

For DOM animations, `easing` is passed to the browser's Web Animations API, so use valid CSS easing values such as `'linear'`, `'ease-in'`, `'ease-out'`, and `'ease-in-out'`.

## Callbacks and lifecycle

The `Playable` configuration supports callbacks for different stages of an animation.

```javascript
const animation = animate({
    from: 0,
    to: 100,
    duration: 1_000,

    onStart(animation) {
        console.log('Animation started');
    },

    onUpdate(progress, time, animation) {
        console.log('Progress:', progress);
        console.log('Elapsed time:', time);
    },

    onComplete(animation) {
        console.log('Animation completed');
    },

    onPause(animation) {
        console.log('Animation paused');
    },

    onAbort(animation) {
        console.log('Animation aborted');
    },

    update(value) {
        console.log('Current value:', value);
    },
});
```

### Callback reference

| Callback | Arguments | Purpose |
| --- | --- | --- |
| `onStart` | `animation` | Called when playback starts. |
| `onUpdate` | `progress`, `time`, `animation` | Called when playback progress changes. |
| `onComplete` | `animation` | Called when playback completes. |
| `onPause` | `animation` | Called when playback is paused. |
| `onAbort` | `animation` | Called when playback is aborted. |
| `update` | `value`, `time` | Called by `animate()` with the interpolated value and local time. |

`progress` is a normalized value between `0` and `1`, while `time` is measured in milliseconds.

### AbortSignal support

The base playback configuration accepts an `AbortSignal`, which can be useful for cancelling animations when a component is disposed.

```javascript
const controller = new AbortController();

const animation = animate({
    from: 0,
    to: 100,
    duration: 2_000,
    signal: controller.signal,

    update(value) {
        console.log(value);
    },
});

// Cancel the animation.
controller.abort();
```

Handle rejected playback promises when cancellation is possible:

```javascript
animation.start().catch((error) => {
    if (error.name !== 'AbortError') {
        throw error;
    }
});
```

## API reference

### `animate(config)`

Creates an animation that interpolates numbers or objects.

| Property | Type | Description |
| --- | --- | --- |
| `from` | `number \| object` | Initial value. |
| `to` | `number \| object` | Target value. Must have the same top-level type as `from`. |
| `duration` | `number` | Duration in milliseconds. |
| `easing` | `string \| function` | Easing function or supported easing identifier. |
| `update` | `function` | Required callback receiving interpolated values. |
| `autoplay` | `boolean` | Automatically start playback; defaults to `true`. |

### `sequence(animations, config)`

Creates a timeline of animations.

- `animations`: an array of `Playable` instances or DOM animation configuration objects.
- `config`: optional playback configuration.
- `add(animation, position)`: append or position an animation.
- `addAt(animation, timeMs)`: add an animation at a specified time.
- `start()`: initialize and start the timeline.
- `reverse(direction)`: change the playback direction.
- `setTimeScale(scale)`: adjust the playback speed.

### `parallel(animations, config)`

Creates a group of animations that play on the same timeline.

- `animations`: an array of `Playable` instances.
- `config`: optional playback configuration.
- `add(animation)`: add another `Playable` instance.

### `wait(duration)`

Creates an animation with no visible effect that can be used as a delay in a sequence.

- `duration`: duration in milliseconds.

### `delay(playable, delayMs)`

Creates a sequence that schedules a `Playable` after a specified delay.

- `playable`: an existing `Playable` instance.
- `delayMs`: delay in milliseconds.

### `stagger(targets, createAnimation, staggerDelay, from)`

Creates a sequence of animations for multiple elements.

- `targets`: an element, `NodeList`, or array.
- `createAnimation`: callback receiving an element and its index, returning a `Playable`.
- `staggerDelay`: delay between animation start times, in milliseconds.
- `from`: optional ordering mode (`'start'`, `'end'`, or `'center'` in the documented parameter type).

### `useViewIntersection(targets, createAnimation, config)`

Creates intersection-triggered animation sequences.

- `targets`: an element, `NodeList`, or array.
- `createAnimation`: a `Playable` instance or a callback returning a `Playable`.
- `config`: intersection and playback options.
- Returns a cleanup function.

### `useScrollAnimation(playable, container)`

Synchronizes a `Playable` with scroll progress.

- `playable`: an animation or timeline.
- `container`: optional scroll container; defaults to `window`.
- Returns a cleanup function.

### `Playable`

The common playback interface exposes:

| Method | Description |
| --- | --- |
| `start()` | Rewind and start playback. |
| `resume()` | Resume playback. |
| `pause()` | Pause playback. |
| `rewind()` | Reset playback to its initial position. |
| `reverse(direction)` | Change playback direction. |
| `abort()` | Stop playback and trigger cancellation handling. |
| `to(timeMs)` | Seek to a specific time. |
| `setTimeScale(scale)` | Change playback speed. |

### `domAnimate`

Creates a DOM animation using the Web Animations API.

Its configuration includes:

- `element`: the target element.
- `keyframes`: Web Animations API keyframes.
- `duration`: duration in milliseconds.
- `delay`: optional delay in milliseconds.
- `easing`: CSS-compatible easing value.
- `autoplay`: whether to start automatically.
- `timeScale`: playback speed.
- `direction`: `'normal'` or `'reverse'`.
- Lifecycle callbacks and an optional `AbortSignal`, inherited from `Playable`.

## Browser support

The library relies on browser features including:

- ES modules
- `requestAnimationFrame`
- `performance.now()`
- The Web Animations API
- `IntersectionObserver` for visibility-based triggers

Support for the complete API depends on the browser's implementation of these features. `domAnimate` and the visibility-based helpers require their corresponding browser APIs.

## Contributing

Contributions, bug reports, and feature requests are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the affected animation behavior in a browser.
5. Submit a pull request.

Repository: https://github.com/straylightagency/js-animate

Report issues: https://github.com/straylightagency/js-animate/issues

## License

`@straylightagency/animate` is released under the MIT License.

See the [LICENSE](LICENSE) file for details.
