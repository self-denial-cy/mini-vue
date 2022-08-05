import {parseHTML, ELEMENT_TYPE, TEXT_TYPE, defaultTagRE} from './parse'

export function compileToFunction(template) {
    /*
    * 第一步：将 template 转换为 ast 语法树
    * 第二步：生成 render 方法，render 方法执行后返回的结果就是 virtual dom
    * */

    // 第一步：将 template 转换为 ast 语法树
    let ast = parseHTML(template)

    console.log(ast)

    // 第二步：生成 render 方法，调用 render 方法时，通过 call 方法传入当前 Vue 实例
    const code = codegen(ast)
    console.log(code)
    // 模板语法的实现原理：with + new Function
    const render = new Function(`with(this){return ${code}}`)
    console.log(render.toString())
    return render
}

function codegen(ast) {
    const children = genChildren(ast.children)
    const code = `_c("${ast.tag}",${
        ast.attrs && ast.attrs.length ? genProps(ast.attrs) : 'null'
    }${
        ast.children && ast.children.length ? `,${children}` : ''
    })`
    return code
}

function genProps(attrs) {
    let str = ''
    for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i]
        if (attr.name === 'style') {
            const styles = {}
            attr.value.split(';').forEach(item => {
                const [key, val] = item.split(':')
                styles[key] = val
            })
            attr.value = styles
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`
}

function genChildren(children) {
    return children.map(child => gen(child)).join(',')
}

function gen(child) {
    if (child.type === ELEMENT_TYPE) {
        // 元素
        return codegen(child)
    } else if (child.type === TEXT_TYPE) {
        // 文本
        const text = child.text
        if (!text.match(defaultTagRE)) {
            // 纯文本，不是模板语法
            return `_v(${JSON.stringify(text)})`
        } else {
            // 包含模板语法的情况
            const tokens = []
            let match
            defaultTagRE.lastIndex = 0 // 包含 g 的正则每次使用前需要将查询索引重置为 0
            let lastIndex = 0
            while (match = defaultTagRE.exec(text)) {
                const index = match.index // 匹配到的 index
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }
            if (lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            return `_v(${tokens.join('+')})`
        }
    }
}
