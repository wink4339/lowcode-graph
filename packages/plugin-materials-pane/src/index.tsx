import * as React from "react";
import { IPublicModelPluginContext } from "@alilc/lowcode-types";
import Pane from "./pane";

const Icon = <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1413" width="32" height="32"><path d="M768 928H128a32 32 0 0 1-32-32V256a32 32 0 0 1 32-32h195.84A132.48 132.48 0 0 1 320 192a128 128 0 0 1 256 0 132.48 132.48 0 0 1-3.84 32H768a32 32 0 0 1 32 32v195.84A132.48 132.48 0 0 1 832 448a128 128 0 0 1 0 256 132.48 132.48 0 0 1-32-3.84V896a32 32 0 0 1-32 32z m-608-64h576v-216.96a32.64 32.64 0 0 1 19.2-29.44 32.64 32.64 0 0 1 33.92 5.76 64 64 0 1 0 0-94.72 31.36 31.36 0 0 1-33.92 5.76 32.64 32.64 0 0 1-19.2-29.44V288H519.04a32.64 32.64 0 0 1-29.44-19.2 31.36 31.36 0 0 1 5.76-33.92 64 64 0 1 0-94.72 0 31.36 31.36 0 0 1 5.76 33.92 32.64 32.64 0 0 1-29.44 19.2H160z" fill="#4D4D4D" p-id="1414"></path></svg>
const PluginMaterialsPane = (ctx: IPublicModelPluginContext, options: any) => {
  const {hideLeftArea} = options || {}
  return {
    name: "LoginActionPane",
    init() {
      const title = '逻辑流行为'
      ctx.skeleton.add({
        name: "logicActionPane",
        area: "leftArea",
        type: "PanelDock",
        content: <Pane material={ctx.material} dragon={ctx.canvas.dragon} project={ctx.project} event={ctx.event} />,
        props: {
          align: "left",
          icon: Icon,
          description: title,
        },
        panelProps: {
          area: 'leftFixedArea',
          floatable: true,
          hideTitleBar: true,
          title: title,
          width: 194,
        },
      });

      if (hideLeftArea) {
        ctx.skeleton.hideArea("leftArea")
      }
      ctx.skeleton.showPanel('logicActionPane');
    },
  };
};

PluginMaterialsPane.pluginName = 'plugin-materials-pane';
PluginMaterialsPane.meta = {
  preferenceDeclaration: {
    title: '参数定义',
    properties: [
      {
        key: 'hideLeftArea',
        type: 'boolean',
        description: '隐藏左侧操作栏',
      }
    ],
  },
}

export default PluginMaterialsPane;