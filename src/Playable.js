const EPSILON = 0.001;
/**
 * Playable class handling animations
 *
 * @author anthony@straylightagency.be
 */
export default class Playable {
    /**
     * @type {number}
     */
    timing = 0;

    /**
     * @type {number}
     */
    duration = 0;

    /**
     * @type {number}
     */
    delay = 0;

    /**
     * @type {string}
     */
    direction = 'normal';

    /**
     * @type {number}
     */
    #timeScale = 1;

    /**
     * @type {boolean}
     */
    running = false;

    /**
     * @type {boolean}
     */
    looping = false;

    /**
     * @type {boolean}
     */
    alternate = false;

    /**
     * @type {boolean}
     */
    controlledBySequence = false;

    /**
     * @type {null|number}
     */
    lastTimestamp = null;

    /**
     * @type {null|number}
     */
    rafId = null;

    /**
     * @type {null|function}
     */
    onStart = null;

    /**
     * @type {null|function}
     */
    onUpdate = null;

    /**
     * @type {null|function}
     */
    onComplete = null;

    /**
     * @type {null|function}
     */
    onPause = null;

    /**
     * @type {null|function}
     */
    onAbort = null;

    /**
     * @type {boolean}
     */
    hasStarted = false;

    /**
     * @type {null|function}
     */
    #resolve = null;

    /**
     * @type {null|function}
     */
    #reject = null;

    /**
     * @type {null|Promise}
     */
    #promise = null;

    /**
     * @type {null|function}
     */
    #abortHandler = null;

    /**
     * @type {null|AbortSignal}
     */
    signal = null;

    /**
     * @param {{}} config
     */
    constructor(config = {}) {
        const { duration = 0, delay = 0, direction = 'normal', timeScale = 1,
            looping = false, alternate = false, onStart = null, onUpdate = null, onComplete = null,
            onPause = null, onAbort = null, signal = null } = config;

        this.duration = duration;
        this.delay = delay;
        this.direction = direction;
        this.looping = looping;
        this.alternate = alternate;
        this.#timeScale = timeScale;
        this.timing = this.direction === 'reverse' ? this.duration : -this.delay;

        this.onStart = onStart;
        this.onUpdate = onUpdate;
        this.onComplete = onComplete;
        this.onPause = onPause;
        this.onAbort = onAbort;

        this.signal = signal;

        if (this.signal?.aborted) {
            this.abort();
        }
    }

    /**
     * @return {number}
     */
    get timeScale() {
        return this.#timeScale;
    }

    /**
     * @param {number} scale
     * @return {Playable}
     */
    setTimeScale(scale) {
        this.#timeScale = Math.max(0, scale);
        return this;
    }

    /**
     * @returns {Playable|Promise}
     */
    start() {
        this.rewind();
        return this.resume();
    }

    /**
     * @returns {Playable|Promise|null}
     */
    resume() {
        if (this.signal?.aborted) {
            return Promise.reject(new DOMException('Aborted', 'AbortError'));
        }

        if (this.controlledBySequence) {
            return this;
        }

        if (this.running && this.#promise) {
            return this.#promise;
        }

        this.running = true;
        this.lastTimestamp = performance.now();

        if (!this.hasStarted) {
            this.hasStarted = true;
            if (typeof this.onStart === "function") {
                this.onStart(this);
            }
        }

        this.#promise = new Promise((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;

            if (this.signal) {
                this.#abortHandler = () => this.abort();
                this.signal.addEventListener('abort', this.#abortHandler, { once: true });
            }
        });

        this.tick();

        return this.#promise;
    }

    /**
     * @returns {Playable}
     */
    pause() {
        if (!this.running) return this;

        this.running = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;

            if (typeof this.onPause === "function") {
                this.onPause(this);
            }
        }

        return this;
    }

    /**
     * @returns {Playable}
     */
    rewind() {
        if (this.#reject && this.running) {
            this.#reject({ reason: "rewound" });
        }

        this.pause();
        this.hasStarted = false;

        const initialTime = this.direction === 'reverse' ? this.duration : -this.delay;
        this.to(initialTime);

        return this;
    }

    /**
     * @param {null|string} direction
     * @returns {Playable}
     */
    reverse(direction = null) {
        if (direction) {
            this.direction = direction;
        } else {
            this.direction = this.direction === 'normal' ? 'reverse' : 'normal';
        }

        return this;
    }

    /**
     * @returns {Playable}
     */
    abort() {
        this.pause();

        if (typeof this.onAbort === 'function') {
            this.onAbort(this);
        }

        if (this.#reject) {
            const rejectFn = this.#reject;
            this.#cleanup();
            rejectFn(new DOMException('Aborted', 'AbortError'));
        }

        return this;
    }

    /**
     * @param {number} timeMs
     * @returns {Playable}
     */
    to(timeMs) {
        this.timing = Math.max(0, Math.min(timeMs, this.duration));
        this.evaluate(this.timing);

        if (typeof this.onUpdate === "function") {
            const progress = this.duration > 0 ? this.timing / this.duration : 1;
            this.onUpdate(progress, this.timing, this);
        }

        return this;
    }

    /**
     * @return void
     */
    tick() {
        if (!this.running) return;

        const now = performance.now();
        const delta = now - this.lastTimestamp;
        this.lastTimestamp = now;

        const rate = this.direction === 'reverse' ? -1 : 1;

        this.timing += delta * rate * this.#timeScale;

        const isFinished = this.direction === 'reverse'
            ? this.timing <= EPSILON
            : this.timing >= (this.duration - EPSILON);

        if (isFinished) {
            if (this.looping) {
                if (this.alternate) {
                    this.reverse();
                } else {
                    this.timing = this.direction === 'reverse' ? this.duration : 0;
                }

                this.evaluate(this.timing);

                if (typeof this.onUpdate === "function") {
                    this.onUpdate(this.timing / this.duration, this.timing, this);
                }
            } else {
                this.timing = this.direction === 'reverse' ? 0 : this.duration;
                const completeFn = this.evaluate(this.timing);

                if (typeof this.onUpdate === "function") {
                    this.onUpdate(1, this.timing, this);
                }

                this.pause();

                if (typeof this.onComplete === "function") {
                    this.onComplete(this);
                }

                if (typeof completeFn === "function") {
                    completeFn(this);
                }

                if (this.#resolve) {
                    const resolveFn = this.#resolve;
                    this.#cleanup();
                    resolveFn(this);
                }
                return;
            }
        } else {
            this.evaluate(this.timing);

            if (typeof this.onUpdate === "function") {
                const progress = this.timing / this.duration;
                this.onUpdate(progress, this.timing, this);
            }
        }

        this.rafId = requestAnimationFrame(() => this.tick());
    }

    /**
     * @param {number} localTime
     * @return {void|function}
     */
    evaluate(localTime) {
        throw new Error("Method `evaluate` must be herited.");
    }

    /**
     * @return void
     */
    #cleanup() {
        if (this.signal && this.#abortHandler) {
            this.signal.removeEventListener('abort', this.#abortHandler);
            this.#abortHandler = null;
        }

        this.#resolve = null;
        this.#reject = null;
        this.#promise = null;
    }
}