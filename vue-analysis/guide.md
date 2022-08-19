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

依赖收集（观察者模式）：被观察者指代的是数据（Dep），观察者指代的是 Watcher

Dep 与 Watcher 是多对多的关系，视图渲染时，会触发 get 方法，Dep 和 Watcher 会互相收集好依赖关系；数据变更时，则会根据依赖关系触发对应的 Watcher 更新

data 中的每一个对象或数组都有一个对应的 Observer 实例，该实例上有一个 Dep；对象的每一个 key 都有一个闭包空间，该空间里有一个 Dep；修改对象属性一般会通过后者 Dep 触发 Watcher 更新；调用数组变异方法修改数组一般会通过前者 Dep 触发 Watcher 更新

Watcher 目前有 渲染 Watcher、计算属性 Watcher、用户自定义 Watcher

![fow](./images/fow.png)

## 4.如何理解`Vue`中模板编译原理

目的：将 template 转换为 render 函数

- 第一步：将 template 转换为 ast 语法树
- 第二步：将 ast 语法树转换为 render 函数的字符串定义
- 第三步：通过 with 和 new Function 生成 render 函数

> render 函数返回的结果就是 虚拟DOM

## 5.`Vue`生命周期钩子是如何实现的

内部维护了一组生命周期钩子 LIFECYCLE_HOOKS，并且为其定义了合并策略 mergeHook，后续依次通过 callHook 调用

## 6.`Vue`的生命周期方法有哪些？一般在哪一步发送请求及原因

- beforeCreate 响应式数据尚未初始完毕，Vue3中就取缔了
- created 响应式数据初始完毕（不涉及到 dom 渲染，这个 api 可以在服务端渲染中使用），Vue3 使用 setup 替代
- beforeMount 在渲染 dom 之前，没有实际价值
- mounted 可以获取到真实 dom $el
- beforeUpdate 更新之前
- updated 更新完毕之后
- beforeDestroy 组件销毁之前，Watcher、子组件、事件监听还未销毁
- destroyed 组件销毁之后，只是 Vue 实例被销毁了（也有可能只是失活，暂时还未去看相关源码），相关的 dom 并未被移除。。。
- activated
- deactivated
- errorCaptured 捕获错误


> 一般在 mounted 中发送请求，虽然 created 比 mounted 执行时机早，但是钩子都是同步执行，请求是异步执行，在 mounted 中还可以获取到第一次渲染之后的 dom


> 服务端渲染基本上也不会使用 created（服务端没有 dom 也没有 mounted）

## 7.`Vue.mixin`的使用场景和原理

## 8.`Vue`组件`data`为什么必须是个函数？

## 9.`nextTick`在哪里使用？原理是?

nextTick 内部采用了异步任务进行了包装（多个 nextTick 调用会被缓存到异步队列中），最后在异步任务中批处理

异步任务并未直接采用某个 api，而是使用了优雅降级的方式：Promise（不兼容 ie） MutationObserver（h5 api） setImmediate（ie 独有） setTimeout

> 应用场景：一般是为了获取更新后的最新 dom，因为 Watcher 更新也是缓存到异步队列中，必须等 Watcher 更新之后，才能获取到最新渲染结果；nextTick 一般写在 Watcher 更新之后，所以才能获取到最新渲染结果

```javascript
this.name = 'hello world' // 触发 set -> dep.notify -> watcher.update -> 缓存到异步队列中

this.$nextTick(()=>{
    console.log('获取到最新渲染结果')
}) // 将回调缓存到异步执行队列中

// 同步任务执行完后，再按顺序执行异步任务，这样就可以在 nextTick 的回调中获取到最新渲染结果
```

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

```html
<div>
  <div v-for="i in 10" v-if="flag"></div>
</div>
```

```javascript
function render() {
  with(this) {
    return _c('div', _l((10), function (i) {
      return (flag) ? _c('div') : _e()
    }), 0)
  }
}
```

> v-for 的优先级更高，在编译的时候，会将 v-for 转换为 _l 函数，v-if 转换为三元表达式；
> 
> 源码层面：genFor 在 genIf 之前执行
> 
> v-for 与 v-if 不推荐放在一起使用，可以通过加一层 template 或者使用 computed 过滤数据源优化


扩展：v-if 与 v-show 的区别？

```javascript
function render() {
  with(this) {
    return _c('div', [(flag) ? _c('div') : _e()])
  }
}
```

```javascript
function render() {
  with(this) {
    return _c('div', [_c('div', {
      directives: [{
        name: "show",
        rawName: "v-show",
        value: (flag),
        expression: "flag"
      }]
    })])
  }
}
```

> v-if 会编译成一个三元表达式，v-show 会编译成一个指令

v-if 控制是否渲染，v-show 控制的是样式（display:none）

> v-show 会记录元素初始的 display 属性值，表现出来的结果就是在初始 display 值和 none 之间来回切换，就算应用在 span 元素上也不会使其突然变成块元素或内联块元素等；
> 
> 为什么不控制元素的 visibility 属性：元素仍然会占位，虽然不会响应事件
> 
> 为什么不控制元素的 opacity 属性：元素仍然会占位，且还会响应事件

## 23.v-if，v-model，v-for的实现原理

- v-if 会被编译成三元表达式
- v-for 会被编译成 _l 函数（renderList 函数），针对数组、字符串、数字、对象（有 Symbol.iterator 或无）不同的情况去遍历，最终返回 VNode 列表
- v-model 在表单元素上可以实现双向绑定 在组件上就不一样了
  - v-model 在不同的表单元素上会编译出不同的结果，就 input[type=text] 来说会被编译成 value + input + 指令处理，value 和 input 实现双向绑定且阻止中文的触发，指令则会处理中文输入完毕后，手动触发更新
  - v-model 在组件上会编译出一个 model 对象，组件创建虚拟 dom 时会有这个对象；会看一下里面是否有自定义的 prop 和 event，如果没有则会被解析成 value + input 的语法糖

## 24.Vue中slot是如何实现的？什么时候使用它？



## 25.Vue.use是干什么的？原理是什么？

Vue.use 用来安装插件，将 Vue 的构造函数传递到插件中，让所有的插件依赖同一版本的 Vue

插件本身暴露一个函数，那就直接将 Vue 传递进去；插件本身暴露一个对象，那就将 Vue 传递给该对象的 install 方法

## 26.Vue事件修饰符有哪些？其实现原理是什么？

## 27.Vue中.sync修饰符的作用，用法及实现原理

这个修饰符用于实现状态同步的，实现原理与 v-model 类似

```javascript
function render() {
  with(this) {
    return _c('div', [_c('A', {
      attrs: {
        "text": title
      },
      on: {
        "update:text": function ($event) {
          title = $event
        }
      }
    })], 1)
  }
}
```

## 28.如何理解自定义指令

## 29.keep-alive平时在哪里使用？原理是？

## 30.组件中写name选项有哪些好处及作用？

- 可以实现递归组件
  ```javascript
  // enable recursive self-lookup
  if (name) {
    Sub.options.components[name] = Sub
  }
  ```
- 标识作用，可以通过 name 找到对应的组件
- 配和 devtool 工具具名化组件
