import {getElementSizing} from "@straylightagency/utils/dom";
import Sequence from "./Sequence.js";
import Animation from "./Animation.js";
import {DomAnimation} from "./DomAnimation.js";

/**
 * @param config
 * @returns {Animation}
 */
export function animate(config) {
    return new Animation(config);
}

/**
 * @param animations
 * @returns {Sequence}
 */
export function sequence(animations) {
    return new Sequence(animations);
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
 * @param element
 * @param duration
 * @param easing
 * @param display
 * @returns {Animation}
 */
export function fadeShow(element, duration, easing = 'easeLinear', display = 'block') {
    element.style.display = display;
    element.style.opacity = 0;

    return new Animation({
        element,
        keyframes: [{ opacity: 0 }, { opacity: 1 }],
        duration,
        easing,
        autoplay: false,
    } );
}

/**
 * @param element
 * @param duration
 * @param easing
 * @returns {DomAnimation}
 */
export function fadeHide(element, duration, easing = 'easeLinear') {
    element.style.opacity = 1;

    return new DomAnimation({
        element,
        keyframes: [{ opacity: 1 }, { opacity: 0 }],
        duration,
        easing,
        autoplay: false,
        onComplete: () => {
            element.style.display = 'none';
        }
    } );
}

/**
 * @param element
 * @param duration
 * @param newOpacity
 * @param easing
 * @returns {DomAnimation}
 */
export function fadeTo(element, duration, newOpacity, easing = 'easeLinear') {
    const styles = getComputedStyle( element );
    const currentOpacity = parseFloat( styles.opacity );
    const display = styles.display;

    return new DomAnimation({
        element,
        keyframes: [{ opacity: currentOpacity }, { opacity: newOpacity }],
        duration,
        easing,
        autoplay: false,
        onComplete: () => {
            element.style.opacity = newOpacity;

            if ( newOpacity <= 0 ) {
                element.style.display = 'none';
            } else {
                element.style.display = display;
            }
        }
    } );
}

/**
 * @param element
 * @param duration
 * @param easing
 * @param display
 * @returns {DomAnimation}
 */
export function fadeToggle(element, duration, easing = 'easeLinear', display = 'block') {
    let animation;
    const style = getComputedStyle( element );

    element._currentAnimation ? element._currentAnimation.cancel() : null;

    if ( parseInt( style.opacity ) === 1 || style.display !== 'none' ) {
        element._currentAnimation = animation = fadeHide( element, duration, easing );
    } else {
        element._currentAnimation = animation = fadeShow( element, duration, easing, display );
    }

    return animation.then( () => {
        delete element._currentAnimation
        delete element._animationProgress
    } );
}

/**
 * @param element
 * @param duration
 * @param easing
 * @param display
 * @returns {Animation}
 */
export function slideShow(element, duration, easing = 'easeLinear', display = 'block') {
    const styles = getComputedStyle( element );

    const height = getElementSizing( element ).height;

    const paddingTop = parseInt( styles.paddingTop );
    const paddingBottom = parseInt( styles.paddingBottom );

    return new Animation({
        from: {
            paddingTop: 0,
            paddingBottom: 0,
            height: 0,
        },
        to: {
            paddingTop,
            paddingBottom,
            height,
        },
        duration,
        easing,
        update: (values, progress) => {
            element._animationProgress = progress;

            element.style.display = display;
            element.style.overflow = 'hidden';
            element.style.paddingTop = values.paddingTop + "px";
            element.style.paddingBottom = values.paddingBottom + "px";
            element.style.height = values.height + "px";

            return () => {
                element.style.paddingTop = null;
                element.style.paddingBottom = null;
                element.style.height = null;
                element.style.overflow = null;
            };
        },
        autoplay: false,
    } );
}

/**
 * @param element
 * @param duration
 * @param easing
 * @returns {Animation}
 */
export function slideHide(element, duration, easing = 'easeLinear') {
    const styles = getComputedStyle( element );

    const height = getElementSizing( element ).height;

    const paddingTop = parseInt( styles.paddingTop );
    const paddingBottom = parseInt( styles.paddingBottom );

    return new Animation({
        from: {
            paddingTop,
            paddingBottom,
            height,
        },
        to: {
            paddingTop: 0,
            paddingBottom: 0,
            height: 0,
        },
        duration,
        easing,
        update: (values, progress) => {
            element._animationProgress = progress;

            element.style.overflow = 'hidden';
            element.style.paddingTop = values.paddingTop + "px";
            element.style.paddingBottom = values.paddingBottom + "px";
            element.style.height = values.height + "px";

            return () => {
                element.style.paddingTop = null;
                element.style.paddingBottom = null;
                element.style.height = null;
                element.style.overflow = null;
                element.style.display = 'none';
            };
        },
        autoplay: false,
    } );
}

/**
 * @param element
 * @param duration
 * @param easing
 * @param display
 * @returns {DomAnimation}
 */
export function slideToggle(element, duration, easing = 'easeLinear', display = 'block') {
    let animation;
    const style = getComputedStyle( element );

    element._currentAnimation ? element._currentAnimation.cancel() : null;
    element._animationProgress = element._animationProgress ? element._animationProgress : duration;

    if ( style.display !== 'none' ) {
        element._currentAnimation = animation = slideHide( element, element._animationProgress, easing );
    } else {
        element._currentAnimation = animation = slideShow( element, element._animationProgress, easing, display );
    }

    return animation.then( () => {
        delete element._currentAnimation
        delete element._animationProgress
    } );
}

/**
 * @param element
 * @param duration
 * @param easing
 * @param display
 * @returns {DomAnimation}
 */
export function scaleShow(element, duration, easing = 'easeLinear', display = 'block') {
    element.style.display = display;
    element.style.transform = "scale(0)";

    const from = 0, to = 1;

    return new DomAnimation({
        element,
        keyframes: [
            { scale: `${from}` },
            { scale: `${to}` }
        ],
        duration,
        easing,
        autoplay: false
    });
}

/**
 * @param element
 * @param duration
 * @param easing
 * @returns {DomAnimation}
 */
export function scaleHide(element, duration, easing = 'easeLinear') {
    const from = 1, to = 0;

    return new DomAnimation({
        element,
        keyframes: [
            { scale: `${from}` },
            { scale: `${to}` }
        ],
        duration,
        easing,
        autoplay: false,
        onComplete: () => {
            element.style.display = 'none';
        }
    });
}

/**
 * @param element
 * @param duration
 * @param easing
 * @param display
 * @returns {DomAnimation}
 */
export function scaleToggle(element, duration, easing = 'easeLinear', display = 'block') {
    let animation;
    const style = getComputedStyle( element );

    element._currentAnimation ? element._currentAnimation.cancel() : null;

    if ( style.display !== 'none' ) {
        element._currentAnimation = animation = scaleHide( element, duration, easing );
    } else {
        element._currentAnimation = animation = scaleShow( element, duration, easing, display );
    }

    return animation.then( () => {
        delete element._currentAnimation
        delete element._animationProgress
    } );
}
