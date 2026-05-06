'use strict';

var colorFocusDark = require('../tokens/dist/esm/color/dark/a11y/colorFocusDark.cjs');
var colorBackdropDark = require('../tokens/dist/esm/color/dark/background/colorBackdropDark.cjs');
var colorCanvasDark = require('../tokens/dist/esm/color/dark/background/colorCanvasDark.cjs');
var colorFrostedDark = require('../tokens/dist/esm/color/dark/background/colorFrostedDark.cjs');
var colorFrostedSoftDark = require('../tokens/dist/esm/color/dark/background/colorFrostedSoftDark.cjs');
var colorFrostedStrongDark = require('../tokens/dist/esm/color/dark/background/colorFrostedStrongDark.cjs');
var colorSurfaceDark = require('../tokens/dist/esm/color/dark/background/colorSurfaceDark.cjs');
var colorContrastLowerDark = require('../tokens/dist/esm/color/dark/foreground/colorContrastLowerDark.cjs');
var colorContrastLowDark = require('../tokens/dist/esm/color/dark/foreground/colorContrastLowDark.cjs');
var colorContrastMediumDark = require('../tokens/dist/esm/color/dark/foreground/colorContrastMediumDark.cjs');
var colorContrastHighDark = require('../tokens/dist/esm/color/dark/foreground/colorContrastHighDark.cjs');
var colorContrastHigherDark = require('../tokens/dist/esm/color/dark/foreground/colorContrastHigherDark.cjs');
var colorPrimaryDark = require('../tokens/dist/esm/color/dark/foreground/colorPrimaryDark.cjs');
var colorErrorDark = require('../tokens/dist/esm/color/dark/semantic/colorErrorDark.cjs');
var colorErrorFrostedDark = require('../tokens/dist/esm/color/dark/semantic/colorErrorFrostedDark.cjs');
var colorErrorFrostedSoftDark = require('../tokens/dist/esm/color/dark/semantic/colorErrorFrostedSoftDark.cjs');
var colorErrorLowDark = require('../tokens/dist/esm/color/dark/semantic/colorErrorLowDark.cjs');
var colorErrorMediumDark = require('../tokens/dist/esm/color/dark/semantic/colorErrorMediumDark.cjs');
var colorInfoDark = require('../tokens/dist/esm/color/dark/semantic/colorInfoDark.cjs');
var colorInfoFrostedDark = require('../tokens/dist/esm/color/dark/semantic/colorInfoFrostedDark.cjs');
var colorInfoFrostedSoftDark = require('../tokens/dist/esm/color/dark/semantic/colorInfoFrostedSoftDark.cjs');
var colorInfoLowDark = require('../tokens/dist/esm/color/dark/semantic/colorInfoLowDark.cjs');
var colorInfoMediumDark = require('../tokens/dist/esm/color/dark/semantic/colorInfoMediumDark.cjs');
var colorSuccessDark = require('../tokens/dist/esm/color/dark/semantic/colorSuccessDark.cjs');
var colorSuccessFrostedDark = require('../tokens/dist/esm/color/dark/semantic/colorSuccessFrostedDark.cjs');
var colorSuccessFrostedSoftDark = require('../tokens/dist/esm/color/dark/semantic/colorSuccessFrostedSoftDark.cjs');
var colorSuccessLowDark = require('../tokens/dist/esm/color/dark/semantic/colorSuccessLowDark.cjs');
var colorSuccessMediumDark = require('../tokens/dist/esm/color/dark/semantic/colorSuccessMediumDark.cjs');
var colorWarningDark = require('../tokens/dist/esm/color/dark/semantic/colorWarningDark.cjs');
var colorWarningFrostedDark = require('../tokens/dist/esm/color/dark/semantic/colorWarningFrostedDark.cjs');
var colorWarningFrostedSoftDark = require('../tokens/dist/esm/color/dark/semantic/colorWarningFrostedSoftDark.cjs');
var colorWarningLowDark = require('../tokens/dist/esm/color/dark/semantic/colorWarningLowDark.cjs');
var colorWarningMediumDark = require('../tokens/dist/esm/color/dark/semantic/colorWarningMediumDark.cjs');
var colorFocusLight = require('../tokens/dist/esm/color/light/a11y/colorFocusLight.cjs');
var colorBackdropLight = require('../tokens/dist/esm/color/light/background/colorBackdropLight.cjs');
var colorCanvasLight = require('../tokens/dist/esm/color/light/background/colorCanvasLight.cjs');
var colorFrostedLight = require('../tokens/dist/esm/color/light/background/colorFrostedLight.cjs');
var colorFrostedSoftLight = require('../tokens/dist/esm/color/light/background/colorFrostedSoftLight.cjs');
var colorFrostedStrongLight = require('../tokens/dist/esm/color/light/background/colorFrostedStrongLight.cjs');
var colorSurfaceLight = require('../tokens/dist/esm/color/light/background/colorSurfaceLight.cjs');
var colorContrastLowerLight = require('../tokens/dist/esm/color/light/foreground/colorContrastLowerLight.cjs');
var colorContrastLowLight = require('../tokens/dist/esm/color/light/foreground/colorContrastLowLight.cjs');
var colorContrastMediumLight = require('../tokens/dist/esm/color/light/foreground/colorContrastMediumLight.cjs');
var colorContrastHighLight = require('../tokens/dist/esm/color/light/foreground/colorContrastHighLight.cjs');
var colorContrastHigherLight = require('../tokens/dist/esm/color/light/foreground/colorContrastHigherLight.cjs');
var colorPrimaryLight = require('../tokens/dist/esm/color/light/foreground/colorPrimaryLight.cjs');
var colorErrorFrostedLight = require('../tokens/dist/esm/color/light/semantic/colorErrorFrostedLight.cjs');
var colorErrorFrostedSoftLight = require('../tokens/dist/esm/color/light/semantic/colorErrorFrostedSoftLight.cjs');
var colorErrorLight = require('../tokens/dist/esm/color/light/semantic/colorErrorLight.cjs');
var colorErrorLowLight = require('../tokens/dist/esm/color/light/semantic/colorErrorLowLight.cjs');
var colorErrorMediumLight = require('../tokens/dist/esm/color/light/semantic/colorErrorMediumLight.cjs');
var colorInfoFrostedLight = require('../tokens/dist/esm/color/light/semantic/colorInfoFrostedLight.cjs');
var colorInfoFrostedSoftLight = require('../tokens/dist/esm/color/light/semantic/colorInfoFrostedSoftLight.cjs');
var colorInfoLight = require('../tokens/dist/esm/color/light/semantic/colorInfoLight.cjs');
var colorInfoLowLight = require('../tokens/dist/esm/color/light/semantic/colorInfoLowLight.cjs');
var colorInfoMediumLight = require('../tokens/dist/esm/color/light/semantic/colorInfoMediumLight.cjs');
var colorSuccessFrostedLight = require('../tokens/dist/esm/color/light/semantic/colorSuccessFrostedLight.cjs');
var colorSuccessFrostedSoftLight = require('../tokens/dist/esm/color/light/semantic/colorSuccessFrostedSoftLight.cjs');
var colorSuccessLight = require('../tokens/dist/esm/color/light/semantic/colorSuccessLight.cjs');
var colorSuccessLowLight = require('../tokens/dist/esm/color/light/semantic/colorSuccessLowLight.cjs');
var colorSuccessMediumLight = require('../tokens/dist/esm/color/light/semantic/colorSuccessMediumLight.cjs');
var colorWarningFrostedLight = require('../tokens/dist/esm/color/light/semantic/colorWarningFrostedLight.cjs');
var colorWarningFrostedSoftLight = require('../tokens/dist/esm/color/light/semantic/colorWarningFrostedSoftLight.cjs');
var colorWarningLight = require('../tokens/dist/esm/color/light/semantic/colorWarningLight.cjs');
var colorWarningLowLight = require('../tokens/dist/esm/color/light/semantic/colorWarningLowLight.cjs');
var colorWarningMediumLight = require('../tokens/dist/esm/color/light/semantic/colorWarningMediumLight.cjs');

const lightColorVariables = {
    '--_color-focus': colorFocusLight.colorFocusLight,
    '--_color-canvas': colorCanvasLight.colorCanvasLight,
    '--_color-surface': colorSurfaceLight.colorSurfaceLight,
    '--_color-frosted': colorFrostedLight.colorFrostedLight,
    '--_color-frosted-soft': colorFrostedSoftLight.colorFrostedSoftLight,
    '--_color-frosted-strong': colorFrostedStrongLight.colorFrostedStrongLight,
    '--_color-backdrop': colorBackdropLight.colorBackdropLight,
    '--_color-contrast-lower': colorContrastLowerLight.colorContrastLowerLight,
    '--_color-contrast-low': colorContrastLowLight.colorContrastLowLight,
    '--_color-contrast-medium': colorContrastMediumLight.colorContrastMediumLight,
    '--_color-contrast-high': colorContrastHighLight.colorContrastHighLight,
    '--_color-contrast-higher': colorContrastHigherLight.colorContrastHigherLight,
    '--_color-primary': colorPrimaryLight.colorPrimaryLight,
    '--_color-success': colorSuccessLight.colorSuccessLight,
    '--_color-success-low': colorSuccessLowLight.colorSuccessLowLight,
    '--_color-success-medium': colorSuccessMediumLight.colorSuccessMediumLight,
    '--_color-success-frosted': colorSuccessFrostedLight.colorSuccessFrostedLight,
    '--_color-success-frosted-soft': colorSuccessFrostedSoftLight.colorSuccessFrostedSoftLight,
    '--_color-warning': colorWarningLight.colorWarningLight,
    '--_color-warning-low': colorWarningLowLight.colorWarningLowLight,
    '--_color-warning-medium': colorWarningMediumLight.colorWarningMediumLight,
    '--_color-warning-frosted': colorWarningFrostedLight.colorWarningFrostedLight,
    '--_color-warning-frosted-soft': colorWarningFrostedSoftLight.colorWarningFrostedSoftLight,
    '--_color-error': colorErrorLight.colorErrorLight,
    '--_color-error-low': colorErrorLowLight.colorErrorLowLight,
    '--_color-error-medium': colorErrorMediumLight.colorErrorMediumLight,
    '--_color-error-frosted': colorErrorFrostedLight.colorErrorFrostedLight,
    '--_color-error-frosted-soft': colorErrorFrostedSoftLight.colorErrorFrostedSoftLight,
    '--_color-info': colorInfoLight.colorInfoLight,
    '--_color-info-low': colorInfoLowLight.colorInfoLowLight,
    '--_color-info-medium': colorInfoMediumLight.colorInfoMediumLight,
    '--_color-info-frosted': colorInfoFrostedLight.colorInfoFrostedLight,
    '--_color-info-frosted-soft': colorInfoFrostedSoftLight.colorInfoFrostedSoftLight,
};
const darkColorVariables = {
    '--_color-focus': colorFocusDark.colorFocusDark,
    '--_color-canvas': colorCanvasDark.colorCanvasDark,
    '--_color-surface': colorSurfaceDark.colorSurfaceDark,
    '--_color-frosted': colorFrostedDark.colorFrostedDark,
    '--_color-frosted-soft': colorFrostedSoftDark.colorFrostedSoftDark,
    '--_color-frosted-strong': colorFrostedStrongDark.colorFrostedStrongDark,
    '--_color-backdrop': colorBackdropDark.colorBackdropDark,
    '--_color-contrast-lower': colorContrastLowerDark.colorContrastLowerDark,
    '--_color-contrast-low': colorContrastLowDark.colorContrastLowDark,
    '--_color-contrast-medium': colorContrastMediumDark.colorContrastMediumDark,
    '--_color-contrast-high': colorContrastHighDark.colorContrastHighDark,
    '--_color-contrast-higher': colorContrastHigherDark.colorContrastHigherDark,
    '--_color-primary': colorPrimaryDark.colorPrimaryDark,
    '--_color-success': colorSuccessDark.colorSuccessDark,
    '--_color-success-low': colorSuccessLowDark.colorSuccessLowDark,
    '--_color-success-medium': colorSuccessMediumDark.colorSuccessMediumDark,
    '--_color-success-frosted': colorSuccessFrostedDark.colorSuccessFrostedDark,
    '--_color-success-frosted-soft': colorSuccessFrostedSoftDark.colorSuccessFrostedSoftDark,
    '--_color-warning': colorWarningDark.colorWarningDark,
    '--_color-warning-low': colorWarningLowDark.colorWarningLowDark,
    '--_color-warning-medium': colorWarningMediumDark.colorWarningMediumDark,
    '--_color-warning-frosted': colorWarningFrostedDark.colorWarningFrostedDark,
    '--_color-warning-frosted-soft': colorWarningFrostedSoftDark.colorWarningFrostedSoftDark,
    '--_color-error': colorErrorDark.colorErrorDark,
    '--_color-error-low': colorErrorLowDark.colorErrorLowDark,
    '--_color-error-medium': colorErrorMediumDark.colorErrorMediumDark,
    '--_color-error-frosted': colorErrorFrostedDark.colorErrorFrostedDark,
    '--_color-error-frosted-soft': colorErrorFrostedSoftDark.colorErrorFrostedSoftDark,
    '--_color-info': colorInfoDark.colorInfoDark,
    '--_color-info-low': colorInfoLowDark.colorInfoLowDark,
    '--_color-info-medium': colorInfoMediumDark.colorInfoMediumDark,
    '--_color-info-frosted': colorInfoFrostedDark.colorInfoFrostedDark,
    '--_color-info-frosted-soft': colorInfoFrostedSoftDark.colorInfoFrostedSoftDark,
};
const colorSchemeStyles = {
    '.scheme-normal': {
        colorScheme: 'normal',
    },
    '.scheme-dark': {
        colorScheme: 'dark',
    },
    '.scheme-light': {
        colorScheme: 'light',
    },
    '.scheme-light-dark': {
        colorScheme: 'light dark',
    },
    '.scheme-only-dark': {
        colorScheme: 'only dark',
    },
    '.scheme-only-light': {
        colorScheme: 'only light',
    },
    '@supports not (color: light-dark(white, black))': {
        ':root, .scheme-light, .scheme-only-light, .scheme-normal, .scheme-light-dark': lightColorVariables,
        '.scheme-dark, .scheme-only-dark': darkColorVariables,
        '@media (prefers-color-scheme: dark)': {
            '.scheme-light-dark': darkColorVariables,
        },
    },
};

exports.colorSchemeStyles = colorSchemeStyles;
