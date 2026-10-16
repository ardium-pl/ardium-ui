import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumKbdModule, ArdiumKbdShortcutModule } from '../../../../../ui/src/public-api';
import { KbdShortcutPage } from './kbd-shortcut.page';

@NgModule({
  declarations: [KbdShortcutPage],
  imports: [CommonModule, ArdiumKbdShortcutModule, ArdiumKbdModule],
})
export class KbdShortcutModule {}
