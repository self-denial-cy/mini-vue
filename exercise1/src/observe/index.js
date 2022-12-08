/* 响应式模块 */
import { newArrayProto } from './array';
import Dep from './dep';

export function observe(data) {
  if (typeof data !== 'object' || data === null) {
    return;
  }
  if (data.__ob__ instanceof Observer) {
    return data.__ob__;
  }
  /* 预备劫持对象 */
  return new Observer(data);
}

class Observer {
  constructor(data) {
    // 给 data 中的每一个对象或数组本身都设置一个 Dep
    // 用于后续对象的属性新增/删除，数组变异方法修改数组后的视图更新
    this.dep = new Dep();

    // 防止死循环
    // data.__ob__ = this
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false
    });

    if (Array.isArray(data)) {
      /* 重写数组的 7个变异方法，这些方法是可以修改数组本身的，但是要保留原有的一些方法 */
      // 这里只是简化写法，Vue 源码中对这里进行了特殊处理，防止有的浏览器不支持 __proto__ 属性写法
      data.__proto__ = newArrayProto;
      /* 在这里还要对数组中的引用类型进行 observe */
      this.observeArray(data);
    } else {
      /* 遍历对象 */
      this.walk(data);
    }
  }

  walk(data) {
    /* 遍历对象所有属性重新定义属性，是 Vue2 的性能瓶颈之一 */
    /* 且只能遍历初始定义好的属性，也是 Vue2 新增 $set $delete api 的原因 */
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }

  observeArray(data) {
    data.forEach((item) => observe(item));
  }
}

// 多层嵌套的 data 会导致递归，递归层级多了会导致性能问题
// 所以在使用中，尽量保证 data 数据结构的扁平化
function dependArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    // 恶心且巧妙，覆盖了所有的嵌套情况
    // 至此，除了 data 根对象，所有的数组和对象本身的 Observer 实例上的 Dep 完成了依赖收集
    // 对象上所有的 key 的闭包空间中的 Dep 完成了依赖收集
    current.__ob__ && current.__ob__.dep.depend();
    if (Array.isArray(current)) {
      dependArray(current);
    }
  }
}

export function defineReactive(target, key, value) {
  const dep = new Dep(); // 闭包空间不会被销毁，每个属性都有自己的 Dep 空间
  /* 递归处理 */
  const childObserver = observe(value); // value 为对象或数组时，会返回 Observer 实例，否则为 undefined
  /* 这里使用一个闭包 */
  /* 属性劫持 */
  Object.defineProperty(target, key, {
    get() {
      if (Dep.target) {
        dep.depend();
        if (childObserver) {
          // 让对象或数组本身也进行依赖收集
          childObserver.dep.depend();
          // 特殊情况，数组嵌套的情况
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }
      return value;
    },
    set(v) {
      if (v === value) return;
      // 赋新值时，如果是引用类型，继续劫持
      observe(v);
      value = v;
      dep.notify();
    }
  });
}
