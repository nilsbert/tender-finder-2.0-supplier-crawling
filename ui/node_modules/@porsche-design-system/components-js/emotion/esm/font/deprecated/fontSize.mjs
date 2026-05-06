import { fontSizeDisplay } from './fontSizeDisplay.mjs';
import { fontSizeHeading } from './fontSizeHeading.mjs';
import { fontSizeText } from './fontSizeText.mjs';

// Fluid Type Scale Calculator (https://fluid-type-scale.com) was used to generate a type scale set based on the "golden ratio".
// "Text/Heading": min - base: 16px, screen: 320px, ratio: 1,2 / max - base: 16px, screen: 1760px, ratio: 1,309
// "Display": min - base: 16px, screen: 320px, ratio: 1,2 / max - base: 16px, screen: 1760px, ratio: 1,5
/** @deprecated since v4.0.0, will be removed with next major release. Use typescale variables instead. */
const fontSize = {
    text: fontSizeText,
    heading: fontSizeHeading,
    display: fontSizeDisplay,
};

export { fontSize };
