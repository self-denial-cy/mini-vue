import {isSameVNode} from './index'

// elOrVNode 在初始化时是 el，在更新时是 old vnode
export function patch(elOrVNode, vnode) {
    const isRealElement = elOrVNode.nodeType

    if (isRealElement) {
        // 初始化
        const el = elOrVNode
        const parentEl = el.parentNode
        const newEl = createEl(vnode)
        // console.log(newEl)
        parentEl.insertBefore(newEl, el.nextSibling)
        parentEl.removeChild(el)

        return newEl
    } else {
        // diff 更新
        const prevVNode = elOrVNode
        const nextVNode = vnode
        /*
        * 1.两个节点不是同一个节点，直接删除老的换上新的（无需向下比对了）
        * 2.两个节点是同一个节点（判断节点的 tag key），比较两个节点的属性是否有差异（复用老的节点，将差异的属性更新）
        * 3.节点比较完毕后，比较子级
        *  */
        return patchVNode(prevVNode, nextVNode)
    }
}

export function createEl(vnode) {
    const {tag, data, children, text} = vnode
    if (typeof tag === 'string') {
        // 标签
        vnode.el = document.createElement(tag) // 将真实节点与虚拟节点对应起来，后续方便更新

        patchProps(vnode.el, {}, data)

        children.forEach(child => {
            vnode.el.appendChild(createEl(child))
        })
    } else {
        // 文本
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

export function patchProps(el, prevProps = {}, props = {}) {
    // 老的属性或样式有，新的属性或样式没有，删除它
    const prevStyle = prevProps.style || {}
    const nextStyle = props.style || {}
    for (const key in prevStyle) {
        if (!nextStyle[key]) {
            el.style[key] = ''
        }
    }
    for (const key in prevProps) {
        if (!props[key]) {
            el.removeAttribute(key)
        }
    }

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

function patchVNode(prevVNode, nextVNode) {
    if (!isSameVNode(prevVNode, nextVNode)) {
        // 直接删除老的换上新的
        const newEl = createEl(nextVNode)
        prevVNode.el.parentNode.replaceChild(newEl, prevVNode.el)
        return newEl
    }

    // 以下都是基于两个节点是同一个节点的情况，可以复用老的 DOM
    const el = nextVNode.el = prevVNode.el
    // 文本比较
    if (!prevVNode.tag) { // 是文本节点
        if (prevVNode.text !== nextVNode.text) {
            el.textContent = nextVNode.text
        }
    }
    // 标签属性比较
    patchProps(el, prevVNode.data, nextVNode.data)
    // 子节点比较：一方有一方无、两方都有
    const prevChildren = prevVNode.children
    const nextChildren = nextVNode.children
    if (prevChildren.length && nextChildren.length) {
        // 完整的 diff 算法
        updateChildren(el, prevChildren, nextChildren)
    } else if (nextChildren.length) {
        // 只有新 children 新增
        mountChildren(el, nextChildren)
    } else if (prevChildren.length) {
        // 只有老 children 删除
        unMountChildren(el, prevChildren)
    }
}

function mountChildren(el, children) {
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        el.appendChild(createEl(child))
    }
}

function unMountChildren(el, children) {
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        el.removeChild(child.el)
    }
}

// 完整的 diff 算法
function updateChildren(el, prevChildren, nextChildren) {
    // 比较子级节点时，会有些特殊手段，针对特殊情况，提高性能
    // 操作列表时，经常会使用 push shift pop unshift reverse sort，针对这些情况做一些优化
    // Vue2 使用双指针，即双端 diff 优化
    let prevStartIndex = 0
    let nextStartIndex = 0
    let prevEndIndex = prevChildren.length - 1
    let nextEndIndex = nextChildren.length - 1

    let prevStartVNode = prevChildren[prevStartIndex]
    let nextStartVNode = nextChildren[nextStartIndex]
    let prevEndVNode = prevChildren[prevEndIndex]
    let nextEndVNode = nextChildren[nextEndIndex]

    // 双端 diff
    while (prevStartIndex <= prevEndIndex && nextStartIndex <= nextEndIndex) {
        // 双方有任一方 头部指针大于尾部指针 终止循环
        
    }
}
