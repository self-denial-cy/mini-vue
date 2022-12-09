export let Vue;

class VueRouter {
  constructor(options) {}
}

VueRouter.install = function (_Vue) {
  Vue = _Vue; // 将传入的 Vue 保存下来，供其它模块使用
};

export default VueRouter;
