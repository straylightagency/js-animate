import Playable from "./Playable.js";

export default class Parallel extends Playable {
    /**
     * @type {[]}
     */
    items = [];

    /**
     * @param {[]} animations
     * @param {{}} config
     */
    constructor(animations = [], config = {}) {
        config.duration = 0;

        super(config);

        animations.forEach(anim => this.add(anim, this.duration));
    }

    /**
     * @param {Playable} playable
     * @returns {Parallel}
     */
    add(playable) {
        if (!(playable instanceof Playable)) {
            throw new Error('Elements of a Parallel group must inherit from Playable.');
        }

        playable.pause();
        playable.controlledBySequence = true;

        playable.setTimeScale(this.timeScale);
        playable.reverse(this.direction);

        this.items.push(playable);
        this.recalculateDuration();

        return this;
    }

    /**
     */
    recalculateDuration() {
        this.duration = this.items.reduce((max, item) => {
            const totalItemDuration = (item.delay ?? 0) + item.duration;
            return Math.max(max, totalItemDuration);
        }, 0);
    }

    /**
     * @param {number} scale
     * @returns {this}
     */
    setTimeScale(scale) {
        super.setTimeScale(scale);

        for (const item of this.items) {
            item.setTimeScale(this.timeScale);
        }

        return this;
    }

    /**
     * @param {'normal'|'reverse'} [direction]
     * @returns {this}
     */
    reverse(direction) {
        super.reverse(direction);

        for (const item of this.items) {
            item.reverse(this.direction);
        }

        if (!this.running) {
            this.timing = this.direction === 'reverse' ? this.duration : 0;
        }

        return this;
    }

    /**
     * @param {number} localTime
     */
    evaluate(localTime) {
        for (const item of this.items) {
            item.to(localTime);
        }
    }
}