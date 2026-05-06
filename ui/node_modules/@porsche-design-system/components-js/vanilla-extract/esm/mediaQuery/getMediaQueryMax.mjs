import { breakpoint } from './breakpoint.mjs';

function getMediaQueryMax(max) {
    return `(max-width:${breakpoint[max] - 1}px)`;
}

export { getMediaQueryMax };
