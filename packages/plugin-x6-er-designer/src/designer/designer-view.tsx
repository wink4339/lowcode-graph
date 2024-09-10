import { createElement, PureComponent, createRef } from "react"
import { IPublicEnumTransformStage, IPublicModelPluginContext, IPublicTypeDisposable } from '@alilc/lowcode-types'
import { Editor } from '@alilc/lowcode-editor-core'
import { workspace } from '@alilc/lowcode-engine'
import { render } from "react-dom"
import { initGraph } from "../graph/initGraph"
import { initEvents } from "../graph/initEvents"
import { RootState } from "../items/state"
import PageRender from "../renderer/page"
import "./designer.scss"

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
  appHelper: any,
  undo: boolean,
  redo: boolean
}

export class DesignerView extends PureComponent<IProps, IState> {
  readonly refContainer = createRef<HTMLDivElement>()
  readonly refNodesContainer = createRef<HTMLDivElement>()
  private history: any
  private ChangeActiveWindowDispose?: IPublicTypeDisposable
  private changeDocumentDispose?: IPublicTypeDisposable
  private changeStateDispose?: IPublicTypeDisposable
  private changeConfigAppHelperDispose?: IPublicTypeDisposable

  constructor(props: IProps) {
    super(props)
    this.state = {
      graph: null,
      schema: null, 
      appHelper: null,
      undo: false,
      redo: false
    }
  }

  getSchema() {
    const projectSchema = this.props.ctx.project.exportSchema(IPublicEnumTransformStage.Save)
    return projectSchema.componentsTree[0] || {}
  }

  handleUndoClick = () => {
    this.history.back()
  }

  handleRedoClick = () => {
    this.history.forward()
  }

  updateUndoRedoState = (state: number): void => {
    this.setState((prevState) => ({
      ...prevState, 
      undo: !!(state & 1),
      redo: !!(state & 2),
    }))
    if (this.state.graph) {
      const newSelectedIds = this.state.graph.getSelectedCells().map((e: any) => e.id)
      this.props.ctx.project.currentDocument?.selection.selectAll(newSelectedIds)
    }
  }

  componentDidMount() {
    const {project, config} = this.props.ctx
    const graph = initGraph(this.props.designer, this.refContainer.current as HTMLElement)
    this.props.designer.init(this.props.ctx, graph)
    initEvents(graph)
    const schema = this.getSchema()
    const appHelper = config.get('appHelper') || {}
    this.setState({graph, schema, appHelper})

    this.ChangeActiveWindowDispose = workspace?.onChangeActiveWindow(() => {
      const {tx, ty} = graph.translate()
      if (tx != 0 || ty != 0) {
        graph.translate(0, 0)
      }
    })
    this.changeDocumentDispose = project.onChangeDocument(doc => {
      this.setState((prevState) => ({
        ...prevState, 
        schema: this.getSchema() 
      }))

      this.history = doc.history
      this.updateUndoRedoState(this.history?.getState() || 0)
      this.changeStateDispose?.()
      this.changeStateDispose = this.history.onChangeState(() => {
        this.updateUndoRedoState(this.history?.getState() || 0)
      })
    })
    this.changeConfigAppHelperDispose = config.onGot('appHelper', (data) => {
      this.setState((prevState) => ({
        ...prevState, 
        appHelper: data || {}
      }))
    })
  }

  componentWillUnmount() {
    this.ChangeActiveWindowDispose?.()
    this.changeDocumentDispose?.()
    this.changeStateDispose?.()
    this.changeConfigAppHelperDispose?.()
  }

  render() {
    const id = this.props.id
    const { graph, schema, appHelper, undo, redo} = this.state
    return (
      <div className="lc-designer lowcode-plugin-designer">
        <div className="lc-project">
          <div className="lc-simulator-canvas lc-simulator-device-default">
            <div className="design-view-undo-redo-wrapper">
              <span className={undo ? '' : 'diabled'} aria-haspopup="true" aria-expanded="false" onClick={this.handleUndoClick}></span>
              <span className={redo ? '' : 'diabled'} aria-haspopup="true" aria-expanded="false" onClick={this.handleRedoClick}></span>
            </div>
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