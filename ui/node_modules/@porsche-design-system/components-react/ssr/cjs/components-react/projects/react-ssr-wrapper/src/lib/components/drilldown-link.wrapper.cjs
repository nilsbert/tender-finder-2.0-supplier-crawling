"use client";
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var hooks = require('../../hooks.cjs');
var utils = require('../../utils.cjs');
var drilldownLink = require('../dsr-components/drilldown-link.cjs');

const PDrilldownLink = /*#__PURE__*/ react.forwardRef(({ active = false, aria, download, href, rel, target = '_self', className, children, ...rest }, ref) => {
    const elementRef = react.useRef(undefined);
    const WebComponentTag = hooks.usePrefix('p-drilldown-link');
    const propsToSync = [active, aria, download, href, rel, target];
    hooks.useBrowserLayoutEffect(() => {
        const { current } = elementRef;
        ['active', 'aria', 'download', 'href', 'rel', 'target'].forEach((propName, i) => (current[propName] = propsToSync[i]));
    }, propsToSync);
    const props = {
        ...rest,
        // @ts-ignore
        ...(!process.browser
            ? {
                children: (jsxRuntime.jsx(drilldownLink.DSRDrilldownLink, { active, aria, download, href, rel, target, children })),
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

exports.PDrilldownLink = PDrilldownLink;
