import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// Vue 构造函数
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue) // 初始化了 Vue.prototype._init 方法
stateMixin(Vue) // Vue.prototype.$data Vue.prototype.$props Vue.prototype.$set Vue.prototype.$delete Vue.prototype.$watch
eventsMixin(Vue) // Vue.prototype.$on Vue.prototype.$once Vue.prototype.$off Vue.prototype.$emit
lifecycleMixin(Vue) // Vue.prototype._update Vue.prototype.$forceUpdate Vue.prototype.$destroy
renderMixin(Vue) // Vue.prototype.$nextTick Vue.prototype._render

export default Vue
