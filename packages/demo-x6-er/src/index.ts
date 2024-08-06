import { plugins, init, project } from '@alilc/lowcode-engine';
import PluginX6ErDesigner from '@wink4339/lce-graph-x6-er-designer';
import PluginErMaterialsPane from '@wink4339/lce-graph-er-materials-pane';
import PluginCore from '@alilc/lce-graph-core';
import assets from './static/assets.json';
import schema from './static/schema.json';

async function registerPlugins() {
  await plugins.register(PluginCore, {
    assets,
    schema
  });
  await plugins.register(PluginX6ErDesigner);
  await plugins.register(PluginErMaterialsPane, {
    hideLeftArea: false
  });
};

(async function main() {
  await registerPlugins();
  init()
  // init(document.getElementById('lce-container')!, {
  //   locale: 'zh-CN',
  //   enableCondition: true,
  //   enableCanvasLock: true,
  //   // 默认绑定变量
  //   supportVariableGlobally: true,
  //   requestHandlersMap: {
  //     fetch: createFetchHandler(),
  //   },
  //   appHelper,
  //   enableContextMenu: true,
  // });
})();
