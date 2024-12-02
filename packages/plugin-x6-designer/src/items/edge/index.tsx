import { Graph, Edge } from '@antv/x6';
import React from 'react';
import { Node as NodeModel } from '@alilc/lowcode-shell';
import { getComponentView, updateNodeProps } from '../utils';
import { Designer } from '../../designer/designer';
import { IPublicTypePropChangeOptions } from '@alilc/lowcode-types';

interface Props {
  onMountEdge: (edge: Edge) => void;
  onUnMountEdge: (edge: Edge) => void;

  pageCtx: any,
  graph: Graph;
  model: NodeModel;
  ctx: any;
  designer: Designer
}

/**
 * edge component for x6 edge render
 */
class EdgeComponent extends React.PureComponent<Props> {
  private edge!: Edge;

  componentDidMount() {
    const { pageCtx, model, graph, ctx, designer } = this.props;
    const { project } = ctx;

    // 创建 edge
    const view = getComponentView(model);
    this.edge = graph.createEdge({
      designerId: designer.getId(),
      id: model.id,
      ...view
    });

    // 收集 edge 统一添加到画布
    this.props.onMountEdge(this.edge);

    // set edge vertices
    // @ts-ignore
    const { source, target } = model.propsData;

    // set source & target
    this.edge.setSource({ cell: source });
    this.edge.setTarget({ cell: target });

    // 渲染逻辑切面
    const onEdgeRender = this.props.designer.onEdgeRender();
    // 渲染逻辑切面
    for (const cb of onEdgeRender) {
      cb(model, this.edge);
    }

    // model 更新渲染
    project.currentDocument?.onChangeNodeProp((options: IPublicTypePropChangeOptions) => {
      if (options.node.id !== model.id || options.key == undefined) {
        return
      }

      if (options.key === 'source') {
        this.edge.setSource({ cell: options.newValue });
      }

      if (options.key === 'target') {
        this.edge.setTarget({ cell: options.newValue });
      }

      // 用户自定义渲染逻辑切面
      for (const cb of onEdgeRender) {
        cb(model, this.edge);
      }
    });
  }

  componentWillUnmount() {
    // 删除节点
    this.props.onUnMountEdge(this.edge);
  }

  render() {
    return null;
  }
}

export default EdgeComponent;

