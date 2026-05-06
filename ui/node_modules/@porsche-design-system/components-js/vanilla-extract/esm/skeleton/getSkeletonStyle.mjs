import { radiusSm } from '../border/radiusSm.mjs';
import { colorFrosted } from '../color/light-dark/colorFrosted.mjs';
import { colorFrostedStrong } from '../color/light-dark/colorFrostedStrong.mjs';
import { durationXl } from '../motion/durationXl.mjs';
import { easeInOut } from '../motion/easeInOut.mjs';

/**
 * Keyframes for the skeleton loading animation.
 * Animates the background position from right to left to create a shimmer effect.
 */
const skeletonKeyframes = {
    from: { backgroundPositionX: '100%' },
    to: { backgroundPositionX: '-100%' },
};
/**
 * Applies skeleton loading styles with a background animation.
 * Uses the CSS `light-dark()` color function for automatic theme adaptation.
 *
 * @param animationName - The name of the animation, which must be the generated name from `vanilla-extract`.
 * This should be the return value of the `keyframes` function.
 */
const getSkeletonStyle = (animationName) => {
    return {
        display: 'block',
        borderRadius: radiusSm,
        background: `transparent linear-gradient(to right, ${colorFrosted} 0%, ${colorFrostedStrong} 50%, ${colorFrosted} 100%) 0 0 / 200% 100%`,
        animation: `${animationName} ${durationXl} ${easeInOut} infinite`,
    };
};

export { getSkeletonStyle, skeletonKeyframes };
