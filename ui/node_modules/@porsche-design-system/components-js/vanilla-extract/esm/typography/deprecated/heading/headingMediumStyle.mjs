import { fontSizeHeadingMedium } from '../../../font/deprecated/fontSizeHeadingMedium.mjs';
import { _headingFontPartA, _headingFontPartB } from './headingShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeadingMd instead. */
const headingMediumStyle = {
    font: `${_headingFontPartA}${fontSizeHeadingMedium}${_headingFontPartB}`,
};

export { headingMediumStyle };
