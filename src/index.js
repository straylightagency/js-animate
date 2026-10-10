import Playable from "./Playable.js";
import Animation from "./Animation.js";
import Parallel from "./Parallel.js";
import Sequence from "./Sequence.js";
import DomAnimation from "./DomAnimation.js";

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
 * @param {{}} config
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
 * @param {Playable} playable
 * @param {number} delayMs
 * @returns {Sequence}
 */
export function delay(playable, delayMs) {
    if (!(playable instanceof Playable)) {
        throw new Error("Argument `Playable` must be a Playable instance.");
    }

    const containerSequence = new Sequence();

    return new Sequence().add(playable, delayMs);
}

/**
 * @param {Array|NodeList} targets
 * @param {Function} createAnimation
 * @param {number} staggerDelay
 * @param {string: 'start' | 'end' | 'center'} from
 */
export function stagger(targets, createAnimation, staggerDelay, from) {
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

        if (index > 0 && staggerDelay > 0) {
            containerSequence.add(anim, index * staggerDelay);
        } else {
            containerSequence.add(anim, 0);
        }
    });

    return containerSequence;
}

/**
 * @param {{}} config
 * @param {Element} config.element
 * @param {number} config.duration
 * @param {string} [config.easing='linear']
 * @param {string} [config.display='block']
 * @param {Function} [config.onStart=function()]
 * @returns {DomAnimation}
 */
export function fadeShow(config = {}) {
    const {onStart = () => {}} = config;

    return new DomAnimation(Object.assign({}, config, {
        keyframes: [
            { opacity: 0 },
            { opacity: 1 }
        ],
        autoplay: false,
        onStart: (anim) => {
            element.style.display = display;

            onStart(anim);
        }
    }));
}

/**
 * @param {{}} config
 * @param {Element} config.element
 * @param {number} config.duration
 * @param {string} [config.easing='linear']
 * @param {string} [config.display='block']
 * @param {Function} [config.onComplete=function()]
 * @returns {DomAnimation}
 */
export function fadeHide(config = {}) {
    const {onComplete = () => {}} = config;

    return new DomAnimation(Object.assign({}, config, {
        easing,
        keyframes: [
            { opacity: 1 },
            { opacity: 0 }
        ],
        autoplay: false,
        onComplete: (anim) => {
            if (anim.direction === 'normal') {
                element.style.display = 'none';
            }

            onComplete(anim);
        }
    }));
}

/**
 * @param {{}} config
 * @param {Element} config.element
 * @param {number} config.duration
 * @param {number} [config.opacity=1]
 * @param {string} [config.easing='linear']
 * @param {string} [config.display='block']
 * @param {Function} [config.onStart=function()]
 * @param {Function} [config.onComplete=function()]
 * @returns {DomAnimation}
 */
export function fadeTo(config = {}) {
    const {element, opacity = 1, display = 'block', onStart = () => {}, onComplete = () => {}} = config;
    const styles = getComputedStyle(element);
    const rawOpacity = parseFloat(styles.opacity);
    const currentOpacity = isNaN(rawOpacity) ? 1 : rawOpacity;

    return new DomAnimation(config, {
        keyframes: [
            { opacity: currentOpacity },
            { opacity: opacity }
        ],
        autoplay: false,
        onStart: () => {
            if (styles.display === 'none' && opacity > 0) {
                element.style.display = 'block';
            }

            onStart(anim);
        },
        onComplete: (anim) => {
            if (anim.direction === 'normal' && opacity <= 0) {
                element.style.display = 'none';
            }

            onComplete(anim);
        }
    });
}

/**
 * @param {{}} config
 * @param {Element} config.element
 * @param {number} config.duration
 * @param {string} [config.easing='linear']
 * @param {string} [config.display='block']
 * @param {Function} [config.onStart=function()]
 * @param {Function} [config.onComplete=function()]
 * @returns {DomAnimation}
 */
export function fadeToggle(config = {}) {
    const {element, display = 'block'} = config;
    const style = getComputedStyle(element);
    const isHidden = style.display === 'none' || parseFloat(style.opacity) === 0;

    if (element._currentAnimation) {
        element._currentAnimation.abort();
    }

    const animation = isHidden
        ? fadeShow(Object.assign({}, config))
        : fadeHide(Object.assign({}, config));

    element._currentAnimation = animation;

    return animation.resume().then((animInstance) => {
        if (element._currentAnimation === animation) {
            delete element._currentAnimation;
        }
        return animInstance;
    });
}

/**
 * @param {{}} config
 * @param {Element} config.element
 * @param {number} config.duration
 * @param {string} [config.easing='linear']
 * @param {string} [config.display='block']
 * @param {Function} [config.onStart=function()]
 * @param {Function} [config.onComplete=function()]
 * @returns {DomAnimation}
 */
export function slideShow(config = {}) {
    const {element, display = 'block', onStart = () => {}, onComplete = () => {}} = config;
    const styles = getComputedStyle(element);
    const targetHeight = getElementSizing(element).height;
    const paddingTop = parseFloat(styles.paddingTop) || 0;
    const paddingBottom = parseFloat(styles.paddingBottom) || 0;

    return new DomAnimation(Object.assign({}, config, {
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
        autoplay: false,
        onStart: (anim) => {
            element.style.display = display;
            onStart(anim);
        },
        onComplete: (anim) => {
            if (anim.direction === 'normal') {
                element.style.height = '';
                element.style.paddingTop = '';
                element.style.paddingBottom = '';
                element.style.overflow = '';
            }

            onComplete(anim);
        }
    }));
}

/**
 * @param {{}} config
 * @param {Element} config.element
 * @param {number} config.duration
 * @param {string} [config.easing='linear']
 * @param {string} [config.display='block']
 * @param {Function} [config.onComplete=function()]
 * @returns {DomAnimation}
 */
export function slideHide(config = {}) {
    const {element, onComplete = () => {}} = config;
    const styles = getComputedStyle(element);
    const currentHeight = element.getBoundingClientRect().height;
    const paddingTop = parseFloat(styles.paddingTop) || 0;
    const paddingBottom = parseFloat(styles.paddingBottom) || 0;

    return new DomAnimation(Object.assign({}, config,{
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
        autoplay: false,
        onComplete: (anim) => {
            if (anim.direction === 'normal') {
                element.style.display = 'none';
                element.style.height = '';
                element.style.paddingTop = '';
                element.style.paddingBottom = '';
                element.style.overflow = '';
            }

            onComplete(anim);
        }
    }));
}

/**
 * @param {{}} config
 * @param {Element} config.element
 * @param {number} config.duration
 * @param {string} [config.easing='linear']
 * @param {string} [config.display='block']
 * @param {Function} [config.onStart=function()]
 * @param {Function} [config.onComplete=function()]
 * @returns {DomAnimation}
 */
export function slideToggle(config = {}) {
    const {element, display = 'block'} = config;
    const style = getComputedStyle(element);
    const isHidden = style.display === 'none';

    if (element._currentAnimation) {
        element._currentAnimation.abort();
    }

    const animation = isHidden
        ? slideShow(Object.assign({}, config))
        : slideHide(Object.assign({}, config));

    element._currentAnimation = animation;

    return animation.resume().then((animInstance) => {
        if (element._currentAnimation === animation) {
            delete element._currentAnimation;
        }
        return animInstance;
    });
}

/**
 * @param {{}} config
 * @param {Element} config.element
 * @param {number} config.duration
 * @param {string} [config.easing='linear']
 * @param {string} [config.display='block']
 * @param {Function} [config.onStart=function()]
 * @returns {DomAnimation}
 */
export function scaleShow(config = {}) {
    const {onStart = () => {}} = config;

    return new DomAnimation(Object.assign({}, config,{
        keyframes: [
            { scale: '0', opacity: '0' },
            { scale: '1', opacity: '1' }
        ],
        autoplay: false,
        onStart: (anim) => {
            element.style.display = display;
            onStart(anim);
        }
    }));
}

/**
 * @param {{}} config
 * @param {Element} config.element
 * @param {number} config.duration
 * @param {string} [config.easing='linear']
 * @param {Function} [config.onComplete=function()]
 * @returns {DomAnimation}
 */
export function scaleHide(config = {}) {
    const {onComplete = () => {}} = config;

    return new DomAnimation(Object.assign({}, config, {
        keyframes: [
            { scale: '1', opacity: '1' },
            { scale: '0', opacity: '0' }
        ],
        autoplay: false,
        onComplete: (anim) => {
            if (anim.direction === 'normal') {
                element.style.display = 'none';
            }

            onComplete(anim);
        }
    }));
}

/**
 * @param {{}} config
 * @param {Element} config.element
 * @param {number} config.duration
 * @param {string} [config.easing='linear']
 * @param {string} [config.display='block']
 * @param {Function} [config.onStart=function()]
 * @param {Function} [config.onComplete=function()]
 * @returns {DomAnimation}
 */
export function scaleToggle(config = {}) {
    const {element, display = 'block'} = config;
    const style = getComputedStyle(element);
    const isHidden = style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';

    if (element._currentAnimation) {
        element._currentAnimation.abort();
    }

    const animation = isHidden
        ? scaleShow(Object.assign({}, config))
        : scaleHide(Object.assign({}, config));

    element._currentAnimation = animation;

    return animation.resume().then((animInstance) => {
        if (element._currentAnimation === animation) {
            delete element._currentAnimation;
        }
        return animInstance;
    });
}

/**
 * @param {Playble} playable
 * @param {Element} container
 * @return {(function(): void)|*}
 */
export function useScrollAnimation(playable, container = window) {
    playable.pause();

    const target = container ?? window;

    const updateScroll = () => {
        let scrollTop = 0;
        let scrollHeight = 0;

        if (target === window || target === document.documentElement || target === document.body) {
            scrollTop = window.scrollY || document.documentElement.scrollTop;
            scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        } else {
            scrollTop = target.scrollTop;
            scrollHeight = target.scrollHeight - target.clientHeight;
        }

        const progress = scrollHeight > 0
            ? Math.max(0, Math.min(1, scrollTop / scrollHeight))
            : 0;

        playable.to(progress * playable.duration);
    };

    target.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });

    updateScroll();

    return () => {
        target.removeEventListener('scroll', updateScroll);
        window.removeEventListener('resize', updateScroll);
    };
}

/**
 * @param {HTMLElement|Element|NodeList|Array} targets
 * @param {Playable|function} createAnimation
 * @param {{}} config
 * @param {number|number[]} [config.threshold=0.2]
 * @param {string} [config.rootMargin='0px']
 * @param {Element|null} [config.root=null]
 * @param {boolean} [config.once=true]
 * @param {boolean} [config.toggle=false]
 * @param {function(IntersectionObserverEntry, Playable): void} [config.onEnter]
 * @param {function(IntersectionObserverEntry, Playable): void} [config.onLeave]
 * @returns {function(): void}
 */
export function useViewIntersection(targets, createAnimation, config = {}) {
    let elements = [];

    if (targets instanceof NodeList || Array.isArray(targets)) {
        elements = Array.from(targets);
    } else if (targets instanceof HTMLElement || targets instanceof Element) {
        elements = [targets];
    }

    if (elements.length === 0) {
        return () => {};
    }

    if ( createAnimation instanceof Playable) {
        const playableItem = createAnimation;
        createAnimation = () => playableItem;
    }

    if (typeof createAnimation !== 'function') {
        throw new Error("Argument `createAnimation` must be a function returning a Playable instance.");
    }

    const {
        stagger = 0,
        threshold = 0.2,
        rootMargin = '0px',
        root = null,
        once = true,
        toggle = false,
        onEnter = null,
        onLeave = null
    } = config;

    const containerSequence = new Sequence();

    elements.forEach((element, index) => {
        const playable = createAnimation(element, index);

        if (!(playable instanceof Playable)) {
            throw new Error(`The callback 'createAnimation' must return an instance of Playable for element at index ${index}.`);
        }

        containerSequence.add(playable, index * stagger);
    });

    containerSequence.pause();

    const visibleElements = new Set();
    const visitedElements = new Set();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const target = entry.target;

            if (entry.isIntersecting) {
                visibleElements.add(target);
                visitedElements.add(target);

                if (toggle) {
                    containerSequence.reverse('normal').resume();
                } else {
                    containerSequence.resume();
                }

                if (typeof onEnter === 'function') {
                    onEnter(entry, containerSequence);
                }

                if (once && !toggle) {
                    observer.unobserve(target);

                    if (visitedElements.size === elements.length) {
                        observer.disconnect();
                    }
                }
            } else {
                visibleElements.delete(target);

                if (toggle) {
                    if (visibleElements.size === 0) {
                        containerSequence.reverse('reverse').resume();
                    }
                }

                if (typeof onLeave === 'function') {
                    onLeave(entry, containerSequence);
                }
            }
        });
    }, {
        root,
        rootMargin,
        threshold
    });

    elements.forEach(el => observer.observe(el));

    return () => {
        elements.forEach(el => observer.unobserve(el));
        observer.disconnect();
    };
}