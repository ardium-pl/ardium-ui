
export interface FileInputBrowseContext {
  browse: () => void;
}

export interface FileInputFileAmountContext extends FileInputBrowseContext {
  amount: number;
}

export interface FileInputFilesContext extends FileInputFileAmountContext {
  $implicit: File[];
  files: File[];
}

export type FileInputFileType = {
  /**
   * An optional desciption of the category of file types allowed. Default to be an empty string.
   */
  description?: string;
  /**
   * An object with the keys set to the MIME type and the values an array of file extensions (see below for an example).
   * ```ts
   * readonly FILE_TYPES = [
   *   {
   *     description: "Text file",
   *     accept: { "text/plain": [".txt"] },
   *   },
   * ];
   * ```
   */
  accept: Record<string, string[]>;
};

export type FileInputFileTypes = FileInputFileType[];

export const FileInputFailedUploadReason = {
  InvalidMimeType: 'InvalidMimeType',
  MimeTypeFoundButExtensionNotAllowed: 'MimeTypeFoundButExtensionNotAllowed',
  InvalidExtension: 'InvalidExtension',
  FileTooBig: 'FileTooBig',
  TooManyFiles: 'TooManyFiles',
} as const;
export type FileInputFailedUploadReason = typeof FileInputFailedUploadReason[keyof typeof FileInputFailedUploadReason];

export interface FileInputFailedUpload {
  file: File;
  reason: FileInputFailedUploadReason;
}