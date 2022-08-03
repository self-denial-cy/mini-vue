/* 响应式模块 */

export function observe(data) {
    if (typeof data !== 'object' || data === null) {
        return
    }
    /* 预备劫持对象 */
    return new Observer(data)
}

class Observer {
    constructor(data) {
        if (Array.isArray(data)) {
            /* 重写数组的 7个变异方法，这些方法是可以修改数组本身的，但是要保留原有的一些方法 */
            // TODO
            /* 在这里还要对数组中的引用类型进行 observe */
            this.observeArray(data)
        } else {
            /* 遍历对象 */
            this.walk(data)
        }
    }

    walk(data) {
        /* 遍历对象所有属性重新定义属性，是 Vue2 的性能瓶颈之一 */
        /* 且只能遍历初始定义好的属性，也是 Vue2 新增 $set $delete api 的原因 */
        Object.keys(data).forEach(key => {
            defineReactive(data, key, data[key])
        })
    }

    observeArray(data) {
        data.forEach(item => {
            observe(item)
        })
    }
}

export function defineReactive(target, key, value) {
    /* 递归处理 */
    observe(value)
    /* 这里使用一个闭包 */
    /* 属性劫持 */
    Object.defineProperty(target, key, {
        get() {
            return value
        },
        set(v) {
            if (v === value) return
            value = v
        }
    })
}
