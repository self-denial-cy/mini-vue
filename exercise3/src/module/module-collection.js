import Module from './module';

export default class ModuleCollection {
  constructor(options) {
    this.root = null;
    this.register([], options);
  }

  // 获取命名空间
  getNamespace(path) {
    // path ['a','b']
    let module = this.root;
    return path.reduce((prefix, key) => {
      module = module.getChild(key);
      // a/b/
      return prefix + (module.namespaced ? `${key}/` : '');
    }, '');
  }

  register(path, module) {
    const newModule = new Module(module);
    // 将包装后的 module 挂载在原 module 上暴露出去
    module.newModule = newModule;
    if (this.root === null) {
      this.root = newModule;
    } else {
      const parent = path.slice(0, -1).reduce((start, current) => {
        return start.getChild(current);
      }, this.root);
      parent.addChild(path[path.length - 1], newModule);
    }
    if (module.modules) {
      Object.keys(module.modules).forEach((moduleName) => {
        const moduleValue = module.modules[moduleName];
        // ['a'] { state: {...} }
        this.register(path.concat(moduleName), moduleValue);
      });
    }
  }
}
