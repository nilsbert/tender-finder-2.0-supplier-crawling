import { breakpointBase } from './breakpointBase.mjs';
import { breakpointL } from './breakpointL.mjs';
import { breakpointM } from './breakpointM.mjs';
import { breakpointS } from './breakpointS.mjs';
import { breakpointXL } from './breakpointXL.mjs';
import { breakpointXS } from './breakpointXS.mjs';
import { breakpointXXL } from './breakpointXXL.mjs';

const breakpoint = {
    base: breakpointBase,
    xs: breakpointXS,
    s: breakpointS,
    m: breakpointM,
    l: breakpointL,
    xl: breakpointXL,
    xxl: breakpointXXL,
};

export { breakpoint };
