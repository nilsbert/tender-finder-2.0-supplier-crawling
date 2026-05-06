import { fontSizeHeadingSmall } from '../../../font/deprecated/fontSizeHeadingSmall.mjs';
import { _headingFontPartA, _headingFontPartB } from './headingShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeadingSm instead. */
const headingSmallStyle = {
    font: `${_headingFontPartA}${fontSizeHeadingSmall}${_headingFontPartB}`,
};

export { headingSmallStyle };
