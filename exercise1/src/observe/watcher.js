import {pushTarget, popTarget} from './dep'

// Watcher id 用于识别 Watcher
let id = 0

/* 每个组件都有一个 Watcher */
class Watcher {
    /*
    * vm Watcher 对应的组件实例
    * exprOrFn 对应组件的渲染方法
    * */
    constructor(vm, exprOrFn, options, cb) {
        this.vm = vm
        this.id = id++
        this.options = options

        if (typeof exprOrFn === 'string') {
            this.getter = function () {
                return vm[exprOrFn]
            }
        } else {
            this.getter = exprOrFn // getter 意味着调用该方法会发生属性取值
        }


        this.deps = [] // Watcher 收集 Dep 为了后续的清理工作
        this.depIds = new Set() // 去重

        this.lazy = options.lazy
        this.dirty = this.lazy

        // 标识是用户自己创建的 Watcher
        this.user = options.user

        this.cb = cb

        this.value = this.lazy ? undefined : this.get()
    }

    evaluate() {
        this.value = this.get()
        this.dirty = false
    }

    depend() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend()
        }
    }

    get() {
        pushTarget(this) // 将当前 Watcher 实例暴露给 Dep
        const value = this.getter.call(this.vm) // 在属性取值期间，当前 Watcher 实例对所有涉及到取值操作的属性可见
        popTarget() // 属性取值完毕之后重置
        return value
    }

    addDep(dep) {
        const id = dep.id
        if (!this.depIds.has(id)) {
            this.depIds.add(id)
            this.deps.push(dep)
            dep.addSub(this)
        }
    }

    update() {
        // 当 Dep 通知 Watcher 更新时，将所有的 计算属性 Watcher dirty 重置为 true
        // 最终异步刷新队列执行 渲染 Watcher，此时所有的计算属性都可以进行重新计算
        if (this.lazy) {
            this.dirty = true
        } else {
            queueWatcher(this)
        }
    }

    run() {
        const oldVal = this.value
        const newVal = this.value = this.get()
        if (this.user) {
            this.cb.call(this.vm, newVal, oldVal)
        }
    }
}

let queue = []
let has = {}
let pending = false // 防抖

function queueWatcher(watcher) {
    const id = watcher.id
    // 针对同一个 Watcher 的连续触发，只记录第一次
    if (!has[id]) {
        queue.push(watcher)
        has[id] = true
        // 针对多个 Watcher 被触发，设置一个异步刷新任务，最终一次性刷新
        if (!pending) {
            setTimeout(flushSchedulerQueue, 0)
            pending = true
        }
    }
}

function flushSchedulerQueue() {
    const flushQueue = queue.slice(0)
    queue = []
    has = {}
    pending = false
    flushQueue.forEach(q => q.run())
}

let callbacks = []
let waiting = false

// nextTick 将传入的回调函数缓存成一个异步执行队列，与 Watcher 的异步刷新队列拉到了同一维度
// Vue 中并没有直接采用某个 api 而是采用了优雅降级的方式
// Promise（不兼容 ie） MutationObserver（h5 api） setImmediate（ie 独有） setTimeout
export function nextTick(cb) {
    callbacks.push(cb)
    if (!waiting) {
        setTimeout(flushCallbacks, 0)
        waiting = true
    }
}

function flushCallbacks() {
    const cbs = callbacks.slice(0)
    callbacks = []
    waiting = false
    cbs.forEach(cb => cb())
}

// 一个组件对应着多个属性 一个属性可以在多个组件中使用 组件和属性的关系是多对多
// Watcher——组件 Dep——属性
export default Watcher
