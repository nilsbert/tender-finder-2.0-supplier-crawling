import { themeDarkBackgroundBase } from './themeDarkBackgroundBase.mjs';
import { themeDarkBackgroundFrosted } from './themeDarkBackgroundFrosted.mjs';
import { themeDarkBackgroundShading } from './themeDarkBackgroundShading.mjs';
import { themeDarkBackgroundSurface } from './themeDarkBackgroundSurface.mjs';
import { themeDarkContrastHigh } from './themeDarkContrastHigh.mjs';
import { themeDarkContrastLow } from './themeDarkContrastLow.mjs';
import { themeDarkContrastMedium } from './themeDarkContrastMedium.mjs';
import { themeDarkNotificationError } from './themeDarkNotificationError.mjs';
import { themeDarkNotificationErrorSoft } from './themeDarkNotificationErrorSoft.mjs';
import { themeDarkNotificationInfo } from './themeDarkNotificationInfo.mjs';
import { themeDarkNotificationInfoSoft } from './themeDarkNotificationInfoSoft.mjs';
import { themeDarkNotificationSuccess } from './themeDarkNotificationSuccess.mjs';
import { themeDarkNotificationSuccessSoft } from './themeDarkNotificationSuccessSoft.mjs';
import { themeDarkNotificationWarning } from './themeDarkNotificationWarning.mjs';
import { themeDarkNotificationWarningSoft } from './themeDarkNotificationWarningSoft.mjs';
import { themeDarkPrimary } from './themeDarkPrimary.mjs';
import { themeDarkStateActive } from './themeDarkStateActive.mjs';
import { themeDarkStateDisabled } from './themeDarkStateDisabled.mjs';
import { themeDarkStateFocus } from './themeDarkStateFocus.mjs';
import { themeDarkStateHover } from './themeDarkStateHover.mjs';

/** @deprecated since v4.0.0, will be removed with next major release. Use individual variables instead. */
const themeDark = {
    primary: themeDarkPrimary,
    background: {
        base: themeDarkBackgroundBase,
        surface: themeDarkBackgroundSurface,
        shading: themeDarkBackgroundShading,
        frosted: themeDarkBackgroundFrosted,
    },
    contrast: {
        low: themeDarkContrastLow,
        medium: themeDarkContrastMedium,
        high: themeDarkContrastHigh,
    },
    notification: {
        success: themeDarkNotificationSuccess,
        successSoft: themeDarkNotificationSuccessSoft,
        warning: themeDarkNotificationWarning,
        warningSoft: themeDarkNotificationWarningSoft,
        error: themeDarkNotificationError,
        errorSoft: themeDarkNotificationErrorSoft,
        info: themeDarkNotificationInfo,
        infoSoft: themeDarkNotificationInfoSoft,
    },
    state: {
        hover: themeDarkStateHover,
        active: themeDarkStateActive,
        focus: themeDarkStateFocus,
        disabled: themeDarkStateDisabled,
    },
};

export { themeDark };
