import { typescale4Xl } from '../../../font/typescale4Xl.mjs';
import { _displayFontPartA, _displayFontPartB } from './displayShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeading4XlStyle instead. */
const displayMediumStyle = {
    font: `${_displayFontPartA}${typescale4Xl}${_displayFontPartB}`,
};

export { displayMediumStyle };
