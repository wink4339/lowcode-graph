import { IPublicTypeNodeSchema, logger, event as engineEvent } from '@alilc/lowcode-engine';
import { utils } from '@alilc/lowcode-renderer-core';
import { DataSource, IBaseRendererProps, IRendererAppHelper } from '@alilc/lowcode-renderer-core/lib/types';
import { capitalizeFirstLetter, DataHelper, forEach, getI18n, getValue, isEmpty, isSchema, parseExpression, parseThisRequiredExpression } from '@alilc/lowcode-renderer-core/lib/utils';
import { isJSExpression, isJSFunction } from '@alilc/lowcode-utils';
import { create as createDataSourceEngine } from '@alilc/lowcode-datasource-engine/interpret';
import { createContext, createElement, PureComponent } from 'react';

const {parseData} = utils

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

const AppContext = createContext({})

export default class BaseRenderer extends PureComponent<IBaseRendererProps> {
  [key: string]: any;

  static displayName = 'BaseRenderer';

  static defaultProps = {
    __schema: {},
  };

  i18n: any;
  getLocale: any;
  setLocale: any;
  dataSourceMap: Record<string, any> = {};

  engineEvent: any;

  __namespace = 'base';
  __compScopes: Record<string, any> = {};
  __instanceMap: Record<string, any> = {};
  __dataHelper: any;

  /**
   * keep track of customMethods added to this context
   *
   * @type {any}
   */
  __customMethodsList: any[] = [];
  __parseExpression: any;
  __ref: any;

  constructor(props: IBaseRendererProps) {
    super(props);
    this.__parseExpression = (str: string, self: any) => {
      return parseExpression({ str, self, thisRequired: props?.thisRequiredInJSE, logScope: props.componentName });
    };
    this.__beforeInit(props);
    this.__init(props);
    this.__afterInit(props);
    this.__debug(`constructor - ${props?.__schema?.fileName}`);
    this.engineEvent = engineEvent;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __beforeInit(_props: IBaseRendererProps) { }

  __init(props: IBaseRendererProps) {
    this.__compScopes = {};
    this.__instanceMap = {};
    this.__bindCustomMethods(props);
    this.__initI18nAPIs();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __afterInit(_props: IBaseRendererProps) { }


  static getDerivedStateFromProps(props: IBaseRendererProps, state: any) {
    const result = executeLifeCycleMethod(this, props?.__schema, 'getDerivedStateFromProps', [props, state], props.thisRequiredInJSE);
    return result === undefined ? null : result;
  }

  async getSnapshotBeforeUpdate(...args: any[]) {
    this.__executeLifeCycleMethod('getSnapshotBeforeUpdate', args);
    this.__debug(`getSnapshotBeforeUpdate - ${this.props?.__schema?.fileName}`);
  }

  async componentDidMount(...args: any[]) {
    this.reloadDataSource();
    this.__executeLifeCycleMethod('componentDidMount', args);
    this.__debug(`componentDidMount - ${this.props?.__schema?.fileName}`);
  }

  async componentDidUpdate(...args: any[]) {
    this.__executeLifeCycleMethod('componentDidUpdate', args);
    this.__debug(`componentDidUpdate - ${this.props.__schema.fileName}`);
  }

  async componentWillUnmount(...args: any[]) {
    this.__executeLifeCycleMethod('componentWillUnmount', args);
    this.__debug(`componentWillUnmount - ${this.props?.__schema?.fileName}`);
  }

  async componentDidCatch(...args: any[]) {
    this.__executeLifeCycleMethod('componentDidCatch', args);
    logger.warn(args);
  }

  reloadDataSource = () => new Promise((resolve, reject) => {
    this.__debug('reload data source');
    if (!this.__dataHelper) {
      return resolve({});
    }
    this.__dataHelper.getInitData()
      .then((res: any) => {
        if (isEmpty(res)) {
          this.forceUpdate();
          return resolve({});
        }
        this.setState(res, resolve as () => void);
      })
      .catch((err: Error) => {
        reject(err);
      });
  });

  shouldComponentUpdate() {
    if (this.props.getSchemaChangedSymbol?.() && this.props.__container?.rerender) {
      this.props.__container?.rerender();
      return false;
    }
    return true;
  }

  forceUpdate() {
    if (this.shouldComponentUpdate()) {
      super.forceUpdate();
    }
  }

  /**
   * execute method in schema.lifeCycles
   * @PRIVATE
   */
  __executeLifeCycleMethod = (method: string, args?: any) => {
    executeLifeCycleMethod(this, this.props.__schema, method, args, this.props.thisRequiredInJSE);
  };

  __bindCustomMethods = (props: IBaseRendererProps) => {
    const { __schema } = props;
    const customMethodsList = Object.keys(__schema.methods || {}) || [];
    (this.__customMethodsList || []).forEach((item: any) => {
      if (!customMethodsList.includes(item)) {
        delete this[item];
      }
    });
    this.__customMethodsList = customMethodsList;
    forEach(__schema.methods, (val: any, key: string) => {
      let value = val;
      if (isJSExpression(value) || isJSFunction(value)) {
        value = this.__parseExpression(value, this);
      }
      if (typeof value !== 'function') {
        logger.error(`custom method ${key} can not be parsed to a valid function`, value);
        return;
      }
      this[key] = value.bind(this);
    });
  };

  __generateCtx = (ctx: Record<string, any>) => {
    const { pageContext, compContext } = this.context;
    const obj = {
      page: pageContext,
      component: compContext,
      ...ctx,
    };
    forEach(obj, (val: any, key: string) => {
      this[key] = val;
    });
  };

  __parseData = (data: any, ctx?: Record<string, any>) => {
    const { __ctx, thisRequiredInJSE, componentName } = this.props;
    return parseData(data, ctx || __ctx || this, { thisRequiredInJSE, logScope: componentName });
  };

  __initDataSource = (props: IBaseRendererProps) => {
    if (!props) {
      return;
    }
    const schema = props.__schema || {};
    const defaultDataSource: DataSource = {
      list: [],
    };
    const dataSource = schema.dataSource || defaultDataSource;
    // requestHandlersMap 存在才走数据源引擎方案
    // TODO: 下面if else 抽成独立函数
    const useDataSourceEngine = !!(props.__appHelper?.requestHandlersMap);
    if (useDataSourceEngine) {
      this.__dataHelper = {
        updateConfig: (updateDataSource: any) => {
          const { dataSourceMap, reloadDataSource } = createDataSourceEngine(
            updateDataSource ?? {},
            this,
            props.__appHelper.requestHandlersMap ? { requestHandlersMap: props.__appHelper.requestHandlersMap } : undefined,
          );

          this.reloadDataSource = () => new Promise((resolve) => {
            this.__debug('reload data source');
            reloadDataSource().then(() => {
              resolve({});
            });
          });
          return dataSourceMap;
        },
      };
      this.dataSourceMap = this.__dataHelper.updateConfig(dataSource);
    } else {
      const appHelper = props.__appHelper;
      this.__dataHelper = new DataHelper(this, dataSource, appHelper, (config: any) => this.__parseData(config));
      this.dataSourceMap = this.__dataHelper.dataSourceMap;
      this.reloadDataSource = () => new Promise((resolve, reject) => {
        this.__debug('reload data source');
        if (!this.__dataHelper) {
          return resolve({});
        }
        this.__dataHelper.getInitData()
          .then((res: any) => {
            if (isEmpty(res)) {
              return resolve({});
            }
            this.setState(res, resolve as () => void);
          })
          .catch((err: Error) => {
            reject(err);
          });
      });
    }
  };

  /**
   * init i18n apis
   * @PRIVATE
   */
  __initI18nAPIs = () => {
    this.i18n = (key: string, values = {}) => {
      const { locale, messages } = this.props;
      return getI18n(key, values, locale, messages);
    };
    this.getLocale = () => this.props.locale;
    this.setLocale = (loc: string) => {
      const setLocaleFn = this.appHelper?.utils?.i18n?.setLocale;
      if (!setLocaleFn || typeof setLocaleFn !== 'function') {
        logger.warn('initI18nAPIs Failed, i18n only works when appHelper.utils.i18n.setLocale() exists');
        return undefined;
      }
      return setLocaleFn(loc);
    };
  };

  $(filedId: string, instance?: any) {
    this.__instanceMap = this.__instanceMap || {};
    if (!filedId || typeof filedId !== 'string') {
      return this.__instanceMap;
    }
    if (instance) {
      this.__instanceMap[filedId] = instance;
    }
    return this.__instanceMap[filedId];
  }

  __debug = (...args: any[]) => { logger.debug(...args); };

  __renderContextProvider = (customProps?: object, children?: any) => {
    return createElement(AppContext.Provider, {
      value: {
        ...this.context,
        blockContext: this,
        ...(customProps || {}),
      },
      children: children || this.__createDom(),
    });
  };

  __renderContextConsumer = (children: any) => {
    return createElement(AppContext.Consumer, {}, children);
  };

  __checkSchema = (schema: IPublicTypeNodeSchema | undefined, originalExtraComponents: string | string[] = []) => {
    let extraComponents = originalExtraComponents;
    if (typeof extraComponents === 'string') {
      extraComponents = [extraComponents];
    }

    const builtin = capitalizeFirstLetter(this.__namespace);
    const componentNames = [builtin, ...extraComponents];
    return !isSchema(schema) || !componentNames.includes(schema?.componentName ?? '');
  };

  get appHelper(): IRendererAppHelper {
    return this.props.__appHelper;
  }

  get requestHandlersMap() {
    return this.appHelper?.requestHandlersMap;
  }

  get utils() {
    return this.appHelper?.utils;
  }

  get constants() {
    return this.appHelper?.constants;
  }

  get history(): any {
    return this.appHelper?.history;
  }

  get location() {
    return this.appHelper?.location;
  }

  get match() {
    return this.appHelper?.match;
  }

  render() {
    return null;
  }
}
