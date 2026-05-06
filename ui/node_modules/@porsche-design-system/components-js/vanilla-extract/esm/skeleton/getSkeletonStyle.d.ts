/**
 * Keyframes for the skeleton loading animation.
 * Animates the background position from right to left to create a shimmer effect.
 */
export declare const skeletonKeyframes: {
    from: {
        backgroundPositionX: string;
    };
    to: {
        backgroundPositionX: string;
    };
};
/**
 * Applies skeleton loading styles with a background animation.
 * Uses the CSS `light-dark()` color function for automatic theme adaptation.
 *
 * @param animationName - The name of the animation, which must be the generated name from `vanilla-extract`.
 * This should be the return value of the `keyframes` function.
 */
export declare const getSkeletonStyle: (animationName: string) => {
    readonly display: "block";
    readonly borderRadius: "4px";
    readonly background: `transparent linear-gradient(to right, ${string} 0%, ${string} 50%, ${string} 100%) 0 0 / 200% 100%`;
    readonly animation: `${string} 1.2s cubic-bezier(.25,.1,.25,1) infinite`;
};
