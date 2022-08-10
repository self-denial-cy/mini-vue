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

// 比较两个虚拟节点是否是同一个节点（通过 tag key 比较）
export function isSameVNode(prevVNode, nextVNode) {
    return prevVNode.tag === nextVNode.tag && prevVNode.key === nextVNode.key
}
