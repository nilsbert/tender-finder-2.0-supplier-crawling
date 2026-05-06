import { borderRadiusSmall } from './borderRadiusSmall.mjs';
import { borderRadiusMedium } from './borderRadiusMedium.mjs';
import { borderRadiusLarge } from './borderRadiusLarge.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use variables directly instead. */
const borderRadius = {
    small: borderRadiusSmall,
    medium: borderRadiusMedium,
    large: borderRadiusLarge,
};

export { borderRadius };
