import { createElement, PureComponent } from "react";
import { workspace } from '@alilc/lowcode-engine';
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { Editor } from '@alilc/lowcode-editor-core';
import { initGraph } from "./graph/initGraph";
import { render } from "react-dom";
import { registerShape, registerConnector } from "./graph/registerShape";
import { initEvents } from "./graph/initEvents";
import { RootState } from "./items/state";
import { Graph } from "@antv/x6";
import Nodes from "./items";
import x6Designer from './designer';


interface IProps {
  editor: Editor;
  ctx: IPublicModelPluginContext;
  id: string;
  rootState: RootState;
}

export default class DesignerView extends PureComponent<IProps> {
  private container: any;
  private nodesContainer: any;

  refContainer = (container: HTMLDivElement) => {
    this.container = container;
  }

  refNodesContainer = (container: HTMLDivElement) => {
    this.nodesContainer = container;
  }

  componentDidMount() {
    registerConnector();
    registerShape();

    // @ts-ignore
    const graph = initGraph(this.container, []) as Graph;
    if (graph) {
      x6Designer.init(this.props.ctx, graph);
      initEvents(graph);

      workspace?.onChangeActiveWindow(() => {
        const {tx, ty} = graph.translate()
        if (tx != 0 || ty != 0) {
          graph.translate(0, 0)
        }
      })

      // add nodes & edges
      render(
        createElement(Nodes, {
          graph,
          rootState: this.props.rootState,
          ctx: this.props.ctx,
        }),
        this.nodesContainer
      );

    }
  }

  render() {
    const id = this.props.id
    return (
      <div className="lc-designer lowcode-plugin-designer">
        <div className="lc-project">
          <div className="lc-simulator-canvas lc-simulator-device-default">
            <div id={`design-view-${id}`} ref={this.refContainer} >
              <div id={`design-view-nodes-${id}`} ref={this.refNodesContainer}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}