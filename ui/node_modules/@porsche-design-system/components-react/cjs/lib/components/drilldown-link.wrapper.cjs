"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var hooks = require('../../hooks.cjs');
var utils = require('../../utils.cjs');

const PDrilldownLink = /*#__PURE__*/ react.forwardRef(({ active = false, aria, download, href, rel, target = '_self', className, ...rest }, ref) => {
    const elementRef = react.useRef(undefined);
    const WebComponentTag = hooks.usePrefix('p-drilldown-link');
    const propsToSync = [active, aria, download, href, rel, target];
    hooks.useBrowserLayoutEffect(() => {
        const { current } = elementRef;
        ['active', 'aria', 'download', 'href', 'rel', 'target'].forEach((propName, i) => (current[propName] = propsToSync[i]));
    }, propsToSync);
    const props = {
        ...rest,
        class: hooks.useMergedClass(elementRef, className),
        ref: utils.syncRef(elementRef, ref)
    };
    // @ts-ignore
    return jsxRuntime.jsx(WebComponentTag, { ...props });
});

exports.PDrilldownLink = PDrilldownLink;
