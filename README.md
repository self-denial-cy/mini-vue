# mini-vue-2

## [exercise1](./exercise1)

个人搭建的极简 vue2，实现了简易版 compiler、observe、vdom、global-api 等

### 安装

```shell
# 因为 rollup-plugin-sizes 很久不更新，peer 需要 rollup@"^2.0.0"，但是项目中使用的 rollup@"^3.4.0"，但是不影响使用
npm i --legacy-peer-deps
```

### 运行

```shell
npm run dev
```

> 已经开启了 sourcemap，进入 examples 目录可以根据现有案例或自写案例 debugger 源码
>
> examples 目录中的案例可以通过 vscode 的 live server 插件运行
