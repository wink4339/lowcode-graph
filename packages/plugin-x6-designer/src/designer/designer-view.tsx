import { createElement, PureComponent, createRef } from "react"
import { IPublicEnumTransformStage, IPublicModelPluginContext } from '@alilc/lowcode-types'
import { Editor } from '@alilc/lowcode-editor-core'
import { workspace } from '@alilc/lowcode-engine'
import { render } from "react-dom"
import { initGraph } from "../graph/initGraph"
import { initEvents } from "../graph/initEvents"
import { RootState } from "../items/state"
import PageRender from "../renderer/page"
import appHelper from "src/appHelper"

interface IProps {
  editor: Editor
  ctx: IPublicModelPluginContext
  id: string
  designer: any
  rootState: RootState
}

interface IState {
  graph: any
  schema: any
  appHelper: any
}

export class DesignerView extends PureComponent<IProps, IState> {
  readonly refContainer = createRef<HTMLDivElement>()
  readonly refNodesContainer = createRef<HTMLDivElement>()

  constructor(props: IProps) {
    super(props)
    this.state = {
      graph: null,
      schema: null, 
      appHelper: null
    };
  }

  getSchema() {
    const projectSchema = this.props.ctx.project.exportSchema(IPublicEnumTransformStage.Save);
    return projectSchema.componentsTree[0] || {};
  }

  componentDidMount() {
    const {project, config} = this.props.ctx
    const graph = initGraph(this.props.designer, this.refContainer.current as HTMLElement)
    this.props.designer.init(this.props.ctx, graph)
    initEvents(graph)
    const schema = this.getSchema()
    const appHelper = config.get('appHelper') || {}
    this.setState({graph, schema, appHelper})

    workspace?.onChangeActiveWindow(() => {
      const {tx, ty} = graph.translate()
      if (tx != 0 || ty != 0) {
        graph.translate(0, 0)
      }
    })
    project.onChangeDocument((_) => {
      this.setState((prevState) => ({
        ...prevState, 
        schema: this.getSchema() 
      }));
    })
    config.onGot('appHelper', (data) => {
      this.setState((prevState) => ({
        ...prevState, 
        appHelper: data || {}
      }));
    });
    // add nodes & edges
    // render(
    //   createElement(PageRender, {
    //     message: {},
    //     __schema: schema,
    //     __appHelper: appHelper,
    //     graph: graph,
    //     rootState: this.props.rootState,
    //     ctx: this.props.ctx,
    //     designer: this.props.designer,
    //   }),
    //   this.refNodesContainer.current
    // )
  }

  render() {
    const id = this.props.id
    const { graph, schema, appHelper} = this.state
    return (
      <div className="lc-designer lowcode-plugin-designer">
        <div className="lc-project">
          <div className="lc-simulator-canvas lc-simulator-device-default">
            <div id={`design-view-${id}`} ref={this.refContainer} >
              <div id={`design-view-nodes-${id}`} ref={this.refNodesContainer}>
                {
                  graph == null ? null : 
                  <PageRender
                    message={{}}
                    __schema={schema}
                    __appHelper={appHelper}
                    graph={graph}
                    rootState={this.props.rootState}
                    ctx={this.props.ctx}
                    designer={this.props.designer}
                  />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}