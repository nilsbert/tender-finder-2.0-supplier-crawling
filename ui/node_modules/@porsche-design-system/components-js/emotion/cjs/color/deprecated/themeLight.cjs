'use strict';

var themeLightBackgroundBase = require('./themeLightBackgroundBase.cjs');
var themeLightBackgroundFrosted = require('./themeLightBackgroundFrosted.cjs');
var themeLightBackgroundShading = require('./themeLightBackgroundShading.cjs');
var themeLightBackgroundSurface = require('./themeLightBackgroundSurface.cjs');
var themeLightContrastHigh = require('./themeLightContrastHigh.cjs');
var themeLightContrastLow = require('./themeLightContrastLow.cjs');
var themeLightContrastMedium = require('./themeLightContrastMedium.cjs');
var themeLightNotificationError = require('./themeLightNotificationError.cjs');
var themeLightNotificationErrorSoft = require('./themeLightNotificationErrorSoft.cjs');
var themeLightNotificationInfo = require('./themeLightNotificationInfo.cjs');
var themeLightNotificationInfoSoft = require('./themeLightNotificationInfoSoft.cjs');
var themeLightNotificationSuccess = require('./themeLightNotificationSuccess.cjs');
var themeLightNotificationSuccessSoft = require('./themeLightNotificationSuccessSoft.cjs');
var themeLightNotificationWarning = require('./themeLightNotificationWarning.cjs');
var themeLightNotificationWarningSoft = require('./themeLightNotificationWarningSoft.cjs');
var themeLightPrimary = require('./themeLightPrimary.cjs');
var themeLightStateActive = require('./themeLightStateActive.cjs');
var themeLightStateDisabled = require('./themeLightStateDisabled.cjs');
var themeLightStateFocus = require('./themeLightStateFocus.cjs');
var themeLightStateHover = require('./themeLightStateHover.cjs');

/** @deprecated since v4.0.0, will be removed with next major release. Use individual variables instead. */
const themeLight = {
    primary: themeLightPrimary.themeLightPrimary,
    background: {
        base: themeLightBackgroundBase.themeLightBackgroundBase,
        surface: themeLightBackgroundSurface.themeLightBackgroundSurface,
        shading: themeLightBackgroundShading.themeLightBackgroundShading,
        frosted: themeLightBackgroundFrosted.themeLightBackgroundFrosted,
    },
    contrast: {
        low: themeLightContrastLow.themeLightContrastLow,
        medium: themeLightContrastMedium.themeLightContrastMedium,
        high: themeLightContrastHigh.themeLightContrastHigh,
    },
    notification: {
        success: themeLightNotificationSuccess.themeLightNotificationSuccess,
        successSoft: themeLightNotificationSuccessSoft.themeLightNotificationSuccessSoft,
        warning: themeLightNotificationWarning.themeLightNotificationWarning,
        warningSoft: themeLightNotificationWarningSoft.themeLightNotificationWarningSoft,
        error: themeLightNotificationError.themeLightNotificationError,
        errorSoft: themeLightNotificationErrorSoft.themeLightNotificationErrorSoft,
        info: themeLightNotificationInfo.themeLightNotificationInfo,
        infoSoft: themeLightNotificationInfoSoft.themeLightNotificationInfoSoft,
    },
    state: {
        hover: themeLightStateHover.themeLightStateHover,
        active: themeLightStateActive.themeLightStateActive,
        focus: themeLightStateFocus.themeLightStateFocus,
        disabled: themeLightStateDisabled.themeLightStateDisabled,
    },
};

exports.themeLight = themeLight;
