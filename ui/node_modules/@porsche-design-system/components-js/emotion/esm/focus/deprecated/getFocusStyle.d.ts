type Offset = 'small' | 'none';
type BorderRadius = 'small' | 'medium';
export type Options = {
    offset?: Offset | string;
    borderRadius?: BorderRadius | string;
};
/** @deprecated since v4.0.0, will be removed with next major release. Use getFocusVisibleStyle instead. */
export declare const getFocusStyle: (opts?: Options) => {
    readonly '&:focus': {
        readonly outline: "2px solid #1A44EA";
        readonly outlineOffset: string | 0;
    };
    readonly '&:focus:not(:focus-visible)': {
        readonly outlineColor: "transparent";
    };
    readonly borderRadius: string;
};
export {};
