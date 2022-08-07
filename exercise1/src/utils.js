// 策略模式，动态匹配合并的 key，减少 if-else 块，同时支持后续扩展
const strats = {}
const LIFECYCLE = ['beforeCreate', 'created', 'mounted']
LIFECYCLE.forEach(hook => {
    strats[hook] = function (p, c) {
        if (c) {
            if (p) {
                return p.concat(c)
            } else {
                return [c]
            }
        } else {
            return p
        }
    }
})

export function mergeOptions(parent, child) {
    let options = {}

    // 通过两个 for in 循环，能够将所有的 key 抓到进行处理
    for (const key in parent) {
        mergeField(key)
    }
    for (const key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key)
        }
    }

    function mergeField(key) {
        if (strats[key]) {
            options[key] = strats[key](parent[key], child[key])
        } else {
            options[key] = child[key] || parent[key]
        }
    }

    return options
}
