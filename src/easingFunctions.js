//https://spicyyoghurt.com/tools/easing-functions

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeLinear(t, b, c, d) {
    return c * t / d + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInQuad(t, b, c, d) {
    return c * (t /= d) * t + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeOutQuad(t, b, c, d) {
    return -c * (t /= d) * (t - 2) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInOutQuad(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
    return -c / 2 * ((--t) * (t - 2) - 1) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInSine(t, b, c, d) {
    return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeOutSine(t, b, c, d) {
    return c * Math.sin(t / d * (Math.PI / 2)) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInOutSine(t, b, c, d) {
    return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInExpo(t, b, c, d) {
    return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeOutExpo(t, b, c, d) {
    return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInOutExpo(t, b, c, d) {
    if (t === 0) return b;
    if (t === d) return b + c;
    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInCirc(t, b, c, d) {
    return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeOutCirc(t, b, c, d) {
    return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInOutCirc(t, b, c, d) {
    if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
    return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInCubic(t, b, c, d) {
    return c * (t /= d) * t * t + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeOutCubic(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t + 1) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInOutCubic(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t + 2) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInQuart(t, b, c, d) {
    return c * (t /= d) * t * t * t + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeOutQuart(t, b, c, d) {
    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInOutQuart(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
    return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInQuint(t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeOutQuint(t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInOutQuint(t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInElastic(t, b, c, d) {
    let s = 1.70158;
    let p = 0;
    let a = c;
    if (t === 0) return b;
    if ((t /= d) === 1) return b + c;
    if (!p) p = d * .3;
    if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
    }
    else s = p / (2 * Math.PI) * Math.asin(c / a);
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeOutElastic(t, b, c, d) {
    let s = 1.70158;
    let p = 0;
    let a = c;
    if (t === 0) return b;
    if ((t /= d) === 1) return b + c;
    if (!p) p = d * .3;
    if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
    }
    else s = p / (2 * Math.PI) * Math.asin(c / a);
    return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInOutElastic(t, b, c, d) {
    let s = 1.70158;
    let p = 0;
    let a = c;
    if (t === 0) return b;
    if ((t /= d / 2) === 2) return b + c;
    if (!p) p = d * (.3 * 1.5);
    if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
    }
    else s = p / (2 * Math.PI) * Math.asin(c / a);
    if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInBack(t, b, c, d) {
    const s = 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeOutBack(t, b, c, d) {
    const s = 1.70158;
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
}

/**
 * @param t {Number}
 * @param b {Number}
 * @param c {Number}
 * @param d {Number}
 * @returns {*}
 */
export function easeInOutBack(t, b, c, d) {
    let s = 1.70158;
    if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
    return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
}

/**
 * @type {{easeLinear: function(*, *, *, *): *, easeInQuad: function(*, *, *, *): *, easeOutQuad: function(*, *, *, *): *, easeInOutQuad: (function(*, *, *, *): *)|*, easeInSine: function(*, *, *, *): *, easeOutSine: function(*, *, *, *): *, easeInOutSine: function(*, *, *, *): *, easeInExpo: function(*, *, *, *): *, easeOutExpo: function(*, *, *, *): *, easeInOutExpo: (function(*, *, *, *): *)|*, easeInCirc: function(*, *, *, *): *, easeOutCirc: function(*, *, *, *): *, easeInOutCirc: (function(*, *, *, *): *)|*, easeInCubic: function(*, *, *, *): *, easeOutCubic: function(*, *, *, *): *, easeInOutCubic: (function(*, *, *, *): *)|*, easeInQuart: function(*, *, *, *): *, easeOutQuart: function(*, *, *, *): *, easeInOutQuart: (function(*, *, *, *): *)|*, easeInQuint: function(*, *, *, *): *, easeOutQuint: function(*, *, *, *): *, easeInElastic: (function(*, *, *, *): *)|*, easeInOutQuint: (function(*, *, *, *): *)|*, easeOutElastic: (function(*, *, *, *): *)|*, easeInOutElastic: (function(*, *, *, *): *)|*, easeInBack: function(*, *, *, *): *, easeOutBack: function(*, *, *, *): *, easeInOutBack: (function(*, *, *, *): *)|*}}
 */
export const functions = {
    easeLinear,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
    easeInSine,
    easeOutSine,
    easeInOutSine,
    easeInExpo,
    easeOutExpo,
    easeInOutExpo,
    easeInCirc,
    easeOutCirc,
    easeInOutCirc,
    easeInCubic,
    easeOutCubic,
    easeInOutCubic,
    easeInQuart,
    easeOutQuart,
    easeInOutQuart,
    easeInQuint,
    easeOutQuint,
    easeInElastic,
    easeInOutQuint,
    easeOutElastic,
    easeInOutElastic,
    easeInBack,
    easeOutBack,
    easeInOutBack,
};