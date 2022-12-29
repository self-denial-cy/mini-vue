import install, { Vue } from './install';
import ModuleCollection from './module/module-collection';
import { forEachValue } from './utils';

// 从 store.state 上通过 path 实时取最新值
function getState(store, path) {
  return path.reduce((start, current) => {
    return start[current];
  }, store.state);
}

function installModule(store, rootState, path, rootModule) {
  if (path.length > 0) {
    // 只有是子模块的情况，才考虑将子模块的状态定义在根模块上
    const parent = path.slice(0, -1).reduce((start, current) => {
      return start[current];
    }, rootState);
    // 通过 registerModule 重置 Vue 实例时，state 是已经 Observe 之后的对象，对于已经存在 __ob__ 属性的对象，是不会再 Observe 处理的
    // 因此需要通过 Vue.set 来动态添加新属性
    Vue.set(parent, path[path.length - 1], rootModule.state);
    // parent[path[path.length - 1]] = rootModule.state;
  }
  const namespace = store._modules.getNamespace(path);
  // console.log(namespace);
  rootModule.forEachMutation((mutationKey, mutation) => {
    store._mutations[namespace + mutationKey] = store._mutations[namespace + mutationKey] || [];
    store._mutations[namespace + mutationKey].push((payload) => {
      mutation(getState(store, path), payload);
      // 触发缓存的订阅事件
      store.subscribes.forEach((fn) => fn({ type: namespace + mutationKey, payload }, store.state));
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
      return getter(getState(store, path));
    };
  });
  rootModule.forEachModule((moduleKey, module) => {
    installModule(store, rootState, path.concat(moduleKey), module);
  });
}

function resetStoreVM(store, state) {
  const oldVM = store._vm;
  store.getters = {};
  const computed = {};
  const wrappedGetters = store._wrappedGetters;
  forEachValue(wrappedGetters, (getterKey, getter) => {
    // 利用计算属性的特性进行缓存，如果依赖的值没有发生变化，该函数不会重新执行
    computed[getterKey] = getter;
    Object.defineProperty(store.getters, getterKey, {
      get() {
        return store._vm[getterKey];
      }
    });
  });
  // 借助 Vue 实现响应式
  // Vuex 的实现完全依赖于 Vue
  store._vm = new Vue({
    data: {
      // 在定义 data 时，Vue 不会对带 $ _ 前缀的 key 进行代理，保证了该 key 的私有性
      $$state: state // 通过 registerModule 重置 Vue 实例时，state 是已经 Observe 之后的对象，对于已经存在 __ob__ 属性的对象，是不会再 Observe 处理的
    },
    computed
  });
  // 重置 Vue 实例，销毁旧的 Vue 实例
  if (oldVM) {
    Vue.nextTick(() => {
      oldVM.$destroy();
    });
  }
}

class Store {
  constructor(options) {
    // 将传入的选项进行一个格式化处理
    this._modules = new ModuleCollection(options);
    this._mutations = Object.create(null);
    this._actions = Object.create(null);
    this._wrappedGetters = Object.create(null);
    // 订阅事件数组
    this.subscribes = [];
    // 插件数组
    this.plugins = options.plugins || [];
    // 传入根状态，将所有的子状态都定义在这个根状态上
    const state = this._modules.root.state;
    installModule(this, state, [], this._modules.root);
    // 创建 Vue 实例，实现响应式 state 和计算属性
    resetStoreVM(this, state);
    // 实现 commit 和 dispatch
    // 因为在 actions 中一般会将 commit 和 dispatch 方法解构出来使用，会导致 this 指向问题，因此在这里使用箭头函数写法保证 this 始终指向 Store 实例
    this.commit = (type, payload) => {
      this._mutations[type].forEach((fn) => fn(payload));
    };
    this.dispatch = (type, payload) => {
      this._actions[type].forEach((fn) => fn(payload));
    };
    // 插件在初始化完成之后自动执行
    this.plugins.forEach((plugin) => plugin(this));
  }

  get state() {
    return this._vm._data.$$state;
  }

  registerModule(path, module) {
    // 这里只考虑 path 为数组的情况
    this._modules.register(path, module);
    // const state = this._modules.root.state;
    // 动态添加的 getters 未生效，需要重置 Vue 实例
    installModule(this, this.state, path, module.newModule);
    resetStoreVM(this, this.state);
  }

  subscribe(fn) {
    this.subscribes.push(fn);
  }

  // 替换根状态
  replaceState(state) {
    // 替换的时候会将 state 包装成响应式对象
    this._vm._data.$$state = state;
  }
}

export default {
  Store,
  install
};
