import { InjectionToken, Provider, Type } from '@angular/core';
import { _selectableListComponentDefaults, _SelectableListComponentDefaults } from '../_internal/selectable-list-component';
import { OneAxisAlignment } from '../types/alignment.types';
import { ComponentColor } from '../types/colors.types';
import { ArdSegmentOption } from './segment.directives';
import { SegmentAppearance, SegmentVariant } from './segment.types';

export interface ArdSegmentDefaults extends _SelectableListComponentDefaults {
  appearance: SegmentAppearance;
  variant: SegmentVariant;
  color: ComponentColor;
  align: OneAxisAlignment;
  iconBased: boolean;
  compact: boolean;
  autoFocus: boolean;
  uniformWidths: boolean;
  itemsPerRow: number;
  OptionComponent?: Type<ArdSegmentOption>;
}

const _segmentDefaults: ArdSegmentDefaults = {
  ..._selectableListComponentDefaults,
  appearance: SegmentAppearance.Outlined,
  variant: SegmentVariant.RoundedConnected,
  color: ComponentColor.Primary,
  align: OneAxisAlignment.Center,
  iconBased: false,
  compact: false,
  autoFocus: false,
  uniformWidths: false,
  itemsPerRow: Infinity,
  OptionComponent: undefined,
};

export const ARD_SEGMENT_DEFAULTS = new InjectionToken<ArdSegmentDefaults>('ard-segment-defaults', {
  factory: () => ({
    ..._segmentDefaults,
  }),
});

export function provideSegmentDefaults(config: Partial<ArdSegmentDefaults>): Provider {
  return { provide: ARD_SEGMENT_DEFAULTS, useValue: { ..._segmentDefaults, ...config } };
}
