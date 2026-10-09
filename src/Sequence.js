import Playable from "./Playable.js";

/**
 * Animation Sequence class
 *
 * @author anthony@straylightagency.be
 */
export default class Sequence extends Playable {
    /**
     * @type {Array<{item: Playable, startTime: number, endTime: number}>}
     */
    items = [];

    /**
     * @param {Array<Playable|Object>} animations
     * @param {Object} [config={}]
     */
    constructor(animations = [], config = {}) {
        super(config);

        this.items = [];
        this.duration = 0;

        animations.forEach(anim => this.add(anim));
    }

    /**
     * @param {Playable|Object} animation
     * @param {null|number} startTime
     * @returns {Sequence}
     */
    add(animation, startTime = null) {
        let item;

        if (animation instanceof Playable) {
            item = animation;
            item.pause();
        } else {
            item = new DomAnimation({ ...animation, autoplay: false });
        }

        item.controlledBySequence = true;

        item.setTimeScale(this.timeScale);
        item.reverse(this.direction);

        const start = startTime !== null ? startTime : this.duration;
        const end = start + item.duration;

        this.items.push({ item, startTime: start, endTime: end });

        this.recalculateDuration();

        return this;
    }

    /**
     * @param {Playable|Object} animation
     * @param {number} timeMs
     * @returns {Sequence}
     */
    addAt(animation, timeMs) {
        return this.add(animation, timeMs);
    }

    /**
     * @return void
     */
    recalculateDuration() {
        this.duration = this.items.reduce((max, entry) => Math.max(max, entry.endTime), 0);
    }

    /**
     * @returns {*}
     */
    start() {
        this.recalculateDuration();

        const startTime = this.direction === 'reverse' ? this.duration : 0;
        this.to(startTime);

        return this.resume();
    }

    /**
     * @param {'normal'|'reverse'} [direction]
     * @returns {this}
     */
    reverse(direction) {
        super.reverse(direction);

        this.recalculateDuration();

        for (const { item } of this.items) {
            item.reverse(this.direction);
        }

        if (!this.running) {
            this.timing = this.direction === 'reverse' ? this.duration : 0;
        }

        return this;
    }

    /**
     * @param {number} scale
     * @returns {this}
     */
    setTimeScale(scale) {
        super.setTimeScale(scale);

        for (const { item } of this.items) {
            item.setTimeScale(this.timeScale);
        }

        return this;
    }

    /**
     * @param {number} globalTime
     */
    evaluate(globalTime) {
        for (const { item, startTime, endTime } of this.items) {
            if (globalTime >= startTime && globalTime <= endTime) {
                item.evaluate(globalTime - startTime);
            } else if (globalTime < startTime) {
                item.evaluate(0);
            } else if (globalTime > endTime) {
                item.evaluate(item.duration);
            }
        }
    }
}