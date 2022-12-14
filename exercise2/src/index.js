import install from './install';
import createMatcher from './create-matcher';
import HashHistory from './history/hash';
import BrowserHistory from './history/history';

class VueRouter {
  constructor(options) {
    const routes = options.routes || [];
    //根据传入的 routes 生成映射表，方便后续操作
    this.matcher = createMatcher(routes);
    // 根据不同的模式创建对应的路由系统
    const mode = options.mode || 'hash';
    if (mode === 'hash') {
      this.history = new HashHistory(this);
    } else if (mode === 'history') {
      this.history = new BrowserHistory(this);
    }
  }
  match(location) {
    return this.matcher.match(location);
  }
  push(location) {
    this.history.transitionTo(location, () => {
      window.location.hash = location;
    });
  }
  init(app) {
    const history = this.history;
    // 根据初始路径匹配组件渲染，之后监听路由变化即可
    history.transitionTo(history.getCurrentLocation(), () => {
      // 根据路径的变化匹配对应的组件进行渲染
      history.setupListener();
    });
  }
}

VueRouter.install = install;

export default VueRouter;
