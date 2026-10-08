import {animate, fadeHide, fadeShow, sequence, wait} from "../src";
import {easeLinear} from "../src/easing";

const lines = document.querySelector('.bg-lines');

const test = sequence( [
    fadeShow( lines, 1000, easeLinear ),
    animate( {
        from: 100,
        to: 0,
        duration: 750,
        easing: easeLinear,
        update: value => lines.style.bottom = (value < 0 ? 0 : value) + "%",
    } ),
    wait( 3000 ),
    fadeHide( lines, 1000, easeLinear ),
] );

animate( {
    from: 0,
    to: 100,
    duration: 750,
    easing: easeLinear,
    update: value => () => {
        lines.style.top = (value < 0 ? 0 : value) + "%"

        return () => {

        }
    },
} );

test.start();

test.pause();

test.rewind();

