// 判断是否是原生元素
const isReservedTag = (tag) => {
  return [
    'div',
    'a',
    'p',
    'span',
    'button',
    'ul',
    'ol',
    'li',
    'img',
    'input',
    'select',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6'
  ].includes(tag);
};

export function createElementVNode(vm, tag, data, ...children) {
  data = data || {};
  const key = data.key;
  key && delete data.key;
  if (isReservedTag(tag)) {
    return vnode(vm, tag, key, data, children);
  } else {
    // 创建组件虚拟节点
    const definition = vm.$options.components[tag];
    return createComponentVNode(vm, tag, key, data, children, definition);
  }
}

function createComponentVNode(vm, tag, key, data, children, definition) {
  definition = typeof definition === 'function' ? definition : vm.$options._base.extend(definition);
  data.hook = {
    init(vnode) {
      const definition = vnode.componentOptions.definition;
      const instance = (vnode.componentInstance = new definition());
      instance.$mount();
    }
  };
  return vnode(vm, tag, key, data, children, undefined, { definition });
}

export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

function vnode(vm, tag, key, data, children, text, componentOptions) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    componentOptions
  };
}

// 比较两个虚拟节点是否是同一个节点（通过 tag key 比较）
export function isSameVNode(prevVNode, nextVNode) {
  return prevVNode.tag === nextVNode.tag && prevVNode.key === nextVNode.key;
}
