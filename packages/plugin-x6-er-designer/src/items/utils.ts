import { Node } from '@antv/x6'
import { Node as NodeModel } from '@alilc/lowcode-shell'
import { material } from '@alilc/lowcode-engine'
import { get } from 'lodash'
import { isJSExpression, isJSFunction } from '@alilc/lowcode-utils';
import {  parseExpression } from '@alilc/lowcode-renderer-core/lib/utils';

export const getComponentView = (nodeModel: NodeModel) => {
  const { componentName } = nodeModel
  const global: any = window
  const assets = material.getAssets()
  const componentMeta = material.getComponentMeta(componentName)

  if (!componentMeta || !componentMeta.npm) {
    console.error(`${componentName} is not a npm component`)
    return null
  }

  const { package: componentPackage, destructuring, exportName } = componentMeta.npm

  const library = assets.packages.find((item: any) => item.package === componentPackage).library

  if (!library) {
    console.error(`${componentName} library is not defined`)
    return null
  }

  if (destructuring && exportName) {
    return typeof global[library][exportName] === 'function' ? global[library][exportName]() : global[library][exportName]
  }

  return typeof global[library] === 'function' ? global[library]() : global[library]
}

export function getPropList(model: NodeModel) {
  const propsData = model.propsData || {}

  let propsList = []
  for(let k in propsData) {
    // @ts-ignore
    propsList.push({name: k, value: propsData[k]})
  }
  return propsList
}

export function updateNodeProps(model: NodeModel, node: Node, pageCtx: any) {
  const propList = getPropList(model) || []
  propList.forEach(item => {
    if (item.name === undefined) {
      return
    } 
    let value = deepClone(item.value)
    if (item.name === 'fields') {
      node.resize(192, ((value && value.length || 0) * 32 + (value && value.length ? 44 : 76)))
    }
    if (value && (isJSExpression(value) || isJSFunction(value))) {
      value = parseExpression(value, pageCtx);
    }
    console.log("value: ", value)
    node.prop(item.name, value)
  })
}

export const deepClone = (obj: any) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj
  }
  return JSON.parse(JSON.stringify(obj))
}