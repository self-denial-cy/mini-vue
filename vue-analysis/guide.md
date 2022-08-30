## 1.`Vue2`响应式数据的理解

目的：监控数据的修改和获取操作

针对对象数据可以使用 `Object.defineProperty` 方法劫持属性（属性劫持）

> 源码层面 initState -> initData -> observe -> new Observer -> defineReactive -> Object.defineProperty

对象的所有属性的 get 和 set 都进行了重写，同时递归向下遍历属性，因此可能存在性能问题

推荐：使用 Vue 时，data 的数据结构不要嵌套太深的层级（性能优化）；如果不要求数据响应式，就不要放在 data 中了；对响应式数据的取值赋值应避免连续多次；如果有些对象在 data 中但是不要求响应式可以考虑 `Object.freeze` 冻结对象

```javascript
let total = 0
for (let i = 0; i < 100; i++) {
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

通过 Vue.mixin 可以实现逻辑的复用，问题在于数据来源不明确且声明时可能会导致命名冲突；可以实现高阶组件

Vue3 中引入 compositionAPI 以解决复用问题

mixin 的核心就是 mergeOptions （内部采用了策略模式进行合并），包括全局 mixin 和局部 mixin；针对不同的属性有不同的合并策略

## 8.`Vue`组件`data`为什么必须是个函数？

不管是直接使用 Vue 或者是 Vue.extend 得到的 Sub 来创建组件实例，都会通过 mergeOptions 将所有的配置合并到 $options 上；mergeOptions 中对于 data 属性的合并策略会出现这么一种情况：多次创建组件实例时，可能多个组件实例会共享同一个 data 数据源，互相会影响；期望每个组件都有一份自己独立的数据源，可以通过调用 data 函数返回一份数据自己使用

## 9.`nextTick`在哪里使用？原理是?

nextTick 内部采用了异步任务进行了包装（多个 nextTick 调用会被缓存到异步队列中），最后在异步任务中批处理

异步任务并未直接采用某个 api，而是使用了优雅降级的方式：Promise（不兼容 ie） MutationObserver（h5 api） setImmediate（ie 独有） setTimeout

> 应用场景：一般是为了获取更新后的最新 dom，因为 Watcher 更新也是缓存到异步队列中，必须等 Watcher 更新之后，才能获取到最新渲染结果；nextTick 一般写在 Watcher 更新之后，所以才能获取到最新渲染结果

```javascript
this.name = 'hello world' // 触发 set -> dep.notify -> watcher.update -> 缓存到异步队列中

this.$nextTick(() => {
    console.log('获取到最新渲染结果')
}) // 将回调缓存到异步执行队列中

// 同步任务执行完后，再按顺序执行异步任务，这样就可以在 nextTick 的回调中获取到最新渲染结果
```

## 10.`computed`和`watch`区别

computed 和 watch 在底层都会创建一个 Watcher 实例（computed 定义的属性可以在模板中使用，watch 不行）

- computed 默认不会立即执行，只有在取值的时候才会执行，内部 dirty 属性映射依赖的值是否发生变化；计算属性默认需要同步返回结果（有个包可以让 computed 变成异步返回结果）
- watch 默认用户会提供一个回调函数，数据变化了就调用这个回调

## 11.`Vue.set`方法是如何实现的

Vue.set 方法是 Vue2 的一个补丁方法（正常情况下，对象添加删除属性和数组的索引和长度是无法被监控到的）

实现原理：data 中的每一个对象和数组都有一个对应的 Observer 实例，该实例上有一个 Dep 实例（依赖收集时，与 Watcher 的依赖关系已经建立好），通过这个 Dep 实例可以通知对应 Watcher 更新

> Vue3 中不再需要该方法了，因为 Proxy 可以监控到对象属性的添加和删除

## 12.`Vue`为什么需要虚拟DOM

- 考虑针对不同的平台来使用（weex、web、小程序），可以跨平台，不需要考虑平台问题
- 不用关心兼容性问题，可以在上层将对应的渲染方法传递给我，我通过虚拟 dom 来渲染即可
- diff 算法针对更新的时候，有了虚拟 dom 之后可以通过 diff 算法找到最小的差异来修改真实 dom（vnode.el 上缓存了真实 dom）

## 13.`Vue`中`diff`算法原理

diff 算法的特点就是平级比较，内部采用了双指针方式对常见的操作进行了优化（递归向下比较）

- 针对一个节点的 diff 算法
  - 比较节点是否是同一个节点，如果是同一个节点，则比较属性；如果不是同一个节点，则直接换成最新的
  - 同一个节点比较属性后，会复用老节点
- 比较儿子
  - 一方有儿子，一方没儿子（删除、添加）
  - 两方都有儿子
    - 针对常见操作优化比较：头头、尾尾、交叉
    - 根据老儿子生成一个映射表，从新儿子中一个一个的去映射表中查找是否存在，存在则移动，不存在则插入，最后删除多余的

> O(n) 复杂度的递归比较（后续找找资料研究下）

## 14.既然Vue通过数据劫持可以精准探测数据变化，为什么还需要虚拟DOM进行`diff`检测差异

降低渲染开销，如果监测到数据变化，就重新渲染整个视图（性能损耗严重）；响应式 + 虚拟 dom 的 diff 算法可以大大降低渲染开销，尽量找到最小的差异（能复用的节点尽量复用）

## 15.请说明Vue中key的作用和原理，谈谈你对它的理解

在 isSameVnode 方法中会根据 key 来判断新老两个节点是否是同一个节点，key 不相同说明不是同一个节点（key 在动态列表中不要使用索引，会有 bug）

使用 key 时要尽量保证 key 的唯一性（优化 diff 算法）

## 16.谈一谈对Vue组件化的理解

组件的优点：组件的复用可以根据数据渲染对应的组件，把组件相关的内容放在一起（方便复用），可以更合理的规划组件，更新时可以实现组件级更新

组件的特性：属性、事件、插槽

> Vue 中怎样处理组件
>
> Vue.extend 根据用户传入的对象生成一个组件的构造函数
>
> 根据组件生成对应的虚拟节点 data:{hook:init}
>
> 组件初始化将虚拟节点转化为真实节点，最后挂载

## 17.`Vue`的组件渲染流程

- vm.$options.components['my']={my:模板}
- 创造组件的虚拟节点 createComponent {tag:'my',data:{hook:{init}},componentOptions:{Ctor:Vue.extend({my:模板})}}
- 创造真实节点 createComponent init -> new 组件().$mount() -> vm.componentInstance
- vm.$el 插入到父元素中

## 18.`Vue`组件更新流程

- 组件更新会触发 prepatch 方法，会复用组件，并且比较组件的属性、事件、插槽
- 父组件给子组件传递的属性（props）是响应式的，在模板中使用会进行依赖收集（props 与 子组件 Watcher）
- 父组件更新属性会重新给 props 赋值，赋值完成后会触发子组件 Watcher 更新

## 19.`Vue`中异步组件原理

异步组件默认不会调用 Vue.extend 方法，所有 Ctor 上没有 cid 属性，没有 cid 属性的就是异步组件

异步组件会先渲染一个占位符组件，但是如果有 loading 会先渲染 loading，第一轮就结束了

如果用户调用了 resolve，会将结果赋值到 factory.resolved 上，强制重新渲染

重新渲染时再次进入 resolveAsyncComponent 中，会直接拿到 factory.resolved 结果来渲染

## 20.函数组件的优势及原理

React 中也区分两种组件：一种叫类组件，一种叫函数式组件

Vue.extend 得到的 Sub 就是类组件，有 this

函数式组件没有类就没有 this，也没有所谓的状态，没有生命周期，好处就是性能好，不需要创建 Watcher

函数式组件就是调用 render 拿到返回结果来渲染，所以性能好

## 21.Vue组件间传值的方式及之间区别

- props 父组件传递数据给子组件，原理就是把解析后的 props，验证后挂载到 vm._props（这个对象上的属性都是通过 defineReactive 定义的，都是响应式的），组件渲染过程中会去 vm 上取值（_props 上的属性会被代理到 vm 上）
- emit 子组件触发事件，原理就是创建子组件虚拟节点时将所有的事件绑定到了 $listeners，通过 $on 绑定事件，通过 $emit 触发事件（发布订阅模式）
- event Bus 原理就是发布订阅模式 $bus = new Vue()
- $parent $children 原理就是在创建子组件时，会将父组件实例传入，在组件本身初始化过程中会构建组件间的父子关系 $parent 获取父组件的实例 $children 获取所有的子组件的实例
- ref 可以获取 dom 元素和组件的实例 
- provide inject 在父组件中暴露属性，在后代组件中注入属性（后代组件通过组件的父子关系递归向上查找）
- $attrs $listeners 传入子组件的所有属性（不包括 props）和所有事件
- Vue.observable 可以创建一个全局的对象用于通信（用的少）
- Vuex

## 22.v-if和v-for哪个优先级更高？

```html

<div>
    <div v-for="i in 10" v-if="flag"></div>
</div>
```

```javascript
function render() {
    with (this) {
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
    with (this) {
        return _c('div', [(flag) ? _c('div') : _e()])
    }
}
```

```javascript
function render() {
    with (this) {
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

组件的三大特性：属性、事件、插槽

插槽类型：普通插槽、具名插槽、作用域插槽

- 普通插槽（渲染作用域在父组件中）
    - 解析组件时，将组件的 children 放到 componentOptions 上作为虚拟节点的属性
    - 将 children 取出来放在组件的 vm.$options._renderChildren 上
    - 做出一个映射表放到 vm.$slots 上
    - 合并到 vm.$scopeSlots 上 vm.$scopeSlots={ a: fn, b: fn, default: fn }
    - 渲染组件时调用 _t 方法去 vm.$scopeSlots 中找到对应的函数渲染内容
- 具名插槽（与普通插槽类似，只是增加了 name）
- 作用域插槽（渲染作用域在子组件中）
    - 渲染插槽选择的作用域是子组件的，作用域插槽渲染的时候不会作为 children，而是将其生成了一个属性 scopedSlots
    - 制作映射关系 $scopedSlots={default:fn:function({msg}){return _c('div',{},[_v(_s(msg))])}}}
    - 渲染组件时通过 name 找到对应的函数，将数据传入到函数中渲染虚拟节点，然后替换 _t('default')

## 25.Vue.use是干什么的？原理是什么？

Vue.use 用来安装插件，将 Vue 的构造函数传递到插件中，让所有的插件依赖同一版本的 Vue

插件本身暴露一个函数，那就直接将 Vue 传递进去；插件本身暴露一个对象，那就将 Vue 传递给该对象的 install 方法

## 26.Vue事件修饰符有哪些？其实现原理是什么？

实现原理主要靠模板编译和 addEventListener

prevent 和 stop 编译时直接编译到事件内部了

passive、capture、once 编译时增加标识 !~&，然后结合 addEventListener 实现

键盘事件修饰符（.enter等）都是通过模板编译到事件内部实现的

## 27.Vue中.sync修饰符的作用，用法及实现原理

这个修饰符用于实现状态同步的，实现原理与 v-model 类似

```javascript
function render() {
    with (this) {
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

自定义指令就是用户定义好对应的钩子，当元素在不同的状态时会调用对应的钩子（所有的钩子会被合并到 cbs 对应的方法上，随后依次调用）

## 29.keep-alive平时在哪里使用？原理是？

keep-alive 一般搭配 route-view 和 component:is 使用

原理是缓存加载过的组件实例，内部采用 LRU 算法，下次组件切换加载时，此时会找到对应缓存的节点来进行初始化，但是会使用缓存的组件实例上的 $el；更新和销毁会分别触发 activated 和 deactivated 钩子

## 30.组件中写name选项有哪些好处及作用？

- 可以实现递归组件
  ```javascript
  // enable recursive self-lookup
  if (name) {
    Sub.options.components[name] = Sub
  }
  ```
- 标识作用，可以通过 name 找到对应的组件
- 配合 devtool 工具具名化组件
