import { Graph, Node } from '@antv/x6'
import React from 'react'
import { Node as NodeModel } from '@alilc/lowcode-shell'
import { deepClone, getComponentView, updateNodeProps } from '../utils'
import { IPublicTypePropChangeOptions } from '@alilc/lowcode-types'
import { globalContext, Hotkey as InnerHotkey } from '@alilc/lowcode-editor-core';
import { Designer } from '../../designer/designer'
import { isJSExpression, isJSFunction } from '@alilc/lowcode-utils';
import {  parseExpression } from '@alilc/lowcode-renderer-core/lib/utils';

interface Props {
  onMountNode: (node: Node) => void
  onUnMountNode: (node: Node) => void

  pageCtx: any,
  graph: Graph
  model: NodeModel
  ctx: any,
  designer: Designer
}

/**
 * node component for x6 node render
 */
class NodeComponent extends React.PureComponent<Props> {
  private node!: Node
  // 节点区分是否有自定义html渲染
  private nodeDefinedType!: 'shape' | 'component'

  componentDidMount() {
    // 添加节点
    const { pageCtx, model, graph, ctx, designer } = this.props
    const { project } = ctx
    const view = getComponentView(model)
    this.nodeDefinedType = view?.component ? 'component' : 'shape'
    // 基于 Schema 数据恢复节点，保持 id 和 ports 一致
    this.node = graph.createNode({
      designerId: designer.getId(),
      id: model.id,
      ports: model.propsData.ports,
      ...view,
    })

    // 收集 node 统一添加到画布
    this.props.onMountNode(this.node)

    // @ts-ignore
    const { position } = model.propsData
    // 定位
    this.node.setPosition(position)
    // 加载自定义节点渲染逻辑
    const onNodeRenderCb = this.props.designer.onNodeRender()

    // 用户自定义渲染逻辑切面
    if (this.nodeDefinedType === 'shape' && onNodeRenderCb.length > 0) {
      for (const cb of onNodeRenderCb) {
        cb(model, this.node)
      }
    } else {
      updateNodeProps(model, this.node, pageCtx)
    }

     // model 更新触发渲染
     project.currentDocument?.onChangeNodeProp((options: IPublicTypePropChangeOptions) => {
      if (options.node.id !== model.id || options.key == undefined) {
        return
      }
      const newValue = deepClone(options.newValue)

      if (options.key === 'position') {
        this.node.setPosition(newValue)
        return
      }

      if (options.key === 'fields') {
        this.node.resize(192, ((newValue && newValue.length || 0) * 32 + (newValue && newValue.length ? 44 : 76)))
      }

      // 用户自定义渲染逻辑切面
      if (this.nodeDefinedType === 'shape' && onNodeRenderCb.length > 0) {
        for (const cb of onNodeRenderCb) {
          cb(model, this.node)
        }
      } else {
        const kv =  getUpdateKV(options.key, newValue, options.prop)
        if (kv !== undefined) {
          let value = kv[1]
          if (value && isJSExpression(value) || isJSFunction(value)) {
            value = parseExpression(value, pageCtx);
          }
          this.node.prop(kv[0], value)
        }
      }
    })
  }

  componentWillUnmount() {
    // 删除节点
    this.props.onUnMountNode(this.node)
  }

  render() {
    return null
  }
}

const getUpdateKV = (key: string | number, value: any, props: any) => {
  if (props === undefined || props.path === undefined || props.path.length == 0 || key === props.path[0]) {
    return [key, value]
  }
  return undefined
}

export default NodeComponent

