import { fontStyleNormal } from './fontStyleNormal.mjs';
import { fontStyleItalic } from './fontStyleItalic.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use 'normal' | 'italic' instead. */
const fontStyle = {
    normal: fontStyleNormal,
    italic: fontStyleItalic,
};

export { fontStyle };
