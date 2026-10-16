import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewEncapsulation,
  computed,
  contentChild,
  input,
  untracked,
} from '@angular/core';
import { contextToInputs } from '../../_internal/utils/context-to-inputs';
import { ComponentColor } from '../../types/colors.types';
import { FormElementVariant } from '../../types/theming.types';
import { _FileInputComponentBase } from '../file-input-base';
import { FileInputBrowseContext, FileInputFileAmountContext, FileInputFilesContext } from '../file-input-types';
import { ARD_FILE_DROP_AREA_DEFAULTS, ArdFileDropAreaDefaults } from './file-drop-area.defaults';
import {
  ArdiumFileDropAreaDragoverContentTemplateDirective,
  ArdiumFileDropAreaIdleContentTemplateDirective,
  ArdiumFileDropAreaUploadedContentTemplateDirective,
} from './file-drop-area.directives';

@Component({
  standalone: false,
  selector: 'ard-file-drop-area',
  templateUrl: './file-drop-area.component.html',
  styleUrls: ['./file-drop-area.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArdiumFileDropAreaComponent extends _FileInputComponentBase {
  protected override readonly _DEFAULTS!: ArdFileDropAreaDefaults;
  constructor(@Inject(ARD_FILE_DROP_AREA_DEFAULTS) defaults: ArdFileDropAreaDefaults) {
    super(defaults);
  }

  readonly componentId = '010';

  //! appearance
  readonly variant = input<FormElementVariant>(this._DEFAULTS.variant);
  readonly color = input<ComponentColor>(this._DEFAULTS.color);

  readonly ngClasses = computed<string>(() =>
    [`ard-variant-${this.variant()}`, `ard-color-${this.color()}`, this.compact() ? 'ard-compact' : ''].join(' ')
  );

  //! triggering file dialog
  protected _wasMousedownOnElement: true | null = null;
  onMousedown(): void {
    if (this.disabled() || this.readonly()) return;
    this._wasMousedownOnElement = true;
  }
  onMouseup(): void {
    if (this.disabled() || this.readonly()) return;
    if (!this._wasMousedownOnElement) return;
    this._wasMousedownOnElement = null;

    this.openBrowseDialog();
  }

  //! templates
  readonly idleTemplate = contentChild(ArdiumFileDropAreaIdleContentTemplateDirective);
  readonly dragoverTemplate = contentChild(ArdiumFileDropAreaDragoverContentTemplateDirective);
  readonly uploadedTemplate = contentChild(ArdiumFileDropAreaUploadedContentTemplateDirective);

  readonly idleContext = computed<FileInputBrowseContext>(() => ({
    browse: () => {
      untracked(() => this.openBrowseDialog());
    },
  }));
  readonly dragoverContext = computed<FileInputFileAmountContext>(() => ({
    amount: this._draggedFiles()!,
    browse: () => {
      untracked(() => this.openBrowseDialog());
    },
  }));
  readonly uploadedContext = computed<FileInputFilesContext>(() => {
    const files = this._value()!;
    return {
      $implicit: files,
      amount: files.length,
      files,
      browse: () => {
        untracked(() => this.openBrowseDialog());
      },
    };
  });

  //! template components
  readonly idleContentComponent = this._DEFAULTS.IdleContentComponent;
  readonly dragoverContentComponent = this._DEFAULTS.DragoverContentComponent;
  readonly uploadedContentComponent = this._DEFAULTS.UploadedContentComponent;

  readonly idleContentComponentInputs = contextToInputs(this.idleContext, this.idleContentComponent);
  readonly dragoverContentComponentInputs = contextToInputs(this.dragoverContext, this.dragoverContentComponent);
  readonly uploadedContentComponentInputs = contextToInputs(this.uploadedContext, this.uploadedContentComponent);
}
