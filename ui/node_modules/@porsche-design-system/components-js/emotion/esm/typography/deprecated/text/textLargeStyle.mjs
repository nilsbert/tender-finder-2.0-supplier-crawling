import { fontSizeTextLarge } from '../../../font/deprecated/fontSizeTextLarge.mjs';
import { _textFontPartA, _textFontPartB } from './textShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseTextLg instead. */
const textLargeStyle = {
    font: `${_textFontPartA}${fontSizeTextLarge}${_textFontPartB}`,
};

export { textLargeStyle };
