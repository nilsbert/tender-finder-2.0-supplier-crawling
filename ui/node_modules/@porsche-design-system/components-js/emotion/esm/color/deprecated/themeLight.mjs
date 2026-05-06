import { themeLightBackgroundBase } from './themeLightBackgroundBase.mjs';
import { themeLightBackgroundFrosted } from './themeLightBackgroundFrosted.mjs';
import { themeLightBackgroundShading } from './themeLightBackgroundShading.mjs';
import { themeLightBackgroundSurface } from './themeLightBackgroundSurface.mjs';
import { themeLightContrastHigh } from './themeLightContrastHigh.mjs';
import { themeLightContrastLow } from './themeLightContrastLow.mjs';
import { themeLightContrastMedium } from './themeLightContrastMedium.mjs';
import { themeLightNotificationError } from './themeLightNotificationError.mjs';
import { themeLightNotificationErrorSoft } from './themeLightNotificationErrorSoft.mjs';
import { themeLightNotificationInfo } from './themeLightNotificationInfo.mjs';
import { themeLightNotificationInfoSoft } from './themeLightNotificationInfoSoft.mjs';
import { themeLightNotificationSuccess } from './themeLightNotificationSuccess.mjs';
import { themeLightNotificationSuccessSoft } from './themeLightNotificationSuccessSoft.mjs';
import { themeLightNotificationWarning } from './themeLightNotificationWarning.mjs';
import { themeLightNotificationWarningSoft } from './themeLightNotificationWarningSoft.mjs';
import { themeLightPrimary } from './themeLightPrimary.mjs';
import { themeLightStateActive } from './themeLightStateActive.mjs';
import { themeLightStateDisabled } from './themeLightStateDisabled.mjs';
import { themeLightStateFocus } from './themeLightStateFocus.mjs';
import { themeLightStateHover } from './themeLightStateHover.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use individual variables instead. */
const themeLight = {
    primary: themeLightPrimary,
    background: {
        base: themeLightBackgroundBase,
        surface: themeLightBackgroundSurface,
        shading: themeLightBackgroundShading,
        frosted: themeLightBackgroundFrosted,
    },
    contrast: {
        low: themeLightContrastLow,
        medium: themeLightContrastMedium,
        high: themeLightContrastHigh,
    },
    notification: {
        success: themeLightNotificationSuccess,
        successSoft: themeLightNotificationSuccessSoft,
        warning: themeLightNotificationWarning,
        warningSoft: themeLightNotificationWarningSoft,
        error: themeLightNotificationError,
        errorSoft: themeLightNotificationErrorSoft,
        info: themeLightNotificationInfo,
        infoSoft: themeLightNotificationInfoSoft,
    },
    state: {
        hover: themeLightStateHover,
        active: themeLightStateActive,
        focus: themeLightStateFocus,
        disabled: themeLightStateDisabled,
    },
};

export { themeLight };
