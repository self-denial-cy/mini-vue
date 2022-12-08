# mini-vue-2

## [exercise1](./exercise1)

个人搭建的极简 vue2，实现了简易版 compiler、observe、vdom、global-api 等

### 安装依赖

```shell
# rollup-plugin-sizes 很久不更新，peer 需要 rollup@"^2.0.0"，但是项目中使用的 rollup@"^3.4.0"，但是不影响
npm i --legacy-peer-deps

cd examples

npm i
```

### 运行

```shell
npm run dev

cd examples

npm run server
```

> 开发模式已经开启了 sourcemap，进入 examples 目录可以根据现有案例或自写案例 debugger 源码
