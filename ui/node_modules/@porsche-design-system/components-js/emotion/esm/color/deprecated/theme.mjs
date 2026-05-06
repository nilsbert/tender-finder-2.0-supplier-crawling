import { themeDark } from './themeDark.mjs';
import { themeLight } from './themeLight.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use individual variables instead. */
const theme = {
    light: themeLight,
    dark: themeDark,
};

export { theme };
