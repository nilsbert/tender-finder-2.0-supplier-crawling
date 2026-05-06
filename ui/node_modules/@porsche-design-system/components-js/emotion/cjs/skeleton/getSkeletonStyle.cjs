'use strict';

var radiusSm = require('../border/radiusSm.cjs');
var colorFrosted = require('../color/light-dark/colorFrosted.cjs');
var colorFrostedStrong = require('../color/light-dark/colorFrostedStrong.cjs');
var durationXl = require('../motion/durationXl.cjs');
var easeInOut = require('../motion/easeInOut.cjs');

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
        borderRadius: radiusSm.radiusSm,
        background: `transparent linear-gradient(to right, ${colorFrosted.colorFrosted} 0%, ${colorFrostedStrong.colorFrostedStrong} 50%, ${colorFrosted.colorFrosted} 100%) 0 0 / 200% 100%`,
        animation: `skeleton ${durationXl.durationXl} ${easeInOut.easeInOut} infinite`,
    };
};

exports.getSkeletonStyle = getSkeletonStyle;
