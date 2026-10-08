import Playable from "./Playable.js";
import {getEasingFunction} from "./easing.js";

/**
 * Standalone Animation class
 *
 * @author anthony@straylightagency.be
 */
export default class Animation extends Playable {
    /**
     * @type {number}
     */
    from = 0;

    /**
     * @type {number}
     */
    to = 0;

    /**
     * @type {number}
     */
    duration = 0;

    /**
     * @param {number} t
     * @param {number} b
     * @param {number} c
     * @param {number} d
     * @returns {number}
     */
    easing = (t, b, c, d) => 0;

    /**
     * @param {number|{}} v
     * @param {number} t
     */
    update = (v, t) => {};

    /**
     * @param {{}} config
     * @param {number|{}} config.from
     * @param {number|{}} config.to
     * @param {number} config.duration
     * @param {string|function} config.easing
     * @param {function} config.update
     * @param {boolean} config.autoplay
     */
    constructor(config) {
        super(config);

        const { from, to, duration, easing, update, autoplay = true } = config;

        if (typeof update !== "function") throw new Error("Argument `update` is required and must be a function.");
        if (typeof duration !== "number") throw new Error("Argument `duration` must be a Number.");
        if (typeof from !== typeof to) throw new Error("Arguments `from` and `to` must be of the same type.");

        this.from = from;
        this.to = to;
        this.duration = duration;
        this.easing = getEasingFunction(easing);
        this.update = update;

        if (autoplay) {
            this.start().then(r => {});
        }
    }

    /**
     *
     * @param localTime
     * @returns {void|function}
     */
    evaluate(localTime) {
        const clampedTime = Math.max(0, Math.min(localTime, this.duration));

        if (typeof this.from === "object") {
            const values = Object.fromEntries(
                Object.entries(this.from).map(([key, startVal]) => {
                    const endVal = this.to[key] ?? 0;
                    const val = this.easing(clampedTime, startVal, endVal - startVal, this.duration);
                    return [key, val];
                })
            );
            return this.update(values, clampedTime);
        } else {
            const val = this.easing(clampedTime, this.from, this.to - this.from, this.duration);
            return this.update(val, clampedTime);
        }
    }
}