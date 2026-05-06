import { fontSizeTextXLarge } from '../../../font/deprecated/fontSizeTextXLarge.mjs';
import { _textFontPartA, _textFontPartB } from './textShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseTextXl instead. */
const textXLargeStyle = {
    font: `${_textFontPartA}${fontSizeTextXLarge}${_textFontPartB}`,
};

export { textXLargeStyle };
