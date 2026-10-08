import Playable from "./Playable.js";

/**
 * Animation Sequence class
 *
 * @author anthony@straylightagency.be
 */
export default class Sequence extends Playable {
    /**
     * @type {[]}
     */
    items = [];

    /**
     * @param {[]} animations
     * @param {{}} config
     */
    constructor(animations = [], config = {}) {
        super(config);

        animations.forEach(anim => this.add(anim, this.duration));
    }

    /**
     * @param {Playable} animation
     * @param {null|number} startTime
     * @returns {Sequence}
     */
    add(animation, startTime = null) {
        if (animation instanceof Playable) {
            animation.pause();
            animation.controlledBySequence = true;
        }

        const item = animation instanceof Playable ? animation : new Animation({ ...animation, autoplay: false });
        item.controlledBySequence = true;

        startTime = startTime !== null ? startTime : this.duration;
        const endTime = startTime + item.duration;

        this.items.push({ item, startTime, endTime });
        this.duration = endTime;

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