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
