function createRoute(record, location) {
  const matched = [];
  if (record) {
    while (record) {
      matched.unshift(record);
      record = record.parent;
    }
  }
  return {
    ...location,
    matched
  };
}

function runQueue(queue, from, to, callback) {
  function step(index) {
    if (index >= queue.length) return callback();
    // 拿到钩子函数
    const hook = queue[index];
    hook(from, to, (params) => {
      // 可以通过 params 判断是否继续走 step，next(false) 中断路由跳转...
      step(index + 1);
    });
  }
  step(0);
}

class Base {
  constructor(router) {
    this.router = router;
    this.current = createRoute(null, {
      path: '/'
    });
  }

  transitionTo(location, listener) {
    const record = this.router.match(location);
    const route = createRoute(record, { path: location });
    // 如果目标 path 和当前 path 相同且 matched 也相同，就不变更 current
    // 主要是为了去重和防止重复点击
    if (route.path === this.current.path && route.matched.length === this.current.matched.length) return;
    // hook 执行队列
    const queue = [].concat(this.router.beforeEachHooks);
    runQueue(queue, this.current, route, () => {
      this.current = route;
      listener && listener();
      this.callback && this.callback(route);
    });
  }

  listen(callback) {
    this.callback = callback;
  }
}

export default Base;
