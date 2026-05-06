import { fontSizeHeadingXLarge } from '../../../font/deprecated/fontSizeHeadingXLarge.mjs';
import { _headingFontPartA, _headingFontPartB } from './headingShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeadingXl instead. */
const headingXLargeStyle = {
    font: `${_headingFontPartA}${fontSizeHeadingXLarge}${_headingFontPartB}`,
};

export { headingXLargeStyle };
