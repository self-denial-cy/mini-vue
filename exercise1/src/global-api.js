import { mergeOptions } from './utils';

export function initGlobalAPI(Vue) {
  Vue.options = {
    _base: Vue,
    components: {}
  };

  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  };

  // 根据传入的参数生成一个子构造器
  Vue.extend = function (options) {
    function Sub(options = {}) {
      this._init(options);
    }

    Sub.prototype = Object.create(Vue.prototype);
    Sub.prototype.constructor = Sub;

    // 将传入的参数与全局参数合并
    Sub.options = mergeOptions(Vue.options, options);

    return Sub;
  };

  // 定义全局组件
  Vue.component = function (id, definition) {
    definition = typeof definition === 'function' ? definition : Vue.extend(definition);
    Vue.options.components[id] = definition;
  };
}
