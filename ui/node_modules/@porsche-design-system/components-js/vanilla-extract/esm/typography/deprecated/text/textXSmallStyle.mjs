import { fontSizeTextXSmall } from '../../../font/deprecated/fontSizeTextXSmall.mjs';
import { _textFontPartA, _textFontPartB } from './textShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseTextXs instead. */
const textXSmallStyle = {
    font: `${_textFontPartA}${fontSizeTextXSmall}${_textFontPartB}`,
};

export { textXSmallStyle };
