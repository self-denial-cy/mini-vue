import { initMixin } from './init';
import { initLifeCycle } from './lifecycle';
import { initGlobalAPI } from './global-api';
import { initStateMixin } from './state';

// TEST
// import {compileToFunction} from './compiler/index'
// import {createEl, patch} from './vdom/patch'

function Vue(options) {
  this._init(options);
}

initMixin(Vue);
initLifeCycle(Vue);
initGlobalAPI(Vue);
initStateMixin(Vue);

// 虚拟节点 diff 测试代码
// const template1 = `<ul key="ul" style="color: red"><li key="a">a</li><li key="b">b</li><li key="c">c</li><li key="d">d</li></ul>`
// const render1 = compileToFunction(template1)
// const prevVNode = render1.call(new Vue({
//     data() {
//         return {
//             str: 'old vnode'
//         }
//     }
// }))
// document.body.appendChild(createEl(prevVNode))
// const template2 = `<ul key="ul" style="color: blue"><li key="b">b</li><li key="m">m</li><li key="a">a</li><li key="p">p</li><li key="c">c</li><li key="q">q</li></ul>`
// const render2 = compileToFunction(template2)
// const nextVNode = render2.call(new Vue({
//     data() {
//         return {
//             str: 'new vnode'
//         }
//     }
// }))
// diff 算法 平级比较算法，父与父 diff 子与子 diff
// setTimeout(() => {
//     console.log(patch(prevVNode, nextVNode))
// }, 2500)

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
export default Vue;
