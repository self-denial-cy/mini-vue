// 将 routes 扁平化
export default function createRouteMap(routes, pathMap) {
  pathMap = pathMap || {};
  routes.forEach((route) => {
    addRouteRecord(route, pathMap);
  });
  return {
    pathMap
  };
}

function addRouteRecord(route, pathMap, parentRecord) {
  // 这里暂时不考虑子路由 path 以 / 开头的情况，也不考虑路径参数的情况
  const path = parentRecord ? `${parentRecord.path === '/' ? '/' : `${parentRecord.path}/`}${route.path}` : route.path;
  const record = {
    name: route.name,
    path: path,
    component: route.component, // meta、props、hooks 等路由信息
    parent: parentRecord || null
  };
  if (!pathMap[path]) {
    pathMap[path] = record;
  }
  route.children &&
    route.children.forEach((childRoute) => {
      addRouteRecord(childRoute, pathMap, record);
    });
}
