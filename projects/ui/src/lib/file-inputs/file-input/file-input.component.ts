import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  ViewEncapsulation,
  computed,
  contentChild,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { BooleanLike, coerceBooleanProperty } from '@ardium-ui/devkit';
import { ARD_FORM_FIELD_CONTROL } from '../../form-field/form-field-child.token';
import { ComponentColor } from '../../types/colors.types';
import { FormElementAppearance, FormElementVariant } from '../../types/theming.types';
import { _FileInputComponentBase } from '../file-input-base';
import { FileInputBrowseContext, FileInputFileAmountContext, FileInputFilesContext } from '../file-input-types';
import { ARD_FILE_INPUT_DEFAULTS, ArdFileInputDefaults } from './file-input.defaults';
import {
  ArdFileInputPrefixTemplateDirective,
  ArdFileInputSuffixTemplateDirective,
  ArdiumFileInputDragoverContentTemplateDirective,
  ArdiumFileInputIdleContentTemplateDirective,
  ArdiumFileInputUploadIconTemplateDirective,
  ArdiumFileInputUploadedContentTemplateDirective
} from './file-input.directives';

@Component({
  standalone: false,
  selector: 'ard-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArdiumFileInputComponent),
      multi: true,
    },
    {
      provide: ARD_FORM_FIELD_CONTROL,
      useExisting: forwardRef(() => ArdiumFileInputComponent),
    },
  ],
})
export class ArdiumFileInputComponent extends _FileInputComponentBase {
  protected override readonly _DEFAULTS!: ArdFileInputDefaults;
  constructor(@Inject(ARD_FILE_INPUT_DEFAULTS) defaults: ArdFileInputDefaults) {
    super(defaults);
  }

  readonly componentId = '011';

  //! appearance
  //all handled in ard-form-field-frame component
  readonly appearance = input<FormElementAppearance>(this._DEFAULTS.appearance);
  readonly variant = input<FormElementVariant>(this._DEFAULTS.variant);
  readonly color = input<ComponentColor>(this._DEFAULTS.color);

  //! other inputs
  readonly inputAttrs = input<Record<string, any>>(this._DEFAULTS.inputAttrs);

  //! root element classes
  readonly ngClasses = computed<string>(() =>
    [`ard-color-${this.color()}`, `ard-state-${this.currentViewState()}`, this.value ? 'ard-has-value' : ''].join(' ')
  );

  //! clear button
  readonly clearable = input<boolean, BooleanLike>(this._DEFAULTS.clearable, { transform: v => coerceBooleanProperty(v) });

  readonly clearButtonTitle = input<string>(this._DEFAULTS.clearButtonTitle);

  get shouldShowClearButton(): boolean {
    return this.clearable() && !this.disabled() && !this.readonly() && Boolean(this.value);
  }
  onClearButtonClick(event: MouseEvent): void {
    if (this.disabled() || this.readonly()) return;

    event.stopPropagation();
    this.clear();
    this.focus();
  }

  //! clear function
  clear(): void {
    if (this.disabled() || this.readonly()) return;
    if (!this.clearable()) return;

    this.writeValue(null);
    this._emitChange();
    this.clearEvent.emit();
  }

  readonly clearEvent = output({ alias: 'clear' });

  //! state
  readonly touched = signal<boolean>(false);

  //! prefix & suffix
  readonly prefixTemplate = contentChild(ArdFileInputPrefixTemplateDirective);
  readonly suffixTemplate = contentChild(ArdFileInputSuffixTemplateDirective);

  readonly prefixComponent = this._DEFAULTS.PrefixComponent;
  readonly suffixComponent = this._DEFAULTS.SuffixComponent;

  //! templates
  readonly idleTemplate = contentChild(ArdiumFileInputIdleContentTemplateDirective);
  readonly dragoverTemplate = contentChild(ArdiumFileInputDragoverContentTemplateDirective);
  readonly uploadedTemplate = contentChild(ArdiumFileInputUploadedContentTemplateDirective);
  readonly uploadIconTemplate = contentChild(ArdiumFileInputUploadIconTemplateDirective);

  getIdleContext(): FileInputBrowseContext {
    return {
      browse: () => {
        this.openBrowseDialog();
      },
    };
  }
  getDragoverContext(): FileInputFileAmountContext {
    return {
      amount: this._draggedFiles!,
      browse: () => {
        this.openBrowseDialog();
      },
    };
  }
  getUploadedContext(): FileInputFilesContext {
    const files = this.value!;
    return {
      $implicit: files,
      amount: files.length,
      files,
      browse: () => {
        this.openBrowseDialog();
      },
    };
  }
}
