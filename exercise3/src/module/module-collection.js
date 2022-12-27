import Module from './module';

export default class ModuleCollection {
  constructor(options) {
    this.root = null;
    this.register([], options);
  }

  register(path, module) {
    const newModule = new Module(module);
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
