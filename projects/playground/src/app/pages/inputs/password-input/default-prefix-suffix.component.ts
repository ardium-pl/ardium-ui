import { Component } from '@angular/core';
import {
  ArdiumPasswordInputModule,
  providePasswordInputDefaults,
} from 'projects/ui/src/public-api';

@Component({
  selector: 'app-password-input-default-prefix',
  template: `🔒`,
  standalone: true,
})
export class PasswordInputDefaultPrefixComponent {}

@Component({
  selector: 'app-password-input-default-prefix-component',
  template: `<ard-password-input placeholder="With default prefix" />`,
  standalone: true,
  imports: [ArdiumPasswordInputModule],
  providers: [
    providePasswordInputDefaults({
      PrefixComponent: PasswordInputDefaultPrefixComponent as any,
    }),
  ],
})
export class PasswordInputDefaultPrefixDemoComponent {}
