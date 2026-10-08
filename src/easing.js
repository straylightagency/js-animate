import {functions} from "./easing/index.js";

/**
 * @param easing
 * @returns {*|(function(*, *, *, *): *)}
 */
export function getEasingFunction(easing) {
    if ( typeof easing === "function" ) {
        return easing;
    }

    return functions[ easing ] ? functions[ easing ] : functions[ 'easeLinear' ];
}
