let Vue;

class Store {
  constructor(options) {
    const state = options.state;
    const mutations = options.mutations;
    const actions = options.actions;
    const getters = options.getters;
    // Vuex 的实现完全依赖于 Vue
    this._vm = new Vue({
      data: {
        $$state: state // 在定义 data 时，Vue 不会对带 $ _ 前缀的 key 进行代理，保证了该 key 的私有性
      }
    });
    this.mutations = mutations;
    this.actions = actions;
    // 因为在 actions 中一般会将 commit 和 dispatch 方法解构出来使用，会导致 this 指向问题，因此在这里使用箭头函数写法保证 this 始终指向 Store 实例
    this.commit = (type, payload) => {
      this.mutations[type](this.state, payload);
    };
    this.dispatch = (type, payload) => {
      this.actions[type](this, payload);
    };
  }

  get state() {
    return this._vm._data.$$state;
  }

  // commit(type, payload) {
  //   this.mutations[type](this.state, payload);
  // }

  // dispatch(type, payload) {
  //   this.actions[type](this, payload);
  // }
}

function install(_Vue) {
  Vue = _Vue;
  Vue.mixin({
    beforeCreate() {
      if (this.$options.store) {
        this.$store = this.$options.store;
      } else {
        this.$store = this.$parent && this.$parent.$store;
      }
    }
  });
}

export default {
  Store,
  install
};
