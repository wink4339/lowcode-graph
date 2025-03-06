import { plugins, init, project } from '@alilc/lowcode-engine'
import PluginX6ErDesigner from '@wink4339/lce-graph-x6-er-designer'
import PluginErMaterialsPane from '@wink4339/lce-graph-er-materials-pane'
import PluginCore from '@wink4339/lce-graph-core'
import PluginGenericDialog from '@wink4339/lce-graph-generic-dialog'
import PluginX6ErIndexes from '@wink4339/lce-graph-x6-er-indexes'
import assets from './static/assets.json'
import schema from './static/schema.json'
import appHelper from './appHelper'
import './global.scss'
import './request'

async function registerPlugins() {
  await plugins.register(PluginCore, {
    assets,
    schema
  })
  await plugins.register(PluginGenericDialog)
  await plugins.register(PluginX6ErIndexes)
  await plugins.register(PluginX6ErDesigner)
  await plugins.register(PluginErMaterialsPane)
}

(async function main() {
  await registerPlugins()
  init(undefined, {
    locale: 'zh-CN',
    enableCondition: true,
    enableCanvasLock: true,
    // 默认绑定变量
    supportVariableGlobally: true,
    appHelper,
    enableContextMenu: true,
  })
})()
