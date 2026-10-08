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
        this.onStart = config.onStart ?? null;
        this.onUpdate = config.onUpdate ?? null;
        this.onComplete = config.onComplete ?? null;
        this.onPause = config.onPause ?? null;
        this.onAbort = config.onAbort ?? null;

        this.signal = config.signal ?? null;

        if (this.signal?.aborted) {
            this.abort();
        }
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
        this.to(0);

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
            this.#clearPromiseHandles();
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
     * @param {boolean} value
     * @returns {Playable}
     */
    loop(value = true) {
        this.looping = value;

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

        this.timing += delta;

        if (this.timing >= this.duration) {
            if (this.looping) {
                this.timing %= this.duration;
                this.evaluate(this.timing);

                if (typeof this.onUpdate === "function") {
                    this.onUpdate(this.timing / this.duration, this.timing, this);
                }
            } else {
                this.timing = this.duration;
                const completeFn = this.evaluate(this.duration);

                if (typeof this.onUpdate === "function") {
                    this.onUpdate(1, this.duration, this);
                }

                this.pause();

                if (typeof this.onComplete === "function") {
                    this.onComplete(this);
                }

                if (typeof completeFn === "function") {
                    completeFn();
                }

                if (this.#resolve) {
                    const resolveFn = this.#resolve;
                    this.#resolve = null;
                    this.#reject = null;
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
    #cleanupSignalListener() {
        if (this.signal && this.#abortHandler) {
            this.signal.removeEventListener('abort', this.#abortHandler);
            this.#abortHandler = null;
        }
    }

    /**
     * @return void
     */
    #clearPromiseHandles() {
        this.#cleanupSignalListener();
        this.#resolve = null;
        this.#reject = null;
        this.#promise = null;
    }
}