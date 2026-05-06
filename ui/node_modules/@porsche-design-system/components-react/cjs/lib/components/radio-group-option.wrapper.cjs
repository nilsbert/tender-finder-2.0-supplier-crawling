"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var hooks = require('../../hooks.cjs');
var utils = require('../../utils.cjs');

const PRadioGroupOption = /*#__PURE__*/ react.forwardRef(({ disabled = false, label, loading = false, value, className, ...rest }, ref) => {
    const elementRef = react.useRef(undefined);
    const WebComponentTag = hooks.usePrefix('p-radio-group-option');
    const propsToSync = [disabled, label, loading, value];
    hooks.useBrowserLayoutEffect(() => {
        const { current } = elementRef;
        ['disabled', 'label', 'loading', 'value'].forEach((propName, i) => (current[propName] = propsToSync[i]));
    }, propsToSync);
    const props = {
        ...rest,
        class: hooks.useMergedClass(elementRef, className),
        ref: utils.syncRef(elementRef, ref)
    };
    // @ts-ignore
    return jsxRuntime.jsx(WebComponentTag, { ...props });
});

exports.PRadioGroupOption = PRadioGroupOption;
