export let Vue;

function install(_Vue) {
  Vue = _Vue; // 将传入的 Vue 保存下来

  Vue.mixin({
    beforeCreate() {
      if (this.$options.router) {
        this._routerRoot = this;
        this._router = this.$options.router;
        this._router.init(this);
        Vue.util.defineReactive(this, '_route', this._router.history.current);
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

  Object.defineProperty(Vue.prototype, '$route', {
    get() {
      return this._routerRoot && this._routerRoot._route;
    }
  });

  Vue.component('router-link', {
    props: {
      to: {
        type: String,
        required: true
      },
      tag: {
        type: String,
        default: 'a'
      }
    },
    methods: {
      handler() {
        this.$router.push(this.to);
      }
    },
    render(h) {
      return h(
        this.tag,
        {
          on: {
            click: () => {
              this.handler();
            }
          }
        },
        this.$slots.default
      );
    }
  });

  Vue.component('router-view', {
    render(h) {
      return h('div', '空');
    }
  });
}

export default install;
