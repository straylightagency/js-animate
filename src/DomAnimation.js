import Playable from './Playable.js';

/**
 * Standalone Animation class using browser Web Animations API
 *
 * @author anthony@straylightagency.be
 */
export default class DomAnimation extends Playable {
    /**
     * @type {null|Element}
     */
    element = null;

    /**
     * @type {Array}
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
     * @param {Array} config.keyframes
     * @param {number} config.duration
     * @param {number} [config.delay=0]
     * @param {string} [config.easing='linear']
     * @param {boolean} [config.autoplay=true]
     * @param {number} [config.timeScale=1]
     * @param {'normal'|'reverse'} [config.direction='normal']
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
     * @return {void}
     */
    initNativeAnimation() {
        if (!this.element) return;

        this.waapiAnimation = this.element.animate(this.keyframes, {
            duration: this.duration,
            delay: this.delay,
            easing: this.easing,
            fill: 'both',
        });

        this.waapiAnimation.currentTime = 0;
        this.waapiAnimation.pause();

        this.#syncPlaybackRate();
    }

    /**
     * @param {'normal'|'reverse'} [direction]
     * @returns {DomAnimation}
     */
    reverse(direction) {
        super.reverse(direction);
        this.#syncPlaybackRate();
        return this;
    }

    /**
     * @param {number} scale
     * @returns {DomAnimation}
     */
    setTimeScale(scale) {
        super.setTimeScale(scale);
        this.#syncPlaybackRate();
        return this;
    }

    /**
     * @returns {Promise|DomAnimation}
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

            this.#syncPlaybackRate();
            this.waapiAnimation.play();

            this.#trackProgress();

            this.waapiAnimation.finished
                .then(() => {
                    this.running = false;

                    const isReverse = this.direction === 'reverse';
                    this.timing = isReverse ? 0 : this.duration;
                    const endProgress = isReverse ? 0 : 1;

                    if (typeof this.onUpdate === 'function') {
                        this.onUpdate(endProgress, this.timing, this);
                    }

                    if (typeof this.onComplete === 'function') {
                        this.onComplete(this);
                    }

                    if (this.#resolve) {
                        const resolveFn = this.#resolve;
                        this.#clearPromiseHandles();
                        resolveFn(this);
                    }
                })
                .catch(err => {
                    if (err.name !== 'AbortError' && this.#reject) {
                        const rejectFn = this.#reject;
                        this.#clearPromiseHandles();
                        rejectFn(err);
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
    to(timeMs) {const effectiveTime = timeMs - this.delay;
        const previousTiming = this.timing;

        this.timing = Math.max(0, Math.min(effectiveTime, this.duration));

        if (this.waapiAnimation) {
            this.waapiAnimation.currentTime = Math.max(0, this.timing);
        }

        if (typeof this.onUpdate === 'function' && effectiveTime >= 0) {
            const progress = this.duration > 0 ? this.timing / this.duration : 1;
            this.onUpdate(progress, this.timing, this);
        }

        if (this.controlledBySequence) {
            const isReverse = this.direction === 'reverse';
            const reachedEnd = !isReverse && previousTiming < this.duration && this.timing >= this.duration;
            const reachedStart = isReverse && previousTiming > 0 && this.timing <= 0;

            if (reachedEnd || reachedStart) {
                if (typeof this.onComplete === 'function') {
                    this.onComplete(this);
                }
            }
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
     * @private
     */
    #syncPlaybackRate() {
        if (this.waapiAnimation) {
            const dirRate = this.direction === 'reverse' ? -1 : 1;
            this.waapiAnimation.playbackRate = dirRate * this.timeScale;
        }
    }

    /**
     * @private
     * @return {void}
     */
    #trackProgress() {
        if (!this.running || typeof this.onUpdate !== 'function') return;

        if (this.waapiAnimation) {
            this.timing = typeof this.waapiAnimation.currentTime === 'number'
                ? this.waapiAnimation.currentTime
                : this.timing;

            const progress = this.duration > 0 ? this.timing / this.duration : 0;
            this.onUpdate(progress, this.timing, this);
        }

        requestAnimationFrame(() => this.#trackProgress());
    }

    /**
     * @private
     */
    #clearPromiseHandles() {
        this.#resolve = null;
        this.#reject = null;
        this.#promise = null;
    }
}