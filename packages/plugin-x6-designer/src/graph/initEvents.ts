import { project, Node as Model } from '@alilc/lowcode-engine'
import { Graph, Cell } from '@antv/x6'
import { showPorts } from './util'

export const NormalStrokeColor = '#4C6079'
export const SelectedColor = '#4e7ff7'
export const HoverColor = '#dddfe6'
export const TransparentColor = 'transparent'
export const NormalNotEdgeStrokeColor = '#ffffff' 

// 初始化画布事件
export function initEvents(graph: Graph) {
  graph.on('cell:click', ({ e, x, y, cell, view }) => {
    console.log('position:', x, y)
  })

  // 增加 node:added 事件，将 ports 数据更新到 schema 中，便于保存
  graph.on('node:added',({ node }) => {
    selectedNode(graph, node)
    const nodeModel = project.currentDocument?.getNodeById(node.id) as any
    if (nodeModel) {
      nodeModel.setPropValue('ports', node.getPorts())
    }
  })

  graph.on('node:moved', ({ e, x, y, node, view }) => {
    const nodeModel = project.currentDocument?.getNodeById(node.id) as any as Model
    if (nodeModel) {
      nodeModel.setPropValue('position', node.getPosition())
    }
  })

  graph.on('edge:mousemove', ({ x, y }) => {
    graph.panning.autoPanning(x, y)
  })

  graph.on('selection:changed', (args: {
    added: Cell[]     // 新增被选中的节点/边
    removed: Cell[]   // 被取消选中的节点/边
    selected: Cell[]  // 被选中的节点/边
  }) => {
    const { selected, removed, added } = args
    var selectedIds = selected.map(cell => cell.id)
    project.currentDocument?.selection.selectAll(selectedIds)

    selected.forEach(cell => {
      if (cell.isEdge()) {
        cell.attr('line/stroke', SelectedColor)
        cell.toFront()
        var sourceNode = cell.getSourceCell()
        if (sourceNode) {
          sourceNode.toFront()
        }
        var targetNode = cell.getTargetCell()
        if (targetNode) {
          targetNode.toFront()
        }
      } else {
        cell.prop('focused', true)
        cell.attr('body/stroke', SelectedColor)
        const ports = cell.findView(graph)?.container.querySelectorAll('.x6-port-body') as NodeListOf<SVGAElement>
        if (ports) {
          showPorts(ports, true)
        }
        cell.toFront()
      }
    })

    removed.forEach(cell => {
      if (cell.isEdge()) {
        cell.attr('line/stroke', NormalStrokeColor)
        cell.toBack()
      } else {
        cell.prop('focused', false)
        cell.attr('body/stroke', TransparentColor)
      }
    })
  })

  // 鼠标按下（节点）
  graph.on('node:mousedown', function ({cell}) {
    selectedNode(graph, cell)
  })

  // 鼠标移入（节点）
  graph.on('node:mouseenter', function ({cell}) {
    if (!graph.isSelected(cell)) {
      cell.attr('body/stroke', HoverColor)
    }

    const ports = cell.findView(graph)?.container.querySelectorAll('.x6-port-body') as NodeListOf<SVGAElement>
    if (ports) {
      showPorts(ports, true)
    }
    
  })

  // 鼠标移出（节点）
  graph.on('node:mouseleave', function ({cell}) {
    if (!graph.isSelected(cell)) {
      cell.attr('body/stroke', TransparentColor)
    }

    const ports = cell.findView(graph)?.container.querySelectorAll('.x6-port-body') as NodeListOf<SVGAElement>
    if (ports) {
      showPorts(ports, false)
    }
  })

  // 鼠标按下（边）
  graph.on('edge:mousedown', function ({cell}) {
    cell.attr('line/stroke', SelectedColor)
  })
}

function selectedNode(graph: Graph, cell: any) {
  const selectedIds = graph.getSelectedCells().map((e: any) => e.id)
  if (selectedIds.some((id: any) => id === cell.id)) return
  graph.cleanSelection()
  setTimeout(() => {
    graph.select(cell)
  }, 100)
}