'use strict';

var radiusSm = require('../border/radiusSm.cjs');
var colorFrosted = require('../color/light-dark/colorFrosted.cjs');
var colorFrostedStrong = require('../color/light-dark/colorFrostedStrong.cjs');
var durationXl = require('../motion/durationXl.cjs');
var easeInOut = require('../motion/easeInOut.cjs');

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
        borderRadius: radiusSm.radiusSm,
        background: `transparent linear-gradient(to right, ${colorFrosted.colorFrosted} 0%, ${colorFrostedStrong.colorFrostedStrong} 50%, ${colorFrosted.colorFrosted} 100%) 0 0 / 200% 100%`,
        animation: `${animationName} ${durationXl.durationXl} ${easeInOut.easeInOut} infinite`,
    };
};

exports.getSkeletonStyle = getSkeletonStyle;
exports.skeletonKeyframes = skeletonKeyframes;
