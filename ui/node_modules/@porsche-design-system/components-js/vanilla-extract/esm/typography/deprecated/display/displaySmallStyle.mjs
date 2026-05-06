import { typescale3Xl } from '../../../font/typescale3Xl.mjs';
import { _displayFontPartA, _displayFontPartB } from './displayShared.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use proseHeading3XlStyle instead. */
const displaySmallStyle = {
    font: `${_displayFontPartA}${typescale3Xl}${_displayFontPartB}`,
};

export { displaySmallStyle };
