import { createElementVNode, createTextVNode } from './vdom/index';
import { patch } from './vdom/patch';
import Watcher from './observe/watcher';

export function initLifeCycle(Vue) {
  // 根据 虚拟dom 生成 真实dom
  Vue.prototype._update = function (vnode) {
    const vm = this;
    const el = vm.$el;
    // console.log(vnode)

    const prevVNode = vm._vnode;
    if (prevVNode) {
      // 已经初始化过了，调用更新功能
      vm.$el = patch(prevVNode, vnode);
    } else {
      // patch 既有初始化功能，又有更新功能
      vm.$el = patch(el, vnode);
    }

    vm._vnode = vnode; // 保存上一次传入的 vnode
  };

  Vue.prototype._render = function () {
    const vm = this;
    // 将当前 Vue 实例传入
    return vm.$options.render.call(vm);
  };

  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };

  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };

  Vue.prototype._s = function (val) {
    if (typeof val === 'object') {
      return JSON.stringify(val);
    }
    return val;
  };
}

export function mountComponent(vm, el) {
  vm.$el = el;
  /*
   * 第一步：调用 render 方法生成 虚拟dom
   * 第二部：根据 虚拟dom 生成 真实dom
   * 第三步：将 真实dom 插入到 el 中
   * */
  // vm._update(vm._render())

  const updateComponent = () => {
    vm._update(vm._render());
  };

  new Watcher(vm, updateComponent, true);
}

export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    handlers.forEach((handler) => handler.call(vm));
  }
}
