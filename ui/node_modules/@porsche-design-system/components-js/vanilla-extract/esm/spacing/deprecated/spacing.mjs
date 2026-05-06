import { spacingFluid } from './spacingFluid.mjs';
import { spacingStatic } from './spacingStatic.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use spacing variables directly instead. */
const spacing = {
    static: spacingStatic,
    fluid: spacingFluid,
};

export { spacing };
