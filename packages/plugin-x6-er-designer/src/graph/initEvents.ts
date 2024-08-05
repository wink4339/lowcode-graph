import { rootState } from '../items/state';
import { project, Node as Model } from '@alilc/lowcode-engine';
import { FunctionExt, Graph, Node, Point, EdgeView, Edge, Cell } from '@antv/x6';
import { getShortBothPort, showPorts } from './util';

export const NormalStrokeColor = '#4C6079';
export const SelectedStrokeColor = '#4e7ff7';
export const NormalNotEdgeStrokeColor = "#ffffff";

// 初始化画布事件
export function initEvents(graph: Graph) {
  graph.on('cell:click', ({ e, x, y, cell, view }) => {
    console.log('position:', x, y);
  });

  // 增加 node:added 事件，将 ports 数据更新到 schema 中，便于保存
  graph.on('node:added', ({ node, index, options }) => {
    const nodeModel = project.currentDocument?.getNodeById(node.id) as any as Model;
    if (nodeModel) {
      nodeModel.setPropValue('ports', node.getPorts());
    }
  });

  graph.on('node:moved', ({ e, x, y, node, view }) => {
    const nodeModel = project.currentDocument?.getNodeById(node.id) as any as Model;
    if (nodeModel) {
      nodeModel.setPropValue('position', node.getPosition());
    }
  });

  graph.on('edge:mousemove', ({ x, y }) => {
    graph.panning.autoPanning(x, y);
  });


  graph.on('selection:changed', (args: {
    added: Cell[]     // 新增被选中的节点/边
    removed: Cell[]   // 被取消选中的节点/边
    selected: Cell[]  // 被选中的节点/边
  }) => {
    const { selected, removed, added } = args;
    const selectedIds = selected.map(cell => cell.id);
    const oldSelectedIds = project.currentDocument?.selection.getNodes().filter(e => e.id) || []
    const newSelectedIds = selectedIds.filter(id => !oldSelectedIds.includes(id as any))
    if (newSelectedIds.length > 0) {
      project.currentDocument?.selection.selectAll(newSelectedIds);
    }

    selected.forEach(cell => {
      if (cell.isEdge()) {
        cell.attr('line/stroke', SelectedStrokeColor);
        cell.toFront()
        const sourceNode = cell.getSourceCell();
        if (sourceNode) {
          sourceNode.toFront();
        }
        const targetNode = cell.getTargetCell();
        if (targetNode) {
          targetNode.toFront();
        }
      }
    });

    removed.forEach(cell => {
      if (cell.isEdge()) {
        cell.attr('line/stroke', NormalStrokeColor);
        cell.toBack();
      } else {
        const nodeModel = project.currentDocument?.getNodeById(cell.id) as any as Model;
        if (nodeModel) {
          nodeModel.setPropValue('focused', false)
        }
      }
    });
  });

  // 位置变化（节点）
  graph.on('node:change:position', ({ node }) => {
    const connectedEdges = graph.getConnectedEdges(node)
    connectedEdges.forEach(edge => {
      const sourceCell = edge.getSourceCell();
      const targetCell = edge.getTargetCell();

      const [sourcePort, targetPort]: any = getShortBothPort(sourceCell, targetCell)
      edge.setSource({ cell: edge.getSourceCellId(), port: sourcePort.id })
      edge.setTarget({ cell: edge.getTargetCellId(), port: targetPort.id })
    })
  })

  // 鼠标按下（节点）
  graph.on('node:mousedown', ({ cell }) => {
    graph.cleanSelection();
    const nodeModel = project.currentDocument?.getNodeById(cell.id) as any as Model;
    if (nodeModel) {
      nodeModel.setPropValue('focused', true)
    }
    cell.toFront()
  });

  // 鼠标松开（节点）
  graph.on('node:mouseup', ({ cell }) => {
    graph.select(cell);
  });

  // 鼠标移入（节点）
  graph.on('node:mouseenter', ({ cell }) => {
    const ports = cell.findView(graph)?.container.querySelectorAll('.x6-port-body') as NodeListOf<SVGAElement>;
    if (ports) {
      showPorts(ports, true);
    }
  });

  // 鼠标移出（节点）
  graph.on('node:mouseleave', ({ cell }) => {
    const ports = cell.findView(graph)?.container.querySelectorAll('.x6-port-body') as NodeListOf<SVGAElement>;
    if (ports) {
      showPorts(ports, false);
    }
  });

  // 鼠标按下（边）
  graph.on('edge:mousedown', ({ cell }) => {
    cell.attr('line/stroke', SelectedStrokeColor);
  });
}
