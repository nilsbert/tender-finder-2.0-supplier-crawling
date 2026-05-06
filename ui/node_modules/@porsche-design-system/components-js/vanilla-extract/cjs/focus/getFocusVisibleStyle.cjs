'use strict';

var colorFocus = require('../color/light-dark/colorFocus.cjs');

const getFocusVisibleStyle = (opts) => {
    const { offset = '2px' } = opts || {};
    return {
        selectors: {
            '&:focus-visible': {
                outline: `2px solid ${colorFocus.colorFocus}`,
                outlineOffset: offset,
            },
        },
    };
};

exports.getFocusVisibleStyle = getFocusVisibleStyle;
