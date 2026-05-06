type Offset = 'small' | 'none';
type BorderRadius = 'small' | 'medium';
export type Options = {
    offset?: Offset | string;
    borderRadius?: BorderRadius | string;
};
export declare const getFocusStyle: (opts?: Options) => {
    readonly selectors: {
        readonly '&:focus': {
            readonly outline: "2px solid #1A44EA";
            readonly outlineOffset: string | 0;
        };
        readonly '&:focus:not(:focus-visible)': {
            readonly outlineColor: "transparent";
        };
    };
    readonly borderRadius: string;
};
export {};
