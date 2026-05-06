import { typescale5Xl } from '../../../font/typescale5Xl.mjs';
import { _displayFontPartA, _displayFontPartB } from './displayShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeading5XlStyle instead. */
const displayLargeStyle = {
    font: `${_displayFontPartA}${typescale5Xl}${_displayFontPartB}`,
};

export { displayLargeStyle };
