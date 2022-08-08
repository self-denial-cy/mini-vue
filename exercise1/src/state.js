import {observe} from './observe/index'
import Watcher from './observe/watcher'

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
        watchers[key] = new Watcher(vm, fn, {
            lazy: true
        })

        defineComputed(vm, key, userDef)
    }
}

function defineComputed(target, key, userDef) {
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    const setter = userDef.set || (() => {
    })
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

function createComputedGetter(key) {
    return function () {
        const watcher = this._computedWatchers[key]
    }
}
