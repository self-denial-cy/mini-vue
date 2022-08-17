## 1.`Vue2`响应式数据的理解

目的：监控数据的修改和获取操作

针对对象数据可以使用 `Object.defineProperty` 方法劫持属性（属性劫持）

> 源码层面 initState -> initData -> observe -> new Observer -> defineReactive -> Object.defineProperty

对象的所有属性的 get 和 set 都进行了重写，同时递归向下遍历属性，因此可能存在性能问题

推荐：使用 Vue 时，data 的数据结构不要嵌套太深的层级（性能优化）；如果不要求数据响应式，就不要放在 data 中了；对响应式数据的取值赋值应避免连续多次；如果有些对象在 data 中但是不要求响应式可以考虑 `Object.freeze` 冻结对象

```javascript
let total = 0
for (let i = 0; i < 100; i++){
    total += i
}
this.total = total
```

## 2.`Vue`中如何检测数组变化?

Vue2 中监控数组变化并没有使用 `defineProperty` 方法，因为根据索引修改数组的情况不多（如果使用 `defineProperty` 方法会浪费大量性能）

采用了重写数组变异方法（能够修改数组本身的方法）来实现（函数劫持）

> 源码层面 initState -> initData -> observe -> new Observer -> 重写数组变异方法 | observeArray（对数组中每一项都 observe 一下）

注意：根据索引修改数组或修改数组长度是无法监控的（arr[1] = 100 arr.length = 100）

## 3.`Vue`中如何进行依赖收集？

## 4.如何理解`Vue`中模板编译原理

## 5.`Vue`生命周期钩子是如何实现的

## 6.`Vue`的生命周期方法有哪些？一般在哪一步发送请求及原因

## 7.`Vue.mixin`的使用场景和原理

## 8.`Vue`组件`data`为什么必须是个函数？

## 9.`nextTick`在哪里使用？原理是?

## 10.`computed`和`watch`区别

## 11.`Vue.set`方法是如何实现的

## 12.`Vue`为什么需要虚拟DOM

## 13.`Vue`中`diff`算法原理

## 14.既然Vue通过数据劫持可以精准探测数据变化，为什么还需要虚拟DOM进行`diff`检测差异

## 15.请说明Vue中key的作用和原理，谈谈你对它的理解

## 16.谈一谈对Vue组件化的理解

## 17.`Vue`的组件渲染流程

## 18.`Vue`组件更新流程

## 19.`Vue`中异步组件原理

## 20.函数组件的优势及原理

## 21.Vue组件间传值的方式及之间区别

## 22.v-if和v-for哪个优先级更高？

## 23.v-if，v-model，v-for的实现原理

## 24.Vue中slot是如何实现的？什么时候使用它？

## 25.Vue.use是干什么的？原理是什么？

## 26.Vue事件修饰符有哪些？其实现原理是什么？

## 27.Vue中.sync修饰符的作用，用法及实现原理

## 28.如何理解自定义指令

## 29.keep-alive平时在哪里使用？原理是？

## 30.组件中写name选项有哪些好处及作用？
