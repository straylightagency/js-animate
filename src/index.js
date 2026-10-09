import Sequence from "./Sequence.js";
import Animation from "./Animation.js";
import {DomAnimation} from "./DomAnimation.js";
import Parallel from "./Parallel.js";

/**
 * @param {Element} element
 * @returns {{height: number, width: number}}
 */
function getElementSizing(element) {
    const style = getComputedStyle(element);
    if (style.display !== 'none') {
        return { height: element.getBoundingClientRect().height, width: element.getBoundingClientRect().width };
    }

    element.style.visibility = 'hidden';
    element.style.position = 'absolute';
    element.style.display = 'block';

    const height = element.getBoundingClientRect().height;
    const width = element.getBoundingClientRect().width;

    element.style.display = '';
    element.style.position = '';
    element.style.visibility = '';

    return { height, width };
}

/**
 * @param {{}} config
 * @returns {Animation}
 */
export function animate(config) {
    return new Animation(config);
}

/**
 * @param {[]} animations
 * @returns {Sequence}
 */
export function sequence(animations, config = {}) {
    return new Sequence(animations, config);
}

/**
 * @param {[]} animations
 * @returns {Parallel}
 */
export function parallel(animations, config = {}) {
    return new Parallel(animations, config);
}

/**
 * @param duration
 * @returns {Animation}
 */
export function wait(duration) {
    return new Animation({
        from: 0,
        to: 0,
        duration,
        update: () => {},
        autoplay: false,
    });
}

/**
 * @param {Array|NodeList} targets
 * @param {Function} createAnimation
 * @param {Object} options
 * @param {number} options.stagger
 * @param {string: 'start' | 'end' | 'center'} options.from
 */
export function stagger(targets, createAnimation, { stagger = 100, from = 'start' } = {}) {
    let elements = [];

    if (targets instanceof NodeList || Array.isArray(targets)) {
        elements = Array.from(targets);
    } else if (targets instanceof HTMLElement) {
        elements = [targets];
    }

    if (elements.length === 0) {
        return new Sequence([]);
    }

    if (from === 'end') {
        elements = elements.reverse();
    }

    const containerSequence = new Sequence();

    elements.forEach((element, index) => {
        const anim = createAnimation(element, index);

        if (index > 0 && stagger > 0) {
            containerSequence.add(anim, index * stagger);
        } else {
            containerSequence.add(anim, 0);
        }
    });

    return containerSequence;
}

/**
 * @param {Element} element
 * @param {number} duration
 * @param {string} [easing='linear']
 * @param {string} [display='block']
 * @returns {DomAnimation}
 */
export function fadeShow(element, duration, easing = 'linear', display = 'block') {
    return new DomAnimation({
        element,
        keyframes: [
            { opacity: 0 },
            { opacity: 1 }
        ],
        duration,
        easing,
        autoplay: false,
        onStart: () => {
            element.style.display = display;
        }
    });
}

/**
 * @param {Element} element
 * @param {number} duration
 * @param {string} [easing='linear']
 * @returns {DomAnimation}
 */
export function fadeHide(element, duration, easing = 'linear') {
    return new DomAnimation({
        element,
        keyframes: [
            { opacity: 1 },
            { opacity: 0 }
        ],
        duration,
        easing,
        autoplay: false,
        onComplete: (anim) => {
            if (anim.direction === 'normal') {
                element.style.display = 'none';
            }
        }
    });
}

/**
 * @param {Element} element
 * @param {number} duration
 * @param {number} newOpacity
 * @param {string} [easing='linear']
 * @returns {DomAnimation}
 */
export function fadeTo(element, duration, newOpacity, easing = 'linear') {
    const styles = getComputedStyle(element);
    const rawOpacity = parseFloat(styles.opacity);
    const currentOpacity = isNaN(rawOpacity) ? 1 : rawOpacity;

    return new DomAnimation({
        element,
        keyframes: [
            { opacity: currentOpacity },
            { opacity: newOpacity }
        ],
        duration,
        easing,
        autoplay: false,
        onStart: () => {
            if (styles.display === 'none' && newOpacity > 0) {
                element.style.display = 'block';
            }
        },
        onComplete: (anim) => {
            if (anim.direction === 'normal' && newOpacity <= 0) {
                element.style.display = 'none';
            }
        }
    });
}

/**
 * @param {Element} element
 * @param {number} duration
 * @param {string} [easing='linear']
 * @param {string} [display='block']
 * @returns {Promise<DomAnimation>}
 */
export function fadeToggle(element, duration, easing = 'linear', display = 'block') {
    const style = getComputedStyle(element);
    const isHidden = style.display === 'none' || parseFloat(style.opacity) === 0;

    if (element._currentAnimation) {
        element._currentAnimation.abort();
    }

    const animation = isHidden
        ? fadeShow(element, duration, easing, display)
        : fadeHide(element, duration, easing);

    element._currentAnimation = animation;

    return animation.resume().then((animInstance) => {
        if (element._currentAnimation === animation) {
            delete element._currentAnimation;
        }
        return animInstance;
    });
}

/**
 * @param {Element} element
 * @param {number} duration
 * @param {string} [easing='linear']
 * @param {string} [display='block']
 * @returns {DomAnimation}
 */
export function slideShow(element, duration, easing = 'linear', display = 'block') {
    const styles = getComputedStyle(element);
    const targetHeight = getElementSizing(element).height;

    const paddingTop = parseFloat(styles.paddingTop) || 0;
    const paddingBottom = parseFloat(styles.paddingBottom) || 0;

    return new DomAnimation({
        element,
        keyframes: [
            {
                height: '0px',
                paddingTop: '0px',
                paddingBottom: '0px',
                overflow: 'hidden'
            },
            {
                height: `${targetHeight}px`,
                paddingTop: `${paddingTop}px`,
                paddingBottom: `${paddingBottom}px`,
                overflow: 'hidden'
            }
        ],
        duration,
        easing,
        autoplay: false,
        onStart: () => {
            element.style.display = display;
        },
        onComplete: (anim) => {
            // Nettoyage des styles inline pour laisser le CSS ou le layout fluide reprendre la main
            if (anim.direction === 'normal') {
                element.style.height = '';
                element.style.paddingTop = '';
                element.style.paddingBottom = '';
                element.style.overflow = '';
            }
        }
    });
}

/**
 * @param {Element} element
 * @param {number} duration
 * @param {string} [easing='linear']
 * @returns {DomAnimation}
 */
export function slideHide(element, duration, easing = 'linear') {
    const styles = getComputedStyle(element);
    const currentHeight = element.getBoundingClientRect().height;

    const paddingTop = parseFloat(styles.paddingTop) || 0;
    const paddingBottom = parseFloat(styles.paddingBottom) || 0;

    return new DomAnimation({
        element,
        keyframes: [
            {
                height: `${currentHeight}px`,
                paddingTop: `${paddingTop}px`,
                paddingBottom: `${paddingBottom}px`,
                overflow: 'hidden'
            },
            {
                height: '0px',
                paddingTop: '0px',
                paddingBottom: '0px',
                overflow: 'hidden'
            }
        ],
        duration,
        easing,
        autoplay: false,
        onComplete: (anim) => {
            if (anim.direction === 'normal') {
                element.style.display = 'none';
                element.style.height = '';
                element.style.paddingTop = '';
                element.style.paddingBottom = '';
                element.style.overflow = '';
            }
        }
    });
}

/**
 * @param {Element} element
 * @param {number} duration
 * @param {string} [easing='linear']
 * @param {string} [display='block']
 * @returns {Promise<DomAnimation>}
 */
export function slideToggle(element, duration, easing = 'linear', display = 'block') {
    const style = getComputedStyle(element);
    const isHidden = style.display === 'none';

    if (element._currentAnimation) {
        element._currentAnimation.abort();
    }

    const animation = isHidden
        ? slideShow(element, duration, easing, display)
        : slideHide(element, duration, easing);

    element._currentAnimation = animation;

    return animation.resume().then((animInstance) => {
        if (element._currentAnimation === animation) {
            delete element._currentAnimation;
        }
        return animInstance;
    });
}

/**
 * @param {Element} element
 * @param {number} duration
 * @param {string} [easing='linear']
 * @param {string} [display='block']
 * @returns {DomAnimation}
 */
export function scaleShow(element, duration, easing = 'linear', display = 'block') {
    return new DomAnimation({
        element,
        keyframes: [
            { scale: '0', opacity: '0' },
            { scale: '1', opacity: '1' }
        ],
        duration,
        easing,
        autoplay: false,
        onStart: () => {
            element.style.display = display;
        }
    });
}

/**
 * @param {Element} element
 * @param {number} duration
 * @param {string} [easing='linear']
 * @returns {DomAnimation}
 */
export function scaleHide(element, duration, easing = 'linear') {
    return new DomAnimation({
        element,
        keyframes: [
            { scale: '1', opacity: '1' },
            { scale: '0', opacity: '0' }
        ],
        duration,
        easing,
        autoplay: false,
        onComplete: (anim) => {
            if (anim.direction === 'normal') {
                element.style.display = 'none';
            }
        }
    });
}

/**
 * @param {Element} element
 * @param {number} duration
 * @param {string} [easing='linear']
 * @param {string} [display='block']
 * @returns {Promise<DomAnimation>}
 */
export function scaleToggle(element, duration, easing = 'linear', display = 'block') {
    const style = getComputedStyle(element);
    const isHidden = style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';

    if (element._currentAnimation) {
        element._currentAnimation.abort();
    }

    const animation = isHidden
        ? scaleShow(element, duration, easing, display)
        : scaleHide(element, duration, easing);

    element._currentAnimation = animation;

    return animation.resume().then((animInstance) => {
        if (element._currentAnimation === animation) {
            delete element._currentAnimation;
        }
        return animInstance;
    });
}