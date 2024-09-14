import * as React from "react"
import { IPublicModelPluginContext } from "@alilc/lowcode-types"
import { event } from '@alilc/lowcode-engine';
import Dialog from './dialog'
import { IDiaogOptions } from "./types"

const PluginX6ErIndexes = (ctx: IPublicModelPluginContext) => {
  return {
    name: "IndexesDialog",
    exports() {
      return {
        open: (options: IDiaogOptions = {}) => {
          event.emit('indexes.openDialog', options)
        },
        close: () => {
          event.emit('indexes.closeDialog')
        },
        openLoading: () => {
          event.emit('indexes.openDialogLoading')
        },
        closeLoading: () => {
          event.emit('indexes.closeDialogLoading')
        }
      };
    },
    init() {
      ctx.skeleton.add({
        name: "IndexesDialog",
        area: "centerArea",
        type: "Widget",
        content: <Dialog />
      })
    },
  }
}

PluginX6ErIndexes.pluginName = 'IndexesDialog'
export default PluginX6ErIndexes