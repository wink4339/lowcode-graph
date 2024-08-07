import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import DesignerView from './DesignerView';
import { RootState } from './items/state';
import x6Designer, { IDesigner } from './designer';
import '@antv/x6-react-shape'; // 支持自定义 react 组件
import { uuid } from '@antv/x6/lib/util/string/uuid';

/**
 * plugin X6 designer
 * @param ctx 
 * @returns 
 */
const PluginX6ErDesigner = (ctx: IPublicModelPluginContext, options: any) => {
  const {id} = options || {}
  const rootState = new RootState()
  return {
    exports() {
      return x6Designer;
    },
    init() {
      const { skeleton, project } = ctx;
      skeleton.remove({
        name: 'designer',
        area: 'mainArea',
        type: 'Widget'
      });
      skeleton.add({
        area: 'mainArea',
        name: 'designer',
        type: 'Widget',
        content: DesignerView,
        contentProps: {
          ctx,
          id: id || uuid(),
          rootState
        }
      });
      
      // bind nodes state
      rootState.bindNodes(project.currentDocument);

      project.onChangeDocument((doc) => {
        rootState.disposeDocumentEvent();
        rootState.bindNodes(project.currentDocument);
      });
    }
  }
}

PluginX6ErDesigner.pluginName = 'plugin-x6-er-designer';
PluginX6ErDesigner.meta = {
  preferenceDeclaration: {
    title: '参数定义',
    properties: [
      {
        key: 'id',
        type: 'string',
        description: '唯一id(默认uuid)',
      }
    ],
  },
}
export default PluginX6ErDesigner;
export { IDesigner };
