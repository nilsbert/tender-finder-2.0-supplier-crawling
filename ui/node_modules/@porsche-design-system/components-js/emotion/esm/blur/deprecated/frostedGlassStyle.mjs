import { blurFrosted } from '../../tokens/dist/esm/blur/blurFrosted.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use backdropFilter: blurFrosted instead  */
const frostedGlassStyle = {
    WebkitBackdropFilter: blurFrosted,
    backdropFilter: blurFrosted,
};

export { frostedGlassStyle };
