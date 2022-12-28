import install, { Vue } from './install';
import ModuleCollection from './module/module-collection';
import { forEachValue } from './utils';

function installModule(store, rootState, path, rootModule) {
  if (path.length > 0) {
    // 只有是子模块的情况，才考虑将子模块的状态定义在根模块上
    const parent = path.slice(0, -1).reduce((start, current) => {
      return start[current];
    }, rootState);
    parent[path[path.length - 1]] = rootModule.state;
  }
  const namespace = store._modules.getNamespace(path);
  console.log(namespace);
  rootModule.forEachMutation((mutationKey, mutation) => {
    store._mutations[namespace + mutationKey] = store._mutations[namespace + mutationKey] || [];
    store._mutations[namespace + mutationKey].push((payload) => {
      mutation(rootModule.state, payload);
    });
  });
  rootModule.forEachAction((actionKey, action) => {
    store._actions[namespace + actionKey] = store._actions[namespace + actionKey] || [];
    store._actions[namespace + actionKey].push((payload) => {
      action(store, payload);
    });
  });
  rootModule.forEachGetter((getterKey, getter) => {
    store._wrappedGetters[getterKey] = () => {
      return getter(rootModule.state);
    };
  });
  rootModule.forEachModule((moduleKey, module) => {
    installModule(store, rootState, path.concat(moduleKey), module);
  });
}

function resetStoreVM(store, state) {
  store.getters = {};
  const computed = {};
  const wrappedGetters = store._wrappedGetters;
  forEachValue(wrappedGetters, (getterKey, getter) => {
    computed[getterKey] = getter;
    Object.defineProperty(store.getters, getterKey, {
      get() {
        return store._vm[getterKey];
      }
    });
  });
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  });
}

class Store {
  constructor(options) {
    // 将传入的选项进行一个格式化处理
    this._modules = new ModuleCollection(options);
    this._mutations = Object.create(null);
    this._actions = Object.create(null);
    this._wrappedGetters = Object.create(null);
    // 传入根状态，将所有的子状态都定义在这个根状态上
    const state = this._modules.root.state;
    installModule(this, state, [], this._modules.root);
    // 创建 Vue 实例，实现响应式 state 和计算属性
    resetStoreVM(this, state);
    // 实现 commit 和 dispatch
    this.commit = (type, payload) => {
      this._mutations[type].forEach((fn) => fn(payload));
    };
    this.dispatch = (type, payload) => {
      this._actions[type].forEach((fn) => fn(payload));
    };
  }

  get state() {
    return this._vm._data.$$state;
  }

  // constructor(options) {
  //   const state = options.state;
  //   const mutations = options.mutations;
  //   const actions = options.actions;
  //   const getters = options.getters;
  //   // 实现 getters
  //   this.getters = {};
  //   const computed = {};
  //   Object.keys(getters).forEach((getterKey) => {
  //     computed[getterKey] = () => {
  //       // 利用计算属性的特性进行缓存，如果依赖的值没有发生变化，该函数不会重新执行
  //       return getters[getterKey](this.state);
  //     };
  //     Object.defineProperty(this.getters, getterKey, {
  //       get: () => {
  //         return this._vm[getterKey];
  //       }
  //     });
  //   });
  //   // 借助 Vue 实现响应式
  //   // Vuex 的实现完全依赖于 Vue
  //   this._vm = new Vue({
  //     data: {
  //       $$state: state // 在定义 data 时，Vue 不会对带 $ _ 前缀的 key 进行代理，保证了该 key 的私有性
  //     },
  //     computed
  //   });
  //   // 实现 commit 和 dispatch
  //   this.mutations = mutations;
  //   this.actions = actions;
  //   // 因为在 actions 中一般会将 commit 和 dispatch 方法解构出来使用，会导致 this 指向问题，因此在这里使用箭头函数写法保证 this 始终指向 Store 实例
  //   this.commit = (type, payload) => {
  //     this.mutations[type](this.state, payload);
  //   };
  //   this.dispatch = (type, payload) => {
  //     this.actions[type](this, payload);
  //   };
  // }
  // commit(type, payload) {
  //   this.mutations[type](this.state, payload);
  // }
  // dispatch(type, payload) {
  //   this.actions[type](this, payload);
  // }
}

export default {
  Store,
  install
};
