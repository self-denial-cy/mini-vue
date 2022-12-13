import createRouteMap from './create-route-map';

export default function createMatcher(routes) {
  const { pathMap } = createRouteMap(routes);
  // 动态添加多个路由
  function addRoutes(routes) {
    createRouteMap(routes, pathMap);
    console.log(pathMap);
  }
  // 动态添加单个路由
  function addRoute(route) {
    createRouteMap([route], pathMap);
  }
  // 传入路径获取匹配路由
  function match(path) {
    return pathMap[path];
  }
  return {
    addRoutes, // 添加多个路由
    addRoute, // 添加单个路由
    match // 传入路径获取匹配路由
  };
}
