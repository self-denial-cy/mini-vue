import Base from './base';

function ensureSlash() {
  if (window.location.hash) {
    return;
  }
  window.location.hash = '/'; // 没有 hash 路径时，默认设置 /
}

function getHash() {
  return window.location.hash.slice(1);
}

class HashHistory extends Base {
  constructor(router) {
    super(router);
    // 初始化 hash 路由系统时，给定一默认 hash 路径 /
    ensureSlash();
  }

  // 设置监听 hash 值的变化
  setupListener() {
    // hashchange 或者 popstate 事件都可以捕获到 hash 的变化
    window.addEventListener('hashchange', () => {
      this.transitionTo(getHash());
    });
  }

  getCurrentLocation() {
    return getHash();
  }
}

export default HashHistory;
