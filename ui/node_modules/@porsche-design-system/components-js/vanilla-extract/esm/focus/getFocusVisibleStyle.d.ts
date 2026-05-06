export type Options = {
    offset?: string;
};
export declare const getFocusVisibleStyle: (opts?: Options) => {
    readonly selectors: {
        readonly '&:focus-visible': {
            readonly outline: "2px solid var(--_color-focus, light-dark(#1A44EA,#1A44EA))";
            readonly outlineOffset: string;
        };
    };
};
