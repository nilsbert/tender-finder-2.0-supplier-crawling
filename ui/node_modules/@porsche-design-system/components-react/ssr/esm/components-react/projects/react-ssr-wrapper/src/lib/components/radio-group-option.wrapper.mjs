"use client";
import { jsx } from 'react/jsx-runtime';
import { forwardRef, useRef } from 'react';
import { usePrefix, useBrowserLayoutEffect, useMergedClass } from '../../hooks.mjs';
import { syncRef } from '../../utils.mjs';
import { DSRRadioGroupOption } from '../dsr-components/radio-group-option.mjs';

const PRadioGroupOption = /*#__PURE__*/ forwardRef(({ disabled = false, label, loading = false, value, className, children, ...rest }, ref) => {
    const elementRef = useRef(undefined);
    const WebComponentTag = usePrefix('p-radio-group-option');
    const propsToSync = [disabled, label, loading, value];
    useBrowserLayoutEffect(() => {
        const { current } = elementRef;
        ['disabled', 'label', 'loading', 'value'].forEach((propName, i) => (current[propName] = propsToSync[i]));
    }, propsToSync);
    const props = {
        ...rest,
        // @ts-ignore
        ...(!process.browser
            ? {
                children: (jsx(DSRRadioGroupOption, { disabled, label, loading, value, children })),
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

export { PRadioGroupOption };
