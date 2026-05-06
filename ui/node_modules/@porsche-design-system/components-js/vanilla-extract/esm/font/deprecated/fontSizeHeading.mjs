import { fontSizeHeadingLarge } from './fontSizeHeadingLarge.mjs';
import { fontSizeHeadingMedium } from './fontSizeHeadingMedium.mjs';
import { fontSizeHeadingSmall } from './fontSizeHeadingSmall.mjs';
import { fontSizeHeadingXLarge } from './fontSizeHeadingXLarge.mjs';
import { fontSizeHeadingXXLarge } from './fontSizeHeadingXXLarge.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use typescale variables instead. */
const fontSizeHeading = {
    small: fontSizeHeadingSmall,
    medium: fontSizeHeadingMedium,
    large: fontSizeHeadingLarge,
    xLarge: fontSizeHeadingXLarge,
    xxLarge: fontSizeHeadingXXLarge,
};

export { fontSizeHeading };
