// router-view 只是用来渲染组件，不被记录在组件父子关系中（$parent，$children）
export default {
  functional: true,
  render(h, context) {
    // router-view 渲染时需要考虑层级关系
    console.log(context);
    let { parent, data } = context;
    // data.routerView = true;
    const route = parent.$route;
    let depth = 0;
    while (parent) {
      if (parent.$vnode && parent.$vnode.data.routerView) depth++;
      parent = parent.$parent;
    }
    const record = route.matched[depth];
    if (!record) return;
    // h 函数可以渲染标签、组件
    // 渲染组件时，第二个参数会传递给组件实例 $vnode.data 上，具体逻辑后续 debug Vue 源码查看
    return h(record.component, { routerView: true });
  }
};
