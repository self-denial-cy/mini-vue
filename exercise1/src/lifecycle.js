import {createElementVNode, createTextVNode} from './vdom/index'

export function initLifeCycle(Vue) {
    // 根据 虚拟dom 生成 真实dom
    Vue.prototype._update = function (vnode) {
        const vm = this
        const el = vm.$el
        console.log(vnode)

        // patch 既有初始化功能，又有更新功能
        vm.$el = patch(el, vnode)
    }
    Vue.prototype._render = function () {
        const vm = this
        // 将当前 Vue 实例传入
        return vm.$options.render.call(vm)
    }
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments)
    }
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments)
    }
    Vue.prototype._s = function (val) {
        if (typeof val === 'object') {
            return JSON.stringify(val)
        }
        return val
    }
}

export function mountComponent(vm, el) {
    vm.$el = el
    /*
    * 第一步：调用 render 方法生成 虚拟dom
    * 第二部：根据 虚拟dom 生成 真实dom
    * 第三步：将 真实dom 插入到 el 中
    * */
    vm._update(vm._render())
}

// elOrVNode 在初始化时是 el，在更新时是 old vnode
function patch(elOrVNode, vnode) {
    const isRealElement = elOrVNode.nodeType

    if (isRealElement) {
        // 初始化
        const el = elOrVNode
        const parentEl = el.parentNode
        const newEl = createEl(vnode)
        console.log(newEl)
        parentEl.insertBefore(newEl, el.nextSibling)
        parentEl.removeChild(el)

        return newEl
    } else {
        // diff 更新
    }
}

function createEl(vnode) {
    const {tag, data, children, text} = vnode
    if (typeof tag === 'string') {
        // 标签
        vnode.el = document.createElement(tag) // 将真实节点与虚拟节点对应起来，后续方便更新

        patchProps(vnode.el, data)

        children.forEach(child => {
            vnode.el.appendChild(createEl(child))
        })
    } else {
        // 文本
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

function patchProps(el, props) {
    for (const key in props) {
        if (key === 'style') {
            for (const styleKey in props['style']) {
                el.style[styleKey] = props['style'][styleKey]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
}
