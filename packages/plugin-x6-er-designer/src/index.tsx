import { IPublicModelPluginContext } from '@alilc/lowcode-types'
import { RootState } from './items/state'
import { uuid } from '@antv/x6/lib/util/string/uuid'
import '@antv/x6-react-shape' // 支持自定义 react 组件
import { Designer } from './designer/designer'
import { DesignerView } from './designer/designer-view'

/**
 * plugin X6 designer
 * @param ctx 
 * @returns 
 */
const PluginX6Designer = (ctx: IPublicModelPluginContext, options: any) => {
  const id = options?.id || uuid()
  const designer = new Designer(id)
  const rootState = new RootState()
  return {
    exports() {
      return designer
    },
    init() {
      const { skeleton, project, config } = ctx
      skeleton.remove({
        name: 'designer',
        area: 'mainArea',
        type: 'Widget'
      })
      skeleton.add({
        name: 'designer',
        area: 'mainArea',
        type: 'Widget',
        content: DesignerView,
        contentProps: {
          ctx,
          id,
          designer,
          rootState,
        }
      })

      // bind nodes state
      rootState.bindNodes(project.currentDocument)

      project.onChangeDocument(() => {
        rootState.disposeDocumentEvent()
        rootState.bindNodes(project.currentDocument)
      })
    }
  }
}

PluginX6Designer.pluginName = 'plugin-x6-designer'
PluginX6Designer.meta = {
  preferenceDeclaration: {
    title: '参数定义',
    properties: [{
      key: 'id',
      type: 'string',
      description: '唯一id(默认uuid)'
    }]
  }
}
export default PluginX6Designer