import { IPublicTypeNodeSchema, logger } from '@alilc/lowcode-engine';
import { utils } from '@alilc/lowcode-renderer-core';
import { DataSource, IBaseRendererProps, IRendererAppHelper } from '@alilc/lowcode-renderer-core/lib/types';
import { DataHelper, forEach, getI18n, getValue, isEmpty, isSchema, parseExpression, parseThisRequiredExpression } from '@alilc/lowcode-renderer-core/lib/utils';
import { isJSExpression, isJSFunction } from '@alilc/lowcode-utils';
import { create as createDataSourceEngine } from '@alilc/lowcode-datasource-engine/interpret';
import { createElement } from 'react';
import BaseRenderer from './base';
import Nodes from '../items';

/**
 * execute method in schema.lifeCycles with context
 * @PRIVATE
 */
export function executeLifeCycleMethod(context: any, schema: IPublicTypeNodeSchema, method: string, args: any, thisRequiredInJSE: boolean | undefined): any {
  if (!context || !isSchema(schema) || !method) {
    return;
  }
  const lifeCycleMethods = getValue(schema, 'lifeCycles', {});
  let fn = lifeCycleMethods[method];

  if (!fn) {
    return;
  }

  // TODO: cache
  if (isJSExpression(fn) || isJSFunction(fn)) {
    fn = thisRequiredInJSE ? parseThisRequiredExpression(fn, context) : parseExpression(fn, context);
  }

  if (typeof fn !== 'function') {
    logger.error(`生命周期${method}类型不符`, fn);
    return;
  }

  try {
    return fn.apply(context, args);
  } catch (e) {
    logger.error(`[${schema.componentName}]生命周期${method}出错`, e);
  }
}

export default class PageRender extends BaseRenderer {
  static displayName = 'PageRenderer';

  __namespace = 'page';

  __afterInit(props: IBaseRendererProps, ...rest: unknown[]) {
    // this.__generateCtx({
    //   page: this,
    // });
    const schema = props.__schema || {};
    this.state = this.__parseData(schema.state || {});
    this.__initDataSource(props);
    this.__executeLifeCycleMethod('constructor', [props, ...rest]);
  }

  async componentDidUpdate(prevProps: IBaseRendererProps, _prevState: {}, snapshot: unknown) {
    const { __ctx } = this.props;
    // 当编排的时候修改 schema.state 值，需要将最新 schema.state 值 setState
    if (JSON.stringify(prevProps.__schema.state) != JSON.stringify(this.props.__schema.state)) {
      const newState = this.__parseData(this.props.__schema.state, __ctx);
      this.setState(newState);
    }

    super.componentDidUpdate?.(prevProps, _prevState, snapshot);
  }

  setState(state: any, callback?: () => void) {
    logger.info('page set state', state);
    super.setState(state, callback);
  }

  render() {
    const { __schema, __components } = this.props;
    if (this.__checkSchema(__schema)) {
      return '页面schema结构异常！';
    }

    this.__bindCustomMethods(this.props);
    this.__initDataSource(this.props);

    return createElement(Nodes, {
      pageCtx: this,
      graph: this.props.graph,
      rootState: this.props.rootState,
      ctx: this.props.ctx,
      designer: this.props.designer,
    })
  }
}
