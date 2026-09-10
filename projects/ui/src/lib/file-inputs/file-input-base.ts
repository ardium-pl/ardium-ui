import {
    AfterViewInit,
    computed,
    Directive,
    ElementRef,
    inject,
    Input,
    input,
    OnInit,
    output,
    signal,
    viewChild,
} from '@angular/core';
import {
    BooleanLike,
    coerceBooleanProperty,
    coerceNumberProperty,
    FileSystemMethod,
    FileSystemService,
    FileSystemStartDirectory,
} from '@ardium-pl/devkit';
import { isDefined } from 'simple-bool';
import { _FormFieldComponentBase } from '../_internal/form-field-component';
import { Nullable } from '../types/utility.types';
import { _FileInputBaseDefaults } from './file-input-base.defaults';
import { FileInputFailedUpload, FileInputFailedUploadReason, FileInputFileTypes } from './file-input-types';

@Directive()
export abstract class _FileInputComponentBase extends _FormFieldComponentBase implements OnInit, AfterViewInit {
  protected override readonly _DEFAULTS!: _FileInputBaseDefaults;

  private readonly _fileSystemService = inject(FileSystemService);

  abstract readonly componentId: string;

  readonly fileInputEl = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly name = input<string>('');

  override ngOnInit(): void {
    super.ngOnInit();
    if (!(window.File && window.FileReader && window.Blob)) {
      console.error(
        new Error(
          `ARD-FT${this.componentId}0: Cannot use Ardium UI file features because this browser does not support file handling!`
        )
      );
    }
  }
  protected _wasViewInit = false;
  ngAfterViewInit(): void {
    this._wasViewInit = true;

    this._updateElementValue();
  }

  //! appearance
  readonly compact = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  //! settings
  readonly multiple = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });
  readonly maxFiles = input<Nullable<number>, any>(null, { transform: v => coerceNumberProperty(v, null) });

  readonly maxFilesWithMultiple = computed<number>(() => (this.multiple() ? (this.maxFiles() ?? Infinity) : 1));

  readonly blockAfterUpload = input<boolean, BooleanLike>(false, { transform: v => coerceBooleanProperty(v) });

  get shouldBeBlocked(): boolean {
    return this.disabled() || this.readonly() || (this.blockAfterUpload() && isDefined(this.value));
  }

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
  protected _value: File[] | null = null;
  @Input()
  get value(): File[] | null {
    return this._value;
  }
  set value(v: File | File[] | null) {
    this.writeValue(v);
  }

  readonly valueChange = output<File[] | null>();
  readonly dragFilesEvent = output<File[]>({ alias: 'dragFiles' });
  readonly failedUploadEvent = output<FileInputFailedUpload[]>({ alias: 'failedUpload' });

  protected _valueBeforeInit: File[] | null = null;
  writeValue(v: File | File[] | null): void {
    this._writeValue(v, false);
  }
  protected _writeValue(v: File | File[] | null, emitEvents = true): void {
    if (!(v instanceof File) && !Array.isArray(v) && v !== null) {
      console.error(
        new Error(`ARD-FT${this.componentId}1: <ard-file-input>'s value must be a File, an array of Files, or null.`)
      );
      return;
    }
    if (v instanceof File) {
      v = [v];
    }
    if (Array.isArray(v) && !this.multiple() && v.length > 1) {
      console.warn(
        `ARD-WA${this.componentId}2: <ard-file-input> received an array of files but the 'multiple' input is not set to true. Only the first file will be used.`
      );
      v = [v[0]];
    }
    if (Array.isArray(v) && v.length === 0) {
      v = null;
    }

    if (v === null) {
      this.currentViewState.set('idle');
    } else {
      this.currentViewState.set('uploaded');
    }
    this._value = v;

    if (this._wasViewInit) this._updateElementValue();

    if (emitEvents) {
      this._emitChange();
    }
  }

  protected _emitChange(): void {
    const v = this.value;
    this._onChangeRegistered?.(v);
    this.valueChange.emit(v);
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
          if (!fileOrFiles) {
            this._writeValue(null);
            this.currentViewState.set('idle');
            return;
          }
          const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
          this._writeFilesToValue(files);
          this._isFilePickerOpen = false;
        });
      return;
    }
    // else use the old-school method by clicking directly on the input
    this._isFilePickerOpen = true;
    this.fileInputEl()?.nativeElement.click();
  }

  //! temporary value
  //for drag event handling
  protected _draggedFiles: number | null = null;

  //! view state
  readonly currentViewState = signal<'idle' | 'dragover' | 'uploaded'>('idle');
  private _beforeDragoverState: 'idle' | 'uploaded' = 'idle';

  //! event handlers
  onDragover(event: DragEvent): void {
    event.preventDefault();
    if (this.shouldBeBlocked) {
      if (!event.dataTransfer) return;

      event.dataTransfer.dropEffect = 'none';
      return;
    }
    if (this.currentViewState() === 'dragover') return;

    this._draggedFiles = this._countDragenterFiles(event.dataTransfer);

    if (!this._draggedFiles) return;

    this._beforeDragoverState = this.currentViewState() as 'idle' | 'uploaded';
    this.currentViewState.set('dragover');
  }
  onDragleave(): void {
    if (this.shouldBeBlocked) return;
    if (this.currentViewState() !== 'dragover') return;

    this.currentViewState.set(this._beforeDragoverState);
  }
  onDrop(event: DragEvent): void {
    event.preventDefault();

    if (this.shouldBeBlocked) return;

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
    const filteredFiles: File[] = [];
    const failedFiles: FileInputFailedUpload[] = [];
    const acceptedMimeTypes = this.acceptedMimeTypes();
    if (acceptedMimeTypes) {
      let mimeTypeMatched = false;
      fileLoop: for (const file of files) {
        const { shouldAccept, reason } = this._filterFilesBasedOnSizeAndCount(file, filteredFiles.length);
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
              filteredFiles.push(file);
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
          const { shouldAccept, reason } = this._filterFilesBasedOnSizeAndCount(file, filteredFiles.length);
          if (!shouldAccept) {
            failedFiles.push({ file, reason: reason! });
          }
        }
      } else {
        fileLoop: for (const file of files) {
          const { shouldAccept, reason } = this._filterFilesBasedOnSizeAndCount(file, filteredFiles.length);
          if (!shouldAccept) {
            failedFiles.push({ file, reason: reason! });
            continue;
          }

          const extension = '.' + file.name.split('.').at(-1)?.toLowerCase();
          for (const entry of acceptEntries) {
            if (extension === entry) {
              filteredFiles.push(file);
              continue fileLoop;
            }
          }
          failedFiles.push({ file, reason: FileInputFailedUploadReason.InvalidExtension });
        }
      }
    }

    this.dragFilesEvent.emit(filteredFiles);
    this.failedUploadEvent.emit(failedFiles);

    this.currentViewState.set('uploaded');
    this._writeValue(filteredFiles.length > 0 ? filteredFiles : null);
    this._emitTouched();
  }
  onFileInputChange(): void {
    this._isFilePickerOpen = false;
    const files = Array.from(this.fileInputEl()?.nativeElement.files ?? []);
    this._writeFilesToValue(files);
  }
  private _writeFilesToValue(files: File[]) {
    if (files.length === 0) {
      this._writeValue(null);
      this.currentViewState.set('idle');
      this._emitTouched();
      return;
    }
    this._writeValue(files);
    this.currentViewState.set('uploaded');
    this._emitTouched();
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
  private _filterFilesBasedOnSizeAndCount(
    file: File,
    existingFileCount: number
  ): { shouldAccept: boolean; reason?: FileInputFailedUploadReason } {
    // check count
    if (existingFileCount >= this.maxFilesWithMultiple()) {
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
    const v = this.value;

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
