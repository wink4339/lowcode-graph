import { Graph, Shape } from '@antv/x6';
import { project } from '@alilc/lowcode-engine';
import x6Designer from '../designer';
import { getShortBothPort } from './util';

export function initGraph(container: HTMLElement) {
  //@ts-ignore
  const graph = window._X6Graph = new Graph({
    container,
    // async: true, // 异步加载画布
    grid: {
      // 网格
      size: 10,
      visible: true,
      type: 'dot', // 'dot' | 'fixedDot' | 'mesh'
      args: {
        color: '#919BAE', // 网格线/点颜色
        thickness: 1, // 网格线宽度/网格点大小
      },
    },
    panning: {
      enabled: true,
      eventTypes: ['leftMouseDown']
    },
    clipboard: false,
    snapline: true, // 对齐线
    // https://github.com/antvis/X6/pull/2342 多选移动会和 sanpline 计算冲突，x6 bug 暂时不支持多选移动
    selecting: {
      enabled: true,
      rubberband: true,
      modifiers: ['shift'],
    },
    connecting: {
      snap: {
        radius: 40, // 吸附阈值
      },
      allowBlank: false, // 不允许连接到画布空白位置的点
      allowLoop: false, // 不允许创建循环连线
      allowMulti: true, // 不允许在相同的起始节点和终止之间创建多条边
      allowNode: false,
      allowEdge: true,
      allowPort: true,
      highlight: true,
      connector: "rounded",
      router: {
        name: 'er',
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#657c99',
              strokeWidth: 1,
              targetMarker: {
                name: 'block',
                size: 8,
              },
            },
          },
        });
      },
      validateEdge({ edge }) {
        const doc = project.currentDocument!;
        const contentEdge = doc.getNodeById(edge.id);
   
        const sourceCell = edge.getSourceCell();
        const targetCell = edge.getTargetCell();

        const [sourcePort, targetPort]: any = getShortBothPort(sourceCell, targetCell)
        if (sourcePort == null || targetCell == null) {
          return false
        }

        if (!contentEdge) {
          const node = doc.createNode({
            componentName: 'Line',
            title: '线',
            props: {
              name: '线',
              source: edge.getSourceCellId(),
              target: edge.getTargetCellId(),
              sourcePortId: sourcePort.id,
              targetPortId: targetPort.id
            },
          });
          const rootNode = project.currentDocument?.root;
          project.currentDocument?.insertNode(rootNode!, node);
        } else {
          contentEdge.setPropValue('source', edge.getSourceCellId());
          contentEdge.setPropValue('target', edge.getTargetCellId());
          contentEdge.setPropValue('sourcePortId', sourcePort.id);
          contentEdge.setPropValue('targetPortId', targetPort.id);
        }

        return false;
      },
    },
    onEdgeLabelRendered(args) {
      const onEdgeLabelRenderCb = x6Designer.onEdgeLabelRender();
      for (const cb of onEdgeLabelRenderCb) {
        cb(args);
      }
    }
  });

  // 适应画布
  const getContainerSize = () => {
    const width = document.querySelector('.lc-simulator-canvas')?.clientWidth || 0
    const height = document.querySelector('.lc-simulator-canvas')?.clientHeight || 0
    return {
      width: width,
      height: height,
    };
  };
  const resizeFn = () => {
    const { width, height } = getContainerSize();
    graph.resize(width, height);
  };
  window.addEventListener('resize', resizeFn);

  // 画布内容居中
  requestAnimationFrame(() => {
    resizeFn();
    graph.centerContent();
  });
  return graph;
}
