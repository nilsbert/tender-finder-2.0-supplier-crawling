import { radiusSm } from '../border/radiusSm.mjs';
import { colorFrosted } from '../color/light-dark/colorFrosted.mjs';
import { colorFrostedStrong } from '../color/light-dark/colorFrostedStrong.mjs';
import { durationXl } from '../motion/durationXl.mjs';
import { easeInOut } from '../motion/easeInOut.mjs';

/**
 * Applies skeleton loading styles with a background animation.
 * Uses the CSS `light-dark()` color function for automatic theme adaptation.
 */
const getSkeletonStyle = () => {
    return {
        '@keyframes skeleton': {
            from: { backgroundPositionX: '100%' },
            to: { backgroundPositionX: '-100%' },
        },
        display: 'block',
        borderRadius: radiusSm,
        background: `transparent linear-gradient(to right, ${colorFrosted} 0%, ${colorFrostedStrong} 50%, ${colorFrosted} 100%) 0 0 / 200% 100%`,
        animation: `skeleton ${durationXl} ${easeInOut} infinite`,
    };
};

export { getSkeletonStyle };
