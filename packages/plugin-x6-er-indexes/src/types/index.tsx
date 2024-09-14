export enum DiaogType {
  Notice,
  Success,
  Warning,
  Error,
  Help
}

export interface IDiaogOptions {
  title?: string,
  content?: string,
  type?: DiaogType,
  onConfirm?: any,
  onCancle?: any
}