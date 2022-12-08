// 策略模式，动态匹配合并的 key，减少 if-else 块，同时支持后续扩展
const strats = {};
const LIFECYCLE = ['beforeCreate', 'created', 'mounted'];
LIFECYCLE.forEach((hook) => {
  strats[hook] = function (p, c) {
    if (c) {
      if (p) {
        return p.concat(c);
      } else {
        return [c];
      }
    } else {
      return p;
    }
  };
});

strats['components'] = function (p, c) {
  // 构建了组件链，先从自身找，再沿着链向上寻找
  const components = Object.create(p);
  if (c) {
    for (const key in c) {
      components[key] = c[key];
    }
  }
  return components;
};

export function mergeOptions(parent, child) {
  let options = {};

  // 通过两个 for in 循环，能够将所有的 key 抓到进行处理
  for (const key in parent) {
    mergeField(key);
  }
  for (const key in child) {
    if (!Object.prototype.hasOwnProperty.call(parent, key)) {
      mergeField(key);
    }
  }

  function mergeField(key) {
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key]);
    } else {
      options[key] = child[key] || parent[key];
    }
  }

  return options;
}
