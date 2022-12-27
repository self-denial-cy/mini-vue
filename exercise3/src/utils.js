export const forEachValue = (target, callback) => {
  Object.keys(target).forEach((key) => {
    callback(key, target[key]);
  });
};
