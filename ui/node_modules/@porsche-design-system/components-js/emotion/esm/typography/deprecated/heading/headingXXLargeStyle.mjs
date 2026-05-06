import { fontSizeHeadingXXLarge } from '../../../font/deprecated/fontSizeHeadingXXLarge.mjs';
import { _headingFontPartA, _headingFontPartB } from './headingShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeading2Xl instead. */
const headingXXLargeStyle = {
    font: `${_headingFontPartA}${fontSizeHeadingXXLarge}${_headingFontPartB}`,
};

export { headingXXLargeStyle };
