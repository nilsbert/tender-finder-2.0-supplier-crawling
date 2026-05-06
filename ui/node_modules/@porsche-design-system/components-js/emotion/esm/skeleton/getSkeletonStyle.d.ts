/**
 * Applies skeleton loading styles with a background animation.
 * Uses the CSS `light-dark()` color function for automatic theme adaptation.
 */
export declare const getSkeletonStyle: () => {
    readonly '@keyframes skeleton': {
        readonly from: {
            readonly backgroundPositionX: "100%";
        };
        readonly to: {
            readonly backgroundPositionX: "-100%";
        };
    };
    readonly display: "block";
    readonly borderRadius: "4px";
    readonly background: `transparent linear-gradient(to right, ${string} 0%, ${string} 50%, ${string} 100%) 0 0 / 200% 100%`;
    readonly animation: "skeleton 1.2s cubic-bezier(.25,.1,.25,1) infinite";
};
