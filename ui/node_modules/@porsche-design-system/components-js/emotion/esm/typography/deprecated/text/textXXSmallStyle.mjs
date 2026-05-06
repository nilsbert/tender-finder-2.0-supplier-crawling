import { fontSizeTextXXSmall } from '../../../font/deprecated/fontSizeTextXXSmall.mjs';
import { _textFontPartA, _textFontPartB } from './textShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseText2Xs instead. */
const textXXSmallStyle = {
    font: `${_textFontPartA}${fontSizeTextXXSmall}${_textFontPartB}`,
};

export { textXXSmallStyle };
