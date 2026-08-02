import { Component } from '@angular/core';
import {
    ArdiumFileInputModule,
    provideFileInputDefaults,
} from 'projects/ui/src/public-api';

@Component({
  selector: 'app-file-input-default-prefix',
  template: `📁`,
  standalone: true,
})
export class FileInputDefaultPrefixComponent {}

@Component({
  selector: 'app-file-input-default-prefix-component',
  template: `<ard-file-input placeholder="With default prefix" />`,
  standalone: true,
  imports: [ArdiumFileInputModule],
  providers: [
    provideFileInputDefaults({
      PrefixComponent: FileInputDefaultPrefixComponent as any,
    }),
  ],
})
export class FileInputDefaultPrefixDemoComponent {}
