/* 重写数组的部分方法 */

// 暂存数组的原型对象
const oldArrayProto = Array.prototype

// 生成新的数组原型对象，在新的数组原型对象上重写数组部分方法，同时保留数组的其它方法
export const newArrayProto = Object.create(oldArrayProto)

// 需要重写的 7 个变异方法列表
const methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']

methods.forEach(method => {
    newArrayProto[method] = function (...args) {
        const result = oldArrayProto[method].call(this, ...args)

        const ob = this.__ob__
        let inserted
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break
            case 'splice':
                inserted = args.slice(2)
                break
            default:
                break
        }
        if (inserted) {
            // 对通过 push unshift splice 方法新增的内容继续观测
            ob.observeArray(inserted)
        }

        // 数组本身发生变化，数组的 Observer 上的 Dep 通知对应的 Watcher 进行视图更新
        ob.dep.notify()

        // 返回执行结果
        return result
    }
})
