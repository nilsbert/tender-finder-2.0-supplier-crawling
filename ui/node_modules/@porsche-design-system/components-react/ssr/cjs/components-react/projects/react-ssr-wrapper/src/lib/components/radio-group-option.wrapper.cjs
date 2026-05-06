"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var hooks = require('../../hooks.cjs');
var utils = require('../../utils.cjs');
var radioGroupOption = require('../dsr-components/radio-group-option.cjs');

const PRadioGroupOption = /*#__PURE__*/ react.forwardRef(({ disabled = false, label, loading = false, value, className, children, ...rest }, ref) => {
    const elementRef = react.useRef(undefined);
    const WebComponentTag = hooks.usePrefix('p-radio-group-option');
    const propsToSync = [disabled, label, loading, value];
    hooks.useBrowserLayoutEffect(() => {
        const { current } = elementRef;
        ['disabled', 'label', 'loading', 'value'].forEach((propName, i) => (current[propName] = propsToSync[i]));
    }, propsToSync);
    const props = {
        ...rest,
        // @ts-ignore
        ...(!process.browser
            ? {
                children: (jsxRuntime.jsx(radioGroupOption.DSRRadioGroupOption, { disabled, label, loading, value, children })),
            }
            : {
                children,
                suppressHydrationWarning: true,
            }),
        'data-ssr': '',
        class: hooks.useMergedClass(elementRef, className),
        ref: utils.syncRef(elementRef, ref)
    };
    // @ts-ignore
    return jsxRuntime.jsx(WebComponentTag, { ...props });
});

exports.PRadioGroupOption = PRadioGroupOption;
