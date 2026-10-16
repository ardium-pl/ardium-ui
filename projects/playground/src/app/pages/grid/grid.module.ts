import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArdiumGridModule, ArdiumStackModule, provideBreakpoints } from '../../../../../ui/src/public-api';
import { GridPage } from './grid.page';

@NgModule({
  declarations: [GridPage],
  imports: [CommonModule, ArdiumGridModule, ArdiumStackModule],
  providers: [...provideBreakpoints()],
})
export class GridModule {}
