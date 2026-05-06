import { gradientStopsFadeDark } from '../../tokens/dist/esm/gradient/gradientStopsFadeDark.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use background: `linear-gradient(to left, ${gradientStopsFadeDark});` instead  */
const gradientToLeftStyle = {
    background: `linear-gradient(to left, ${gradientStopsFadeDark});`,
};

export { gradientToLeftStyle };
