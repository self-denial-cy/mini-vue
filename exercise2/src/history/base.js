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
    this.current = route;
    // console.log(this.current);
    listener && listener();
    this.callback && this.callback(route);
  }

  listen(callback) {
    this.callback = callback;
  }
}

export default Base;
