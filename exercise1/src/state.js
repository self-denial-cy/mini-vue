import { observe } from './observe/index';
import Watcher, { nextTick } from './observe/watcher';
import Dep from './observe/dep';

export function initState(vm) {
  const opts = vm.$options;
  if (opts.data) {
    initData(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm);
  }
  if (opts.methods) {
    initMethods(vm);
  }
}

function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(v) {
      vm[target][key] = v;
    }
  });
}

function initData(vm) {
  let data = vm.$options.data;
  if (typeof data === 'function') {
    data = data.call(vm);
  }

  vm._data = data;

  observe(data);

  for (const key in data) {
    proxy(vm, '_data', key);
  }
}

function initComputed(vm) {
  const computed = vm.$options.computed;
  const watchers = (vm._computedWatchers = {});

  for (const key in computed) {
    const userDef = computed[key];

    const fn = typeof userDef === 'function' ? userDef : userDef.get;
    // 在渲染 Watcher 定义之前，所有的计算属性 Watcher 已经定义好了
    watchers[key] = new Watcher(vm, fn, {
      lazy: true // lazy 标识该 Watcher 是计算属性 Watcher
    });

    defineComputed(vm, key, userDef);
  }
}

function defineComputed(target, key, userDef) {
  // const getter = typeof userDef === 'function' ? userDef : userDef.get
  // eslint-disable-next-line prettier/prettier
  const setter = userDef.set || (() => { });
  Object.defineProperty(target, key, {
    get: createComputedGetter(key),
    set: setter.bind(target) // computed setter 中 this 指向当前实例
  });
}

// 🤢 绕来绕去的计算属性 本质上基于惰性 Watcher 实现
function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatchers[key];
    if (watcher.dirty) {
      watcher.evaluate();
    }
    // 通知计算属性依赖的 Dep 继续向上收集 Watcher，直到最终收集到 渲染 Watcher
    if (Dep.target) {
      watcher.depend();
    }
    return watcher.value;
  };
}

function initWatch(vm) {
  const watch = vm.$options.watch;

  // 遍历 watch 对象
  for (const key in watch) {
    const handler = watch[key];
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

// handler 可能有三种情况：方法名，函数，包含 handler、deep、immediate 参数的对象
function createWatcher(vm, key, handler) {
  // 这里暂时只考虑前两种情况
  if (typeof handler === 'string') {
    handler = vm[handler];
  }
  return vm.$watch(key, handler);
}

function initMethods(vm) {
  let methods = vm.$options.methods;

  vm._methods = methods;

  for (const key in methods) {
    methods[key] = methods[key].bind(vm);
    proxy(vm, '_methods', key);
  }
}

export function initStateMixin(Vue) {
  Vue.prototype.$nextTick = nextTick;

  // exprOrFn 有两种情况：字符串 key 或者 函数
  Vue.prototype.$watch = function (exprOrFn, cb) {
    new Watcher(this, exprOrFn, { user: true }, cb);
  };
}
