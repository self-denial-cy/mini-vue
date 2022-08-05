export function initLifeCycle(Vue) {
    Vue.prototype._update = function () {
    }
    Vue.prototype._render = function () {
    }
}

export function mountComponent(vm, el) {
    /*
    * 第一步：调用 render 方法生成 虚拟dom
    * 第二部：根据 虚拟dom 生成 真实dom
    * 第三步：将 真实dom 插入到 el 中
    * */

}
