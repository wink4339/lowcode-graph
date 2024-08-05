import { LceCircle } from './register/shape/lce-circle';
import { Graph, Path } from '@antv/x6';
import { LceDiamond } from './register/shape/lce-diamond';
import { LceRect } from './register/shape/lce-rect';

function registerNode(nodeName: string, node: any) {
  // 在 registerNode 前进行 unregisterNode, 防止在多资源场景下由于注册重复的 node 导致报错。
  Graph.unregisterNode(nodeName);
  Graph.registerNode(nodeName, node);
}


export function registerConnector() {
  Graph.registerConnector(
    'algo-connector',
    (s, e) => {
      const offset = 4
      const deltaX = Math.abs(e.x - s.x)
      const control = Math.floor((deltaX / 3) * 2)
  
      const v1 = { x: s.x + offset + control, y: s.y }
      const v2 = { x: e.x - offset - control, y: e.y }
  
      return Path.normalize(
        `M ${s.x} ${s.y}
         L ${s.x + offset} ${s.y}
         C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${e.x - offset} ${e.y}
         L ${e.x} ${e.y}
        `,
      )
    },
    true,
  )
}

/**
 * 注册 shape
 */
export function registerShape() {
  registerNode('lce-rect', LceRect);

  registerNode('lce-diamond', LceDiamond);

  registerNode('lce-circle', LceCircle);
}
