import {functions} from "./easing";
import CancelablePromise from "@straylightagency/cancelable-promise";
import {getElementSizing} from "@straylightagency/utils/dom";

/**
 * @param easing
 * @returns {*|(function(*, *, *, *): *)}
 */
function getEasingFunction(easing) {
    if ( functions[ easing ] ) {
        return functions[ easing ];
    }

    return functions[ 'easeLinear' ];
}

/**
 * @param from
 * @param to
 * @param duration
 * @param easing
 * @param update
 * @returns {CancelablePromise}
 */
export function animate({from, to, duration, easing, update}) {
    easing = typeof easing === "function" ? easing : getEasingFunction( easing ?? "easeLinear" );

    let start = null;
    let cancel = false;

    function loop(timestamp, resolve, reject) {
        if ( cancel ) {
            reject();
            return;
        }

        start = !start ? timestamp : start;
        const progress = timestamp - start;

        if ( typeof from !== typeof to ) {
            throw "The first and second arguments of `animate()` must be of the same type.";
        }

        if ( typeof from === "object" ) {
            const values = Object.fromEntries( Object.entries( from ).map( ([key, value]) => {
                value = easing( progress, value, ( to[ key ] ?? 0 ) - value, duration );

                return [ key, value ];
            } ) );

            update( values, progress );
        } else {
            update( easing( progress, from, to - from, duration ), progress );
        }

        if ( progress < duration ) {
            window.requestAnimationFrame( timestamp => loop( timestamp, resolve, reject ) )
        } else {
            resolve();
        }
    }

    return new CancelablePromise( (resolve, reject, onCancel) => {
        window.requestAnimationFrame( timestamp => loop( timestamp, resolve, reject ) );

        onCancel( () => cancel = true );
    } );
}

/**
 * @param element
 * @param duration
 * @param easing
 * @param display
 * @returns {CancelablePromise}
 */
export function fadeShow(element, duration, easing = 'easeLinear', display = 'block') {
    element.style.display = display;
    element.style.opacity = 0;

    return animate( {
        from: 0,
        to: 100,
        duration,
        easing,
        update: (opacity, progress) => {
            element._animationProgress = progress;
            element.style.opacity = opacity / 100;
        }
    } );
}

/**
 * @param element
 * @param duration
 * @param easing
 * @returns {Promise<void>}
 */
export function fadeHide(element, duration, easing = 'easeLinear') {
    element.style.opacity = 1;

    return animate( {
        from: 100,
        to: 0,
        duration,
        easing,
        update: (opacity, progress) => {
            element._animationProgress = progress;
            element.style.opacity = opacity / 100;
        },
    } ).then( () => {
        element.style.display = 'none';
    } );
}

/**
 * @param element
 * @param duration
 * @param newOpacity
 * @param easing
 * @returns {Promise<void>}
 */
export function fadeTo(element, duration, newOpacity, easing = 'easeLinear') {
    const styles = getComputedStyle( element );
    const currentOpacity = parseFloat( styles.opacity );
    const display = styles.display;

    return animate( {
        from: currentOpacity * 100,
        to: newOpacity * 100,
        duration,
        easing,
        update: (opacity, progress) => {
            element._animationProgress = progress;
            element.style.opacity = opacity / 100;
        }
    } ).then( () => {
        element.style.opacity = newOpacity;

        if ( newOpacity <= 0 ) {
            element.style.display = 'none';
        } else {
            element.style.display = display;
        }
    } );
}

/**
 * @param element
 * @param duration
 * @param easing
 * @param display
 * @returns {Promise<void>}
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
 * @returns {Promise<void>}
 */
export function slideShow(element, duration, easing = 'easeLinear', display = 'block') {
    const styles = getComputedStyle( element );

    const height = getElementSizing( element ).height;

    const paddingTop = parseInt( styles.paddingTop );
    const paddingBottom = parseInt( styles.paddingBottom );

    return animate( {
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
        }
    } ).then( () => {
        element.style.paddingTop = null;
        element.style.paddingBottom = null;
        element.style.height = null;
        element.style.overflow = null;
    } );
}

/**
 * @param element
 * @param duration
 * @param easing
 * @returns {Promise<void>}
 */
export function slideHide(element, duration, easing = 'easeLinear') {
    const styles = getComputedStyle( element );

    const height = getElementSizing( element ).height;

    const paddingTop = parseInt( styles.paddingTop );
    const paddingBottom = parseInt( styles.paddingBottom );

    return animate( {
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
        }
    } ).then( () => {
        element.style.paddingTop = null;
        element.style.paddingBottom = null;
        element.style.height = null;
        element.style.overflow = null;
        element.style.display = 'none';
    } );
}

/**
 * @param element
 * @param duration
 * @param easing
 * @param display
 * @returns {Promise<void>}
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
 * @returns {CancelablePromise}
 */
export function scaleShow(element, duration, easing = 'easeLinear', display = 'block') {
    element.style.display = display;
    element.style.transform = "scale(0)";

    return animate( {
        from: 0,
        to: 100,
        duration,
        easing,
        update: (scale, progress) => {
            element._animationProgress = progress;
            element.style.transform = "scale(" + (scale / 100) + ")";
        }
    } );
}

/**
 * @param element
 * @param duration
 * @param easing
 * @returns {CancelablePromise}
 */
export function scaleHide(element, duration, easing = 'easeLinear') {
    element.style.transform = "scale(1)";

    return animate( {
        from: 100,
        to: 0,
        duration,
        easing,
        update: (scale, progress) => {
            element._animationProgress = progress;
            element.style.transform = "scale(" + (scale / 100) + ")";
        }
    } );
}

/**
 * @param element
 * @param duration
 * @param easing
 * @param display
 * @returns {Promise<void>}
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
