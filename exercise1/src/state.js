import {observe} from './observe/index'
import Watcher from './observe/watcher'
import Dep from './observe/dep'

export function initState(vm) {
    const opts = vm.$options
    if (opts.data) {
        initData(vm)
    }
    if (opts.computed) {
        initComputed(vm)
    }
}

function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key]
        },
        set(v) {
            vm[target][key] = v
        }
    })
}

function initData(vm) {
    let data = vm.$options.data
    if (typeof data === 'function') {
        data = data.call(vm)
    }

    vm._data = data

    observe(data)

    for (const key in data) {
        proxy(vm, '_data', key)
    }
}

function initComputed(vm) {
    const computed = vm.$options.computed
    const watchers = vm._computedWatchers = {}

    for (const key in computed) {
        const userDef = computed[key]

        const fn = typeof userDef === 'function' ? userDef : userDef.get
        // 在渲染 Watcher 定义之前，所有的计算属性 Watcher 已经定义好了
        watchers[key] = new Watcher(vm, fn, {
            lazy: true // lazy 标识该 Watcher 是计算属性 Watcher
        })

        defineComputed(vm, key, userDef)
    }
}

function defineComputed(target, key, userDef) {
    // const getter = typeof userDef === 'function' ? userDef : userDef.get
    const setter = userDef.set || (() => {
    })
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

// 🤢 绕来绕去的计算属性 本质上基于惰性 Watcher 实现
function createComputedGetter(key) {
    return function () {
        const watcher = this._computedWatchers[key]
        if (watcher.dirty) {
            watcher.evaluate()
        }
        // 通知计算属性依赖的 Dep 继续向上收集 Watcher，直到最终收集到 渲染 Watcher
        if (Dep.target) {
            watcher.depend()
        }
        return watcher.value
    }
}
