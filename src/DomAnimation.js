import Playable from './Playable.js';

/**
 * Standalone Animation class using browser Web Animations API
 *
 * @author anthony@straylightagency.be
 */
export class DomAnimation extends Playable {
    /**
     * @type {null|Element}
     */
    element = null;

    /**
     * @type {[]}
     */
    keyframes = [];

    /**
     * @type {null|Animation}
     */
    waapiAnimation = null;

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
     * @param {{}} config
     * @param {Element} config.element
     * @param {[]} config.keyframes
     * @param {number} config.duration
     * @param {string} config.easing
     * @param {boolean} config.autoplay
     */
    constructor(config) {
        super(config);

        const { element, keyframes, duration, easing = 'linear', autoplay = true } = config;

        this.element = element;
        this.keyframes = keyframes;
        this.duration = duration;
        this.easing = easing;

        this.initNativeAnimation();

        if (autoplay) {
            this.start();
        }
    }

    /**
     * @return void
     */
    initNativeAnimation() {
        this.waapiAnimation = this.element.animate(this.keyframes, {
            duration: this.duration,
            easing: this.easing,
            fill: 'both',
        });

        this.waapiAnimation.pause();
    }

    /**
     * @returns {Promise}
     */
    resume() {
        if (this.signal?.aborted) {
            return Promise.reject(new DOMException('Aborted', 'AbortError'));
        }

        if (this.controlledBySequence) {
            return this;
        }

        if (this.running && this.#promise) return this.#promise;

        this.running = true;

        if (!this.hasStarted) {
            this.hasStarted = true;
            if (typeof this.onStart === 'function') {
                this.onStart(this);
            }
        }

        this.#promise = new Promise((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;

            if (this.signal) {
                const onAbort = () => this.abort();
                this.signal.addEventListener('abort', onAbort, { once: true });
            }

            this.waapiAnimation.play();

            this.#trackProgress();

            this.waapiAnimation.finished
                .then(() => {
                    this.running = false;
                    this.timing = this.duration;

                    if (typeof this.onUpdate === 'function') {
                        this.onUpdate(1, this.duration, this);
                    }

                    if (typeof this.onComplete === 'function') {
                        this.onComplete(this);
                    }

                    if (this.#resolve) {
                        const resolveFn = this.#resolve;
                        this.#resolve = null;
                        this.#reject = null;
                        resolveFn(this);
                    }
                })
                .catch(err => {
                    if (err.name !== 'AbortError' && this.#reject) {
                        this.#reject(err);
                    }
                });
        });

        return this.#promise;
    }

    /**
     * @returns {DomAnimation}
     */
    pause() {
        if (!this.running) return this;

        this.running = false;

        if (this.waapiAnimation) {
            this.waapiAnimation.pause();
        }

        if (typeof this.onPause === 'function') {
            this.onPause(this);
        }

        return this;
    }

    /**
     * @param {number} timeMs
     * @returns {DomAnimation}
     */
    to(timeMs) {
        this.timing = Math.max(0, Math.min(timeMs, this.duration));

        if (this.waapiAnimation) {
            this.waapiAnimation.currentTime = this.timing;
        }

        if (typeof this.onUpdate === 'function') {
            const progress = this.duration > 0 ? this.timing / this.duration : 1;
            this.onUpdate(progress, this.timing, this);
        }

        return this;
    }

    /**
     * @returns {Playable}
     */
    abort() {
        if (this.waapiAnimation) {
            this.waapiAnimation.cancel();
        }

        return super.abort();
    }

    /**
     * @param {number} localTime
     * @return {void}
     */
    evaluate(localTime) {
        this.to(localTime);
    }

    /**
     * @return {void}
     */
    #trackProgress() {
        if (!this.running || typeof this.onUpdate !== 'function') return;

        if (this.waapiAnimation) {
            this.timing = typeof this.waapiAnimation.currentTime === 'number'
                ? this.waapiAnimation.currentTime
                : this.timing;

            const progress = this.duration > 0 ? this.timing / this.duration : 1;
            this.onUpdate(progress, this.timing, this);
        }

        requestAnimationFrame(() => this.#trackProgress());
    }
}