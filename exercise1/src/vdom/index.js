export function createElementVNode(vm, tag, data, ...children) {
    data = data || {}
    const key = data.key
    key && delete data.key
    return vnode(vm, tag, key, data, children)
}

export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

function vnode(vm, tag, key, data, children, text) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
    }
}
