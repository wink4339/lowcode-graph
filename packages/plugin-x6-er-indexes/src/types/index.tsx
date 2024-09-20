export enum DiaogType {
  Notice,
  Success,
  Warning,
  Error,
  Help
}

export interface IDiaogOptions {
  entityId?: any,
  columns?: any,
  indexes?: string,
  onConfirm?: any,
  onCancle?: any
}