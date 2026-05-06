"use client";
import { jsx } from 'react/jsx-runtime';
import { forwardRef, useRef } from 'react';
import { usePrefix, useBrowserLayoutEffect, useMergedClass } from '../../hooks.mjs';
import { syncRef } from '../../utils.mjs';
import { DSRDrilldownLink } from '../dsr-components/drilldown-link.mjs';

const PDrilldownLink = /*#__PURE__*/ forwardRef(({ active = false, aria, download, href, rel, target = '_self', className, children, ...rest }, ref) => {
    const elementRef = useRef(undefined);
    const WebComponentTag = usePrefix('p-drilldown-link');
    const propsToSync = [active, aria, download, href, rel, target];
    useBrowserLayoutEffect(() => {
        const { current } = elementRef;
        ['active', 'aria', 'download', 'href', 'rel', 'target'].forEach((propName, i) => (current[propName] = propsToSync[i]));
    }, propsToSync);
    const props = {
        ...rest,
        // @ts-ignore
        ...(!process.browser
            ? {
                children: (jsx(DSRDrilldownLink, { active, aria, download, href, rel, target, children })),
            }
            : {
                children,
                suppressHydrationWarning: true,
            }),
        'data-ssr': '',
        class: useMergedClass(elementRef, className),
        ref: syncRef(elementRef, ref)
    };
    // @ts-ignore
    return jsx(WebComponentTag, { ...props });
});

export { PDrilldownLink };
