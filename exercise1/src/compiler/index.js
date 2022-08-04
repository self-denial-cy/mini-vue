const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const startTagClose = /^\s*(\/?)>/
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

export function compileToFunction(template) {
    /*
    * 第一步：将 template 转换为 ast 语法树
    * 第二步：生成 render 方法，render 方法执行后返回的结果就是 virtual dom
    * */

    // 第一步：将 template 转换为 ast 语法树
    let ast = parseHTML(template)
}

function parseHTML(html) {
    // html 以 < 开始
    while (html) {
        // 如果 textEnd 为 0 说明是一个开始标签或者是结束标签
        // 如果 textEnd 大于 0 说明就是文本的结束位置
        let textEnd = html.indexOf('<')
        if (textEnd === 0) {
            // 开始标签的匹配结果
            const startTagMatch = parseStartTag()
            if (startTagMatch) {
                console.log(html)
                continue
            }

            // 结束标签的匹配结果
            const endTagMatch = html.match(endTag)
            if (endTagMatch) {
                advance(endTagMatch[0].length)
                continue
            }
        }
        if (textEnd > 0) {
            let text = html.substring(0, textEnd) // 文本内容
            if (text) {
                advance(text.length)
            }
        }
    }

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
}
