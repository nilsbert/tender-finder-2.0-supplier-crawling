import { fontFamily } from '../../../font/deprecated/fontFamily.mjs';
import { fontLineHeight } from '../../../font/deprecated/fontLineHeight.mjs';
import { fontStyleNormal } from '../../../font/deprecated/fontStyleNormal.mjs';
import { fontVariant } from '../../../font/deprecated/fontVariant.mjs';
import { fontWeightRegular } from '../../../font/deprecated/fontWeightRegular.mjs';

const _displayFontPartA = `${fontStyleNormal} ${fontVariant} ${fontWeightRegular} `;
const _displayFontPartB = `/${fontLineHeight} ${fontFamily}`;

export { _displayFontPartA, _displayFontPartB };
