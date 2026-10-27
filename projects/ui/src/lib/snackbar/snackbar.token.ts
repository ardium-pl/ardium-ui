import { InjectionToken, Provider } from '@angular/core';
import { ComponentColor } from './../types/colors.types';
import {
  ArdSnackbarAlignment,
  ArdSnackbarOptions,
  ArdSnackbarOriginRelation,
  ArdSnackbarQueueHandling,
  ArdSnackbarType,
} from './snackbar.types';

const _snackbarDefaults: Required<ArdSnackbarOptions> = {
  placement: {
    align: ArdSnackbarAlignment.BottomCenter,
    origin: undefined,
    originRelation: ArdSnackbarOriginRelation.Inside,
  },
  duration: 5000,
  queueHandling: ArdSnackbarQueueHandling.Default,
  panelClass: [],
  data: { message: '' },
  color: ComponentColor.Primary,
  type: ArdSnackbarType.None,
};

export const ARD_SNACKBAR_DEFAULTS = new InjectionToken<Required<ArdSnackbarOptions>>('ard-snackbar-defaults', {
  factory: () => ({ ..._snackbarDefaults }),
});

export function provideSnackbarDefaults(config: Partial<ArdSnackbarOptions>): Provider {
  return { provide: ARD_SNACKBAR_DEFAULTS, useValue: { ..._snackbarDefaults, ...config } };
}

export const ARD_SNACKBAR_ANIMATION_LENGTH = new InjectionToken<number>('ard-snackbar-animation-length', {
  factory: () => 150,
});
