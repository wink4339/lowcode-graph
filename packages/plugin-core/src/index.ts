import { IPublicModelPluginContext } from '@alilc/lowcode-types'
import { AssetLoader } from '@alilc/lowcode-utils';
import Inject, { injectAssets } from '@alilc/lowcode-plugin-inject';

const PluginCore = (ctx: IPublicModelPluginContext, options: any) => {
  return {
    async init() {
      const { material, project, plugins } = ctx;
      const { assets, schema } = options

      // debug注册
      await plugins.register(Inject);

      // 设置物料描述
      await material.setAssets(await injectAssets(assets));

      // 加载 schema
      project.openDocument(schema);
      
      // 简单处理 init 时候直接 load 所有组件 view
      const loader = new AssetLoader();
      const componentsAssets = assets.packages.map((asset: any) => asset.urls).flat();
      await loader.load(componentsAssets);
    },
  }
}

PluginCore.pluginName = 'PluginCore';
PluginCore.meta = {
  preferenceDeclaration: {
    title: '参数定义',
    properties: [
      {
        key: 'resourceId',
        type: 'string',
        description: '资源id',
      },
      {
        key: 'resourceName',
        type: 'string',
        description: '资源名称',
      },
      {
        key: 'debounceDuration',
        type: 'number',
        description: '防抖持续时间',
      },
      {
        key: 'assets',
        type: 'object',
        description: '资产包',
      },
      {
        key: 'schema',
        type: 'object',
        description: 'schema 描述',
      },
    ],
  },
}
export default PluginCore;