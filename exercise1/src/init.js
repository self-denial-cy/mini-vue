import {initState} from './state'
import {compileToFunction} from './compiler/index'
import {mountComponent, callHook} from './lifecycle'
import {mergeOptions} from './utils'

export function initMixin(Vue) {
    /* 初始化 */
    Vue.prototype._init = function (options) {
        const vm = this

        /* 在实例上保存配置对象 */
        vm.$options = mergeOptions(vm.constructor.options, options)

        // console.log(vm.$options)

        callHook(vm, 'beforeCreated')
        /* 初始化状态 */
        initState(vm)
        callHook(vm, 'created')

        if (options.el) {
            vm.$mount(options.el)
        }
    }

    Vue.prototype.$mount = function (el) {
        const vm = this
        el = document.querySelector(el)
        const opts = vm.$options
        if (!opts.render) {
            let template
            if (!opts.template && el) {
                template = el.outerHTML
            } else {
                template = opts.template
            }
            if (template) {
                // 在这里，对模板进行编译
                const render = compileToFunction(template)
                opts.render = render
            }
        }

        // 组件的挂载
        mountComponent(vm, el)
    }
}
