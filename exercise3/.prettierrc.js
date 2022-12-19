module.exports = {
  // 代码结尾是否加分号
  semi: true,
  // 是否使用单引号
  singleQuote: true,
  // 对象大括号内两边是否加空格 { a:0 }
  bracketSpacing: true,
  // 单个参数的箭头函数不加括号 x => x
  arrowParens: 'always',
  // 超过多少字符强制换行
  printWidth: 120,
  // 文件换行格式 LF/CRLF
  endOfLine: 'lf',
  // 使用 4 个空格缩进
  tabWidth: 2,
  // 不使用缩进符，而使用空格
  useTabs: false,
  // 对象的 key 仅在必要时用引号
  quoteProps: 'as-needed',
  // 末尾不需要逗号
  trailingComma: 'none',
  // 每个文件格式化的范围是文件的全部内容
  rangeStart: 0,
  rangeEnd: Infinity,
  // 不需要写文件开头的 @prettier
  requirePragma: false,
  // 不需要自动在文件开头插入 @prettier
  insertPragma: false,
  // 使用默认的折行标准
  proseWrap: 'preserve',
  // Vue 文件脚本和样式标签缩进
  vueIndentScriptAndStyle: false
};
