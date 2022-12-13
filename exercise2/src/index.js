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
      this.history = new HashHistory();
    } else if (mode === 'history') {
      this.history = new BrowserHistory();
    }
  }
}

VueRouter.install = install;

export default VueRouter;
