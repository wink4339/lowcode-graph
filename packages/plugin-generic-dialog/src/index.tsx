import * as React from "react"
import { IPublicModelPluginContext } from "@alilc/lowcode-types"
import { event } from '@alilc/lowcode-engine';
import Dialog from './dialog'
import { IDiaogOptions } from "./types"

const PluginGenericDialog = (ctx: IPublicModelPluginContext) => {
  return {
    name: "GenericDialog",
    exports() {
      return {
        open: (options: IDiaogOptions = {}) => {
          event.emit('generic.openDialog', options)
        },
        close: () => {
          event.emit('generic.closeDialog')
        },
        openLoading: () => {
          event.emit('generic.openDialogLoading')
        },
        closeLoading: () => {
          event.emit('generic.closeDialogLoading')
        }
      };
    },
    init() {
      ctx.skeleton.add({
        name: "genericDialog",
        area: "centerArea",
        type: "Widget",
        content: <Dialog />
      })
    },
  }
}

PluginGenericDialog.pluginName = 'GenericDialog'
export default PluginGenericDialog