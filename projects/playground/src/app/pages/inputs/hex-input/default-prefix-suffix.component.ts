import { Component } from '@angular/core';
import {
    ArdiumHexInputModule,
    provideHexInputDefaults,
} from 'projects/ui/src/public-api';

@Component({
  selector: 'app-hex-input-default-prefix',
  template: `#`,
  standalone: true,
})
export class HexInputDefaultPrefixComponent {}

@Component({
  selector: 'app-hex-input-default-prefix-component',
  template: `<ard-hex-input placeholder="With default prefix" />`,
  standalone: true,
  imports: [ArdiumHexInputModule],
  providers: [
    provideHexInputDefaults({
      PrefixComponent: HexInputDefaultPrefixComponent as any,
    }),
  ],
})
export class HexInputDefaultPrefixDemoComponent {}
