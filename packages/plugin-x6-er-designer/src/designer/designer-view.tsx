import { createElement, PureComponent, createRef } from "react"
import { IPublicEnumTransformStage, IPublicModelPluginContext, IPublicTypeDisposable } from '@alilc/lowcode-types'
import { Editor } from '@alilc/lowcode-editor-core'
import { workspace, event } from '@alilc/lowcode-engine'
import { render } from "react-dom"
import { Balloon } from '@alifd/next';
import { initGraph } from "../graph/initGraph"
import { initEvents } from "../graph/initEvents"
import { RootState } from "../items/state"
import PageRender from "../renderer/page"
import "./designer.scss"

const Tooltip = Balloon.Tooltip

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
  redo: boolean,
  remove: boolean,
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
      redo: false,
      remove: false,
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

  handleRemoveClick = () => {
    const selectedIds = this.state.graph.getSelectedCells().map((e: any) => e.id)
    selectedIds.forEach((id: any) => {
      this.handleDelete(id)
    });
   
  }

  handleDelete = (nodeId: any) => {
    const {ctx} = this.props
    const node = ctx.project.currentDocument?.getNodeById(nodeId) as any
    const isNode = node?.componentMeta?.getMetadata().tags?.includes('node')
    if (!isNode) {
      ctx.project.currentDocument?.removeNode(node.id)
      return
    } 
    ctx.plugins.GenericDialog.open({
      content: '确认删除该实体？请处理与该实体绑定的页面和逻辑流。',
      onConfirm: () => {
        const allNodes = Array.from(ctx.project.currentDocument?.nodesMap.values() || [])
        // 相关线
        const lines = allNodes.filter(n => (n?.componentMeta?.getMetadata().tags?.includes('edge') && (n.getPropValue('source') === node.id || n.getPropValue('target') === node.id)))
        lines.forEach(line => {
          ctx.project.currentDocument?.removeNode(line.id)
        })
        ctx.project.currentDocument?.removeNode(node.id)
        ctx.plugins.GenericDialog.close()
      }
    })
  }

  handleAddNewNode = (node: any) => {

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

  updateRemoveState = () => {
    const selectedCells = this.state.graph.getSelectedCells()
    this.setState((prevState) => ({
      ...prevState, 
      remove: selectedCells && selectedCells.length || false,
    }))
  }

  componentDidMount() {
    const {project, config, plugins} = this.props.ctx
    const graph = initGraph(this.props.designer, this.refContainer.current as HTMLElement)
    this.props.designer.init(this.props.ctx, graph)
    initEvents(graph)
    const schema = this.getSchema()
    const appHelper = config.get('appHelper') || {}
    this.setState({graph, schema, appHelper})

    graph.on('cell:selected', this.updateRemoveState)
    graph.on('cell:unselected', this.updateRemoveState)

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
    event.on(`common:x6ErMaterials:${this.props.id}`, this.bindEvent)
  }

  bindEvent = (params: any) => {
    switch(params.action) {
      case 'copy':
        break
      case 'indexes':
        break
      case 'delete': 
        this.handleDelete(params.id)
        break
    }
  }

  componentWillUnmount() {
    this.ChangeActiveWindowDispose?.()
    this.changeDocumentDispose?.()
    this.changeStateDispose?.()
    this.changeConfigAppHelperDispose?.()
    event.off(`common:x6ErMaterials:${this.props.id}`, this.bindEvent)
  }

  render() {
    const id = this.props.id
    const { graph, schema, appHelper, undo, redo, remove} = this.state
    return (
      <div className="lc-designer lowcode-plugin-designer">
        <div className="lc-project">
          <div className="lc-simulator-canvas lc-simulator-device-default">
            <div className="design-view-undo-redo-wrapper">
              <Tooltip v2 trigger={<span className={undo ? 'undo' : 'undo diabled'}  onClick={this.handleUndoClick} />}>
                撤销
              </Tooltip>
              <Tooltip v2 trigger={<span className={redo ? 'redo' : 'redo diabled'} onClick={this.handleRedoClick} />}>
                恢复
              </Tooltip>
              <Tooltip v2 trigger={<span className={remove ? 'remove' : 'remove diabled'} onClick={this.handleRemoveClick} />}>
                删除
              </Tooltip>
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