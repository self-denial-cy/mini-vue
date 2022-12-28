import { forEachValue } from '../utils';

export default class Module {
  constructor(module) {
    this._raw = module;
    this.state = module.state;
    this._children = {};
  }

  addChild(key, module) {
    this._children[key] = module;
  }

  getChild(key) {
    return this._children[key];
  }

  forEachMutation(callback) {
    if (this._raw.mutations) {
      forEachValue(this._raw.mutations, callback);
    }
  }

  forEachAction(callback) {
    if (this._raw.actions) {
      forEachValue(this._raw.actions, callback);
    }
  }

  forEachGetter(callback) {
    if (this._raw.getters) {
      forEachValue(this._raw.getters, callback);
    }
  }

  forEachModule(callback) {
    forEachValue(this._children, callback);
  }
}
