import { fontSizeTextLarge } from './fontSizeTextLarge.mjs';
import { fontSizeTextMedium } from './fontSizeTextMedium.mjs';
import { fontSizeTextSmall } from './fontSizeTextSmall.mjs';
import { fontSizeTextXLarge } from './fontSizeTextXLarge.mjs';
import { fontSizeTextXSmall } from './fontSizeTextXSmall.mjs';
import { fontSizeTextXXSmall } from './fontSizeTextXXSmall.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use typescale variables instead. */
const fontSizeText = {
    xxSmall: fontSizeTextXXSmall,
    xSmall: fontSizeTextXSmall,
    small: fontSizeTextSmall,
    medium: fontSizeTextMedium,
    large: fontSizeTextLarge,
    xLarge: fontSizeTextXLarge,
};

export { fontSizeText };
