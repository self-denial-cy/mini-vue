let id = 0

class Dep {
    constructor() {
        this.id = id++
        this.subs = [] // 当前属性对应的 Watcher 队列
    }

    depend() {
        Dep.target.addDep(this)
    }

    notify() {
        // 属性变更，通知依赖当前属性的 Watcher 更新
        this.subs.forEach(watcher => watcher.update())
    }

    addSub(watcher) {
        this.subs.push(watcher)
    }
}

Dep.target = null

const stack = []

export function pushTarget(watcher) {
    stack.push(watcher)
    Dep.target = watcher
}

export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length - 1]
}

export default Dep
