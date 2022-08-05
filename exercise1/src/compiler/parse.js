const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

export const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
export const ELEMENT_TYPE = 1 // 元素类型
export const TEXT_TYPE = 3 // 文本类型

export function parseHTML(html) {
    const stack = [] // 栈，用于存放 node
    let currentParent // 指针，始终指向栈结构中最后一项，同时也是当前 node 的 parent
    let root // 树结构的根节点

    // html 以 < 开始
    while (html) {
        // 如果 textEnd 为 0 说明是一个开始标签或者是结束标签
        // 如果 textEnd 大于 0 说明就是文本的结束位置
        let textEnd = html.indexOf('<')
        if (textEnd === 0) {
            // 开始标签的匹配结果
            const startTagMatch = parseStartTag()
            if (startTagMatch) {
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }

            // 结束标签的匹配结果
            const endTagMatch = html.match(endTag)
            if (endTagMatch) {
                end(endTagMatch[1])
                advance(endTagMatch[0].length)
                continue
            }
        }
        if (textEnd > 0) {
            let text = html.substring(0, textEnd) // 文本内容
            if (text) {
                chars(text)
                advance(text.length)
            }
        }
    }

    return root

    function parseStartTag() {
        const start = html.match(startTagOpen)
        if (start) {
            const match = {
                tagName: start[1], // 标签名
                attrs: []
            }
            advance(start[0].length)

            // 如果不是开始标签的结束，且一直匹配到属性，就一直匹配下去
            let attr, end
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length)
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
            }

            if (end) {
                advance(end[0].length)
            }

            return match
        }

        // 不是开始标签
        return false
    }

    function advance(len) {
        html = html.substring(len)
    }

    function start(tag, attrs) {
        const node = createASTElement(tag, attrs)
        if (!root) {
            root = node
        }
        if (currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }
        stack.push(node)
        currentParent = node
    }

    function chars(text) {
        text = text.replace(/\s/g, '') // 简化版，简单处理一下换行符
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
    }

    function end(tag) {
        const node = stack.pop()
        /*if (node.tag !== tag) {
            可用于校验标签
        }*/
        currentParent = stack[stack.length - 1]
    }

    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }
}
