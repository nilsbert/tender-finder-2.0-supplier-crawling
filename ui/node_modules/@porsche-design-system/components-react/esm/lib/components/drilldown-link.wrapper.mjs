"use client";
import { jsx } from 'react/jsx-runtime';
import { forwardRef, useRef } from 'react';
import { usePrefix, useBrowserLayoutEffect, useMergedClass } from '../../hooks.mjs';
import { syncRef } from '../../utils.mjs';

const PDrilldownLink = /*#__PURE__*/ forwardRef(({ active = false, aria, download, href, rel, target = '_self', className, ...rest }, ref) => {
    const elementRef = useRef(undefined);
    const WebComponentTag = usePrefix('p-drilldown-link');
    const propsToSync = [active, aria, download, href, rel, target];
    useBrowserLayoutEffect(() => {
        const { current } = elementRef;
        ['active', 'aria', 'download', 'href', 'rel', 'target'].forEach((propName, i) => (current[propName] = propsToSync[i]));
    }, propsToSync);
    const props = {
        ...rest,
        class: useMergedClass(elementRef, className),
        ref: syncRef(elementRef, ref)
    };
    // @ts-ignore
    return jsx(WebComponentTag, { ...props });
});

export { PDrilldownLink };
