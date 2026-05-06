import { colorFocus } from '../color/light-dark/colorFocus.mjs';

const getFocusVisibleStyle = (opts) => {
    const { offset = '2px' } = opts || {};
    return {
        selectors: {
            '&:focus-visible': {
                outline: `2px solid ${colorFocus}`,
                outlineOffset: offset,
            },
        },
    };
};

export { getFocusVisibleStyle };
