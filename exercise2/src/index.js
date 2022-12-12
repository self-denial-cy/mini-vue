import install from './install';

function createRouteMap(routes) {}

function createMatcher(routes) {
  createRouteMap(routes);

  function addRoutes() {}

  function addRoute() {}

  function match() {}

  return {
    addRoutes, // 添加多个路由
    addRoute, // 添加单个路由
    match // 传入路径获取匹配路由
  };
}

class VueRouter {
  constructor(options) {
    const routes = options.routes || [];
    //根据传入的 routes 生成映射表，方便后续操作
    this.matcher = createMatcher(routes);
  }
}

VueRouter.install = install;

export default VueRouter;
