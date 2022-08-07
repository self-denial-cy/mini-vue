import Dep from './dep'

// Watcher id 用于识别 Watcher
let id = 0

/* 每个组件都有一个 Watcher */
class Watcher {
    /*
    * vm Watcher 对应的组件实例
    * fn 对应组件的渲染方法
    * */
    constructor(vm, fn, isRender) {
        this.id = id++
        this.renderWatcher = isRender
        this.getter = fn // getter 意味着调用该方法会发生属性取值
        this.deps = [] // Watcher 收集 Dep 为了后续的清理工作
        this.depIds = new Set() // 去重
        this.get()
    }

    get() {
        Dep.target = this // 将当前 Watcher 实例暴露给 Dep
        this.getter() // 在属性取值期间，当前 Watcher 实例对所有涉及到取值操作的属性可见
        Dep.target = null // 属性取值完毕之后重置
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
        queueWatcher(this)
    }

    run() {
        this.get()
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
