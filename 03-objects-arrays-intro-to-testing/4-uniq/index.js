/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  const res = [];
  if (!arr || !arr.length) {
    return res;
  }
  const set = new Set(arr);

  for (const value of set) {
    res.push(value);
  }

  return res;
}

{
  const obj = {
    0: 1,
    1: 2,
    3: 3,
    length: 3,
  };

  /* for (const item of obj) {
    console.log(item);
  } */

  console.log(Array.from(obj));
}
