import {initState} from './state'

export function initMixin(Vue) {
    /* 初始化 */
    Vue.prototype._init = function (options) {
        const vm = this

        /* 在实例上保存配置对象 */
        vm.$options = options

        /* 初始化状态 */
        initState(vm)
    }
}
