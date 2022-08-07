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
        this.get()
    }
}

// 一个组件对应着多个属性 一个属性可以在多个组件中使用 组件和属性的关系是多对多
// Watcher——组件 Dep——属性
export default Watcher
