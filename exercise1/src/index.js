import {initMixin} from './init'
import {initLifeCycle} from './lifecycle'
import {nextTick} from './observe/watcher'

function Vue(options) {
    this._init(options)
}

Vue.prototype.$nextTick = nextTick
initMixin(Vue)
initLifeCycle(Vue)

/*
* Vue 核心流程
* 创建响应式数据
* 模板转换为 ast 语法树
* 将 ast 语法树转换为 render 方法
* 后续每次数据更新只需执行 render 方法（无需再次执行 ast 转换过程）
*
* render 方法会生成 虚拟dom （使用响应式数据）
* 根据 虚拟dom 生成 真实dom
* */
export default Vue
