import { isSameVNode } from './index';

// elOrVNode 在初始化时是 el，在更新时是 old vnode
export function patch(elOrVNode, vnode) {
  if (!elOrVNode) {
    // 组件的渲染
    return createEl(vnode);
  }
  const isRealElement = elOrVNode.nodeType;
  if (isRealElement) {
    // 初始化
    const el = elOrVNode;
    const parentEl = el.parentNode;
    const newEl = createEl(vnode);
    // console.log(newEl)
    parentEl.insertBefore(newEl, el.nextSibling);
    parentEl.removeChild(el);

    return newEl;
  } else {
    // diff 更新
    const prevVNode = elOrVNode;
    const nextVNode = vnode;
    // console.log(prevVNode, nextVNode)
    /*
     * 1.两个节点不是同一个节点，直接删除老的换上新的（无需向下比对了）
     * 2.两个节点是同一个节点（判断节点的 tag key），比较两个节点的属性是否有差异（复用老的节点，将差异的属性更新）
     * 3.节点比较完毕后，比较子级
     *  */
    return patchVNode(prevVNode, nextVNode);
  }
}

function createComponent(vnode) {
  const data = vnode.data || {};
  const init = data.hook && data.hook.init;
  if (init) {
    init(vnode);
  }
  if (vnode.componentInstance) {
    return true; // 说明是组件
  }
}

export function createEl(vnode) {
  const { tag, data, children, text } = vnode;
  if (typeof tag === 'string') {
    // 区分是组件还是元素
    if (createComponent(vnode)) {
      return vnode.componentInstance.$el;
    }
    // 标签
    vnode.el = document.createElement(tag); // 将真实节点与虚拟节点对应起来，后续方便更新
    patchProps(vnode.el, {}, data);
    children.forEach((child) => {
      vnode.el.appendChild(createEl(child));
    });
  } else {
    // 文本
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

export function patchProps(el, prevProps = {}, props = {}) {
  // 老的属性或样式有，新的属性或样式没有，删除它
  const prevStyle = prevProps.style || {};
  const nextStyle = props.style || {};
  for (const key in prevStyle) {
    if (!nextStyle[key]) {
      el.style[key] = '';
    }
  }
  for (const key in prevProps) {
    if (!props[key]) {
      el.removeAttribute(key);
    }
  }

  for (const key in props) {
    if (key === 'style') {
      for (const styleKey in props['style']) {
        el.style[styleKey] = props['style'][styleKey];
      }
    } else {
      el.setAttribute(key, props[key]);
    }
  }
}

function patchVNode(prevVNode, nextVNode) {
  if (!isSameVNode(prevVNode, nextVNode)) {
    // 直接删除老的换上新的
    const newEl = createEl(nextVNode);
    prevVNode.el.parentNode.replaceChild(newEl, prevVNode.el);
    return newEl;
  }

  // 以下都是基于两个节点是同一个节点的情况，可以复用老的 DOM
  const el = (nextVNode.el = prevVNode.el);
  // 文本比较
  if (!prevVNode.tag) {
    // 是文本节点
    if (prevVNode.text !== nextVNode.text) {
      el.textContent = nextVNode.text;
    }
  }
  // 标签属性比较
  patchProps(el, prevVNode.data, nextVNode.data);
  // 子节点比较：一方有一方无、两方都有
  const prevChildren = prevVNode.children || [];
  const nextChildren = nextVNode.children || [];
  if (prevChildren.length && nextChildren.length) {
    // 完整的 diff 算法
    updateChildren(el, prevChildren, nextChildren);
  } else if (nextChildren.length) {
    // 只有新 children 新增
    mountChildren(el, nextChildren);
  } else if (prevChildren.length) {
    // 只有老 children 删除
    unMountChildren(el, prevChildren);
  }
  return el;
}

function mountChildren(el, children) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    el.appendChild(createEl(child));
  }
}

function unMountChildren(el, children) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    el.removeChild(child.el);
  }
}

// 完整的 diff 算法
function updateChildren(el, prevChildren, nextChildren) {
  // 比较子级节点时，会有些特殊手段，针对特殊情况，提高性能
  // 操作列表时，经常会使用 push shift pop unshift reverse sort，针对这些情况做一些优化
  // Vue2 使用双指针，即双端 diff 优化
  let prevStartIndex = 0;
  let nextStartIndex = 0;
  let prevEndIndex = prevChildren.length - 1;
  let nextEndIndex = nextChildren.length - 1;

  let prevStartVNode = prevChildren[prevStartIndex];
  let nextStartVNode = nextChildren[nextStartIndex];
  let prevEndVNode = prevChildren[prevEndIndex];
  let nextEndVNode = nextChildren[nextEndIndex];

  function makeIndexByKey(children) {
    const map = {};
    children.forEach((child, index) => {
      map[child.key] = index;
    });
    return map;
  }

  // prevChildren 的映射表
  const map = makeIndexByKey(prevChildren);

  // 双端 diff
  while (prevStartIndex <= prevEndIndex && nextStartIndex <= nextEndIndex) {
    // 双方有任一方 头部指针大于尾部指针 终止循环
    if (!prevStartVNode) {
      prevStartVNode = prevChildren[++prevStartIndex];
    } else if (!prevEndVNode) {
      prevEndVNode = prevChildren[--prevEndIndex];
    } else if (isSameVNode(prevStartVNode, nextStartVNode)) {
      // 头头相比
      patchVNode(prevStartVNode, nextStartVNode); // 如果是同一个节点，则递归 diff
      prevStartVNode = prevChildren[++prevStartIndex];
      nextStartVNode = nextChildren[++nextStartIndex];
    } else if (isSameVNode(prevEndVNode, nextEndVNode)) {
      // 尾尾相比
      patchVNode(prevEndVNode, nextEndVNode);
      prevEndVNode = prevChildren[--prevEndIndex];
      nextEndVNode = nextChildren[--nextEndIndex];
    } else if (isSameVNode(prevEndVNode, nextStartVNode)) {
      // 旧尾新头相比 a b c d ====> d a b c
      patchVNode(prevEndVNode, nextStartVNode);
      el.insertBefore(prevEndVNode.el, prevStartVNode.el);
      prevEndVNode = prevChildren[--prevEndIndex];
      nextStartVNode = nextChildren[++nextStartIndex];
    } else if (isSameVNode(prevStartVNode, nextEndVNode)) {
      // 旧头新尾相比 a b c d ====> b c d a
      patchVNode(prevStartVNode, nextEndVNode);
      el.insertBefore(prevStartVNode.el, prevEndVNode.el.nextSibling);
      prevStartVNode = prevChildren[++prevStartIndex];
      nextEndVNode = [--nextEndIndex];
    } else {
      // 乱序 diff
      // 根据 prevChildren 生成映射表，以尽量复用老节点
      // nextChildren 去映射表中寻找映射节点，找到则移动，找不到则添加
      // 最终映射表中还剩下的则被删除
      const moveIndex = map[nextStartVNode.key];
      if (moveIndex !== undefined) {
        // 有老节点可以复用
        const moveVNode = prevChildren[moveIndex];
        el.insertBefore(moveVNode.el, prevStartVNode.el);
        prevChildren[moveIndex] = undefined; // 标识该节点已经被移走
        patchVNode(moveVNode, nextStartVNode);
      } else {
        // 没有老节点可以复用，只能生成新节点插入
        el.insertBefore(createEl(nextStartVNode), prevStartVNode.el);
      }
      nextStartVNode = nextChildren[++nextStartIndex];
    }
  }

  // a b c ====> a b c d e 类似的优化  a b c ====> e d a b c 类似的优化
  if (nextStartIndex <= nextEndIndex) {
    for (let i = nextStartIndex; i <= nextEndIndex; i++) {
      // 这里可能是尾部追加，也可能是头部追加
      const anchor = nextChildren[nextEndIndex + 1] ? nextChildren[nextEndIndex + 1].el : null;
      el.insertBefore(createEl(nextChildren[i]), anchor); // anchor 为 null 的时候，insertBefore 的作用相当于 appendChild
    }
  }

  // a b c d e ====> a b c 类似的优化  d a b c ====> a b c 类似的优化
  if (prevStartIndex <= prevEndIndex) {
    for (let i = prevStartIndex; i <= prevEndIndex; i++) {
      prevChildren[i] && el.removeChild(prevChildren[i].el);
    }
  }
}
