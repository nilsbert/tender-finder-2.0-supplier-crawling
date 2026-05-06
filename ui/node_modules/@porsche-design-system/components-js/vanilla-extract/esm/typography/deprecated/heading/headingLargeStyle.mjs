import { fontSizeHeadingLarge } from '../../../font/deprecated/fontSizeHeadingLarge.mjs';
import { _headingFontPartA, _headingFontPartB } from './headingShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeadingLg instead. */
const headingLargeStyle = {
    font: `${_headingFontPartA}${fontSizeHeadingLarge}${_headingFontPartB}`,
};

export { headingLargeStyle };
