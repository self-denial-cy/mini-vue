export let Vue;

function install(_Vue) {
  Vue = _Vue; // 将传入的 Vue 保存下来

  Vue.mixin({
    beforeCreate() {
      if (this.$options.router) {
        this._routerRoot = this;
        this._router = this.$options.router;
      } else {
        this._routerRoot = this.$parent && this.$parent._routerRoot;
      }
    }
  });

  Object.defineProperty(Vue.prototype, '$router', {
    get() {
      return this._routerRoot && this._routerRoot._router;
    }
  });

  Vue.component('router-link', {
    render(h) {
      return h('a', this.$slots.default);
    }
  });

  Vue.component('router-view', {
    render(h) {
      return h('div', '空');
    }
  });
}

export default install;
