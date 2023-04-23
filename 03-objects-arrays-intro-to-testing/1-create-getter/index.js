/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const arrayPath = path.split(".");

  return function showObjectProp(obj) {
    let res = obj;

    for (const item of arrayPath) {
      if (res === undefined) {
        break;
      }
      res = res[item];
    }

    return res;
  };
}
