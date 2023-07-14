/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (!obj || obj.toString() !== "[object Object]") {
    return;
  } else if (!Object.keys(obj).length) {
    return {};
  }

  const res = {};
  const propsArray = Object.entries(obj);
  for (const arr of propsArray) {
    res[arr[1]] = arr[0];
  }
  return res;
}
