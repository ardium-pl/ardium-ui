import { InjectionToken, Provider, Type } from '@angular/core';
import { PanelAppearance, PanelVariant } from './../types/theming.types';
import { ArdModalCloseIcon } from './modal.types';

export interface ArdModalDefaults {
  appearance: PanelAppearance;
  variant: PanelVariant;
  compact: boolean;
  heading: string;
  noCloseButton: boolean;
  noBackdrop: boolean;
  disableBackdropClose: boolean;
  panelClass: string;
  backdropClass: string;
  CloseIconComponent?: Type<ArdModalCloseIcon>;
}

export const _modalDefaults: ArdModalDefaults = {
  appearance: PanelAppearance.Raised,
  variant: PanelVariant.Rounded,
  compact: false,
  heading: '',
  noCloseButton: false,
  noBackdrop: false,
  disableBackdropClose: false,
  panelClass: '',
  backdropClass: '',
  CloseIconComponent: undefined,
};

export const ARD_MODAL_DEFAULTS = new InjectionToken<ArdModalDefaults>('ard-modal-defaults', {
  factory: () => ({
    ..._modalDefaults,
  }),
});

export function provideModalDefaults(config: Partial<ArdModalDefaults>): Provider {
  return { provide: ARD_MODAL_DEFAULTS, useValue: { ..._modalDefaults, ...config } };
}
