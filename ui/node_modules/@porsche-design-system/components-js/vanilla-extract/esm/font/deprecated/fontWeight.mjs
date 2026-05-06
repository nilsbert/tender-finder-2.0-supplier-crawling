import { fontWeightRegular } from './fontWeightRegular.mjs';
import { fontWeightSemiBold } from './fontWeightSemiBold.mjs';
import { fontWeightBold } from '../fontWeightBold.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use variables directly instead. */
const fontWeight = {
    regular: fontWeightRegular,
    semiBold: fontWeightSemiBold,
    bold: fontWeightBold,
};

export { fontWeight };
