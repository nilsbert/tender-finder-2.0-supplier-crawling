import { fontSizeTextSmall } from '../../../font/deprecated/fontSizeTextSmall.mjs';
import { _textFontPartA, _textFontPartB } from './textShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseTextSm instead. */
const textSmallStyle = {
    font: `${_textFontPartA}${fontSizeTextSmall}${_textFontPartB}`,
};

export { textSmallStyle };
