import { breakpoint } from './breakpoint.mjs';

function getMediaQueryMin(min) {
    return `(min-width:${breakpoint[min]}px)`;
}

export { getMediaQueryMin };
