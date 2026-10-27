import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  OnInit,
  output,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import {
  BooleanLike,
  coerceBooleanProperty,
  coerceNumberProperty,
  FileSystemMethod,
  FileSystemService,
  FileSystemStartDirectory,
  NumberLike,
} from '@ardium-pl/devkit';
import { isDefined } from 'simple-bool';
import { _FormFieldComponentBase } from '../_internal/form-field-component';
import { Nullable } from '../types/utility.types';
import { _FileInputBaseDefaults } from './file-input-base.defaults';
import { FileInputFailedUpload, FileInputFailedUploadReason, FileInputFileTypes } from './file-input-types';

@Directive()
export abstract class _FileInputComponentBase
  extends _FormFieldComponentBase
  implements OnInit, Omit<FormValueControl<File | File[] | null>, 'readonly' | 'disabled'>
{
  private readonly _platformId = inject(PLATFORM_ID);

  protected override readonly _DEFAULTS!: _FileInputBaseDefaults;

  constructor(defaults: _FileInputBaseDefaults) {
    super(defaults);

    effect(() => {
      this._validateWrittenValue();
    });
    effect(() => {
      this._updateElementValue();
    });
  }

  private readonly _fileSystemService = inject(FileSystemService);

  abstract readonly componentId: string;

  readonly fileInputEl = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  override ngOnInit(): void {
    super.ngOnInit();
    if (!isPlatformBrowser(this._platformId)) return;
    
    if (!(window.File && window.FileReader && window.Blob)) {
      console.error(
        new Error(
          `ARD-FT${this.componentId}0: Cannot use Ardium UI file features because this browser does not support file handling!`
        )
      );
    }
  }

  //! appearance
  readonly compact = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  //! settings
  readonly multiple = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  // @ts-expect-error
  readonly maxLength = input<number, NumberLike>(0, { transform: v => coerceNumberProperty(v, 0) });
  /**
   * @deprecated Use `[maxLength]` instead.
   */
  readonly maxFiles = input<undefined, never>(undefined, { transform: () => undefined });

  readonly fileLimit = computed<number>(() => (this.multiple() ? (this.maxLength() > 1 ? this.maxLength() : Infinity) : 1));

  readonly blockAfterUpload = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  readonly shouldBeBlocked = computed<boolean>(
    () => this.disabled() || this.readonly() || (this.blockAfterUpload() && isDefined(this.value()))
  );

  readonly maxFileSizeBytes = input<Nullable<number>, any>(null, { transform: v => coerceNumberProperty(v, null) });

  readonly accept = input<string | string[]>('*');
  readonly directoryId = input<Nullable<string>>(undefined);
  readonly startDirectory = input<Nullable<FileSystemStartDirectory>>(undefined);
  readonly fileTypes = input<Nullable<FileInputFileTypes>>(undefined);

  readonly acceptString = computed<string>(() => {
    const types = this.fileTypes();
    if (types) {
      const acceptEntries: string[] = [];
      for (const type of types) {
        if (type.accept) {
          for (const mimeType in type.accept) {
            const extensions = type.accept[mimeType];
            if (extensions && extensions.length > 0) {
              acceptEntries.push(...extensions);
            }
          }
        }
      }
      return acceptEntries.join(',');
    }

    const accept = this.accept();
    if (Array.isArray(accept)) {
      return accept.join(',');
    }

    return accept;
  });

  readonly acceptedMimeTypes = computed<{ mimeType: string; extensions: Set<string> }[] | null>(() => {
    const types = this.fileTypes();
    if (types) {
      const mimeTypes: { mimeType: string; extensions: Set<string> }[] = [];
      for (const type of types) {
        if (type.accept) {
          for (const mimeType in type.accept) {
            mimeTypes.push({ mimeType, extensions: new Set(type.accept[mimeType]) });
          }
        }
      }
      return mimeTypes;
    }
    return null;
  });

  //! value
  readonly value = model<File | File[] | null>(null);
  protected readonly _valueAsArray = computed<File[] | null>(() => {
    const v = this.value();
    if (v === null) return null;
    if (v instanceof File) return [v];
    return v;
  });

  private _setValue(v: File | File[] | null): void {
    if (!isDefined(v)) {
      this.value.set(null);
      return;
    }
    if (v instanceof File) {
      if (this.multiple()) {
        this.value.set([v]);
      } else {
        this.value.set(v);
      }
      return;
    }
    if (this.multiple()) {
      this.value.set(v.length > 0 ? v.slice(0, this.fileLimit()) : null);
    } else {
      this.value.set(v.length > 0 ? v[0] : null);
    }
  }

  readonly dragFilesEvent = output<File[]>({ alias: 'dragFiles' });
  readonly failedUploadEvent = output<FileInputFailedUpload[]>({ alias: 'failedUpload' });

  protected _valueBeforeInit: File[] | null = null;
  private _validateWrittenValue(): void {
    const v = this.value();
    if (!isDefined(v)) return;
    if (v instanceof File) return;
    if (Array.isArray(v) && v.every(file => file instanceof File)) {
      if (!this.multiple() && v.length > 1) {
        console.warn(
          `ARD-WA${this.componentId}1: <ard-file-input> received an array of files but the 'multiple' input is not set to true. Only the first file will be used.`
        );
        this.value.set([v[0]]);
      }
      return;
    }
    console.error(new Error(`ARD-FT${this.componentId}1: <ard-file-input>'s value must be a File, an array of Files, or null.`));
    this.value.set(null);
  }

  openBrowseDialog(): void {
    if (this.disabled() || this.readonly()) return;
    // use FileSystemAPI if supported & needed
    if (
      this._fileSystemService.isFileSystemAPISupported('showOpenFilePicker') &&
      (this.directoryId() || this.startDirectory() || this.fileTypes())
    ) {
      this._isFilePickerOpen = true;

      this._fileSystemService
        .requestFileUpload({
          method: FileSystemMethod.PreferFileSystem,
          multiple: this.multiple(),
          directoryId: this.directoryId() ?? undefined,
          startDirectory: this.startDirectory() ?? undefined,
          types: this.fileTypes() ?? undefined,
          accept: this.accept() === '*' ? undefined : this.accept(),
        })
        .then(fileOrFiles => {
          this._isFilePickerOpen = false;
          if (!fileOrFiles) {
            this.value.set(null);
            return;
          }
          const { acceptedFiles, failedFiles } = this._filterFilesOnValueChange(
            Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles]
          );

          if (failedFiles.length > 0) {
            this.failedUploadEvent.emit(failedFiles);
          }
          this._setValue(acceptedFiles);
        });
      return;
    }
    // else use the old-school method by clicking directly on the input
    this._isFilePickerOpen = true;
    this.fileInputEl()?.nativeElement.click();
  }

  //! temporary value
  //for drag event handling
  protected readonly _draggedFiles = signal<number | null>(null);

  //! view state
  readonly currentViewState = linkedSignal<'idle' | 'dragover' | 'uploaded'>(() => (this.value() ? 'uploaded' : 'idle'));
  private _beforeDragoverState: 'idle' | 'uploaded' = 'idle';

  //! event handlers
  onDragover(event: DragEvent): void {
    event.preventDefault();
    if (this.shouldBeBlocked()) {
      if (!event.dataTransfer) return;

      event.dataTransfer.dropEffect = 'none';
      return;
    }
    if (this.currentViewState() === 'dragover') return;

    this._draggedFiles.set(this._countDragenterFiles(event.dataTransfer));

    if (!this._draggedFiles()) return;

    this._beforeDragoverState = this.currentViewState() as 'idle' | 'uploaded';
    this.currentViewState.set('dragover');
  }
  onDragleave(): void {
    if (this.shouldBeBlocked()) return;
    if (this.currentViewState() !== 'dragover') return;

    this.currentViewState.set(this._beforeDragoverState);
  }
  onDrop(event: DragEvent): void {
    event.preventDefault();

    if (this.shouldBeBlocked()) return;

    const filelist = event.dataTransfer?.files;
    if (!filelist) {
      this.currentViewState.set('idle');
      return;
    }
    const files = Array.from(filelist);
    if (!files) {
      this.currentViewState.set('idle');
      return;
    }
    const { acceptedFiles, failedFiles } = this._filterFilesOnValueChange(files);

    if (acceptedFiles.length > 0) {
      this.dragFilesEvent.emit(acceptedFiles);
    }
    if (failedFiles.length > 0) {
      this.failedUploadEvent.emit(failedFiles);
    }

    this._setValue(acceptedFiles);
    this._emitTouched();
  }
  onFileInputChange(): void {
    this._isFilePickerOpen = false;
    const files = Array.from(this.fileInputEl()?.nativeElement.files ?? []);
    const { acceptedFiles, failedFiles } = this._filterFilesOnValueChange(files);

    if (failedFiles.length > 0) {
      this.failedUploadEvent.emit(failedFiles);
    }
    this._setValue(acceptedFiles);
  }

  //! touched event handling
  private _isFilePickerOpen = false;

  override onFocus(event: FocusEvent): void {
    if (this.disabled() || this.readonly()) return;
    if (this._isFilePickerOpen) {
      setTimeout(() => {
        this._emitTouched();
      }, 200);
    }
    this._isFilePickerOpen = false;

    super.onFocus(event);
  }
  override onBlur(event: FocusEvent): void {
    if (this.disabled() || this.readonly()) return;
    super.onBlur(event);

    this._shouldEmitTouched = !this._isFilePickerOpen;
  }

  //! helpers
  private _filterFilesOnValueChange(files: File[]): { acceptedFiles: File[]; failedFiles: FileInputFailedUpload[] } {
    const acceptedFiles: File[] = [];
    const failedFiles: FileInputFailedUpload[] = [];
    const acceptedMimeTypes = this.acceptedMimeTypes();
    if (acceptedMimeTypes) {
      let mimeTypeMatched = false;
      fileLoop: for (const file of files) {
        const { shouldAccept, reason } = this._filterFilesBasedOnSizeAndCount(file, acceptedFiles.length);
        if (!shouldAccept) {
          failedFiles.push({ file, reason: reason! });
          continue;
        }

        mimeTypeMatched = false;
        for (const mimeTypeObj of acceptedMimeTypes) {
          if (isMimeTypeMatching(file, mimeTypeObj.mimeType)) {
            mimeTypeMatched = true;

            const extension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (mimeTypeObj.extensions.size === 0 || mimeTypeObj.extensions.has('*') || mimeTypeObj.extensions.has(extension)) {
              acceptedFiles.push(file);
              continue fileLoop;
            }
          }
        }
        if (!mimeTypeMatched) {
          failedFiles.push({ file, reason: FileInputFailedUploadReason.InvalidMimeType });
        } else {
          failedFiles.push({ file, reason: FileInputFailedUploadReason.MimeTypeFoundButExtensionNotAllowed });
        }
      }
    } else {
      const accept = this.accept();
      let acceptEntries: string[] = [];
      if (Array.isArray(accept)) {
        acceptEntries = accept.map(e => e.trim().toLowerCase());
      } else {
        acceptEntries = accept.split(',').map(e => e.trim().toLowerCase());
      }
      if (typeof accept === 'string' && accept === '*') {
        for (const file of files) {
          const { shouldAccept, reason } = this._filterFilesBasedOnSizeAndCount(file, acceptedFiles.length);
          if (!shouldAccept) {
            failedFiles.push({ file, reason: reason! });
          }
        }
      } else {
        fileLoop: for (const file of files) {
          const { shouldAccept, reason } = this._filterFilesBasedOnSizeAndCount(file, acceptedFiles.length);
          if (!shouldAccept) {
            failedFiles.push({ file, reason: reason! });
            continue;
          }

          const extension = '.' + file.name.split('.').at(-1)?.toLowerCase();
          for (const entry of acceptEntries) {
            if (extension === entry) {
              acceptedFiles.push(file);
              continue fileLoop;
            }
          }
          failedFiles.push({ file, reason: FileInputFailedUploadReason.InvalidExtension });
        }
      }
    }
    return { acceptedFiles: acceptedFiles, failedFiles };
  }
  private _filterFilesBasedOnSizeAndCount(
    file: File,
    existingFileCount: number
  ): { shouldAccept: boolean; reason?: FileInputFailedUploadReason } {
    // check count
    if (existingFileCount >= this.fileLimit()) {
      return { shouldAccept: false, reason: FileInputFailedUploadReason.TooManyFiles };
    }
    // check size
    if (file.size > 0 && this.maxFileSizeBytes() !== null && file.size > this.maxFileSizeBytes()!) {
      return { shouldAccept: false, reason: FileInputFailedUploadReason.FileTooBig };
    }
    // all good
    return { shouldAccept: true };
  }
  protected _countDragenterFiles(data: DataTransfer | null): number | null {
    if (!data) return null;

    return Array.from(data.items).filter(item => item.kind === 'file').length;
  }

  protected _updateElementValue(): void {
    const v = this._valueAsArray();

    const inputEl = this.fileInputEl()?.nativeElement;
    if (!inputEl) return;
    if (!v) {
      inputEl.value = '';
      return;
    }

    const dataTransfer = new DataTransfer();
    for (const file of v) {
      dataTransfer.items.add(file);
    }
    inputEl.files = dataTransfer.files;
  }
}

function isMimeTypeMatching(file: File, mimeType: string): boolean {
  if (mimeType === '*') return true;
  if (mimeType.endsWith('/*')) {
    const prefix = mimeType.slice(0, -2);
    return file.type.startsWith(prefix);
  }
  return file.type === mimeType;
}
