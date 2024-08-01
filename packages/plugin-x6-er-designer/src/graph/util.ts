import { FunctionExt, EdgeView, CellView, Edge, Point, Registry, Line } from '@antv/x6';

/**
 * 合并 points
 * 三个点在一条直线上的，删掉中间点
 * @param edgeView 
 * @param routerPoints 
 * @returns 
 */
export function getVertices(edgeView: EdgeView, routerPoints: Array<any>) {
  const source = edgeView.sourceAnchor;
  const target = edgeView.targetAnchor;

  const points = [source, ...routerPoints, target]
  let indexArr: any[] = [];
  if (points.length > 2) {
    for (let i = 0; i <= points.length - 3; i++) {
      const isXEqual = Math.abs(points[i].x - points[i+1].x) < 1 && Math.abs(points[i+1].x - points[i+2].x) < 1;
      const isYEqual = Math.abs(points[i].y - points[i+1].y) < 1 && Math.abs(points[i+1].y - points[i+2].y) < 1;
      if (isXEqual || isYEqual) {
        indexArr.push(i+1);
      }
    }
  }

  const newPoints = points.filter((v, index) => !(indexArr as any).includes(index));
  return newPoints;
}

/**
 * 节点 ports 显示隐藏
 * @param ports 
 * @param show 
 */
export function showPorts(ports: NodeListOf<SVGAElement>, show: boolean) {
  for (let i = 0, len = ports.length; i < len; i = i + 1) {
    ports[i].style.visibility = show ? 'visible' : 'hidden';
  }
}

/**
 * 获取节点的端口（含x, y位置）
 * @param node 
 * @returns 
 */
export function getNodePorts(node: any) {
  const position = node.position()
  const size = node.size()
  const ports = node.getPorts();
  ports.forEach((port: any) => {
    switch(port.id) {
      case 'r':
        port.x = position.x + size.width
        port.y = position.y + size.height / 2
        break
      case 'l':
        port.x = position.x
        port.y = position.y + size.height / 2
        break
      case 't':
        port.x = position.x + size.width / 2
        port.y = position.y
        break
      case 'b':
        port.x = position.x + size.width / 2
        port.y = position.y + size.height
        break
    }
  })
  return ports
}

/**
 * 获取两节点之间最近的两端口
 * @param source 源节点
 * @param target 目标节点
 */
export function getShortBothPort(source: any, target: any) {
  if (source == null || target == null) {
    return null
  }
  const sourcePorts = getNodePorts(source)
  const targetPorts = getNodePorts(target)

  let closestSourcePort = null;
  let closestTargetPort = null;
  let minDistance = Infinity;

  sourcePorts.forEach((sourcePort: any) => {
    targetPorts.forEach((targetPort: any) => {
      const distance = Math.sqrt(
        Math.pow(targetPort.x - sourcePort.x, 2) +
        Math.pow(targetPort.y - sourcePort.y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestSourcePort = sourcePort;
        closestTargetPort = targetPort;
      }
    });
  });
  if (closestSourcePort == null || closestTargetPort == null) {
    return null
  }
  return [closestSourcePort, closestTargetPort]
}


