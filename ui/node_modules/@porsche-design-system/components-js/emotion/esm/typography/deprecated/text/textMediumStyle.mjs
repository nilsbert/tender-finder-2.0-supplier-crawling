import { fontSizeTextMedium } from '../../../font/deprecated/fontSizeTextMedium.mjs';
import { _textFontPartA, _textFontPartB } from './textShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseTextMd instead. */
const textMediumStyle = {
    font: `${_textFontPartA}${fontSizeTextMedium}${_textFontPartB}`,
};

export { textMediumStyle };
