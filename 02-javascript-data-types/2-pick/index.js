/**
 * pick - Creates an object composed of the picked object elemerties:
 * @param {object} obj - the source object
 * @param {...string} fields - the elemerties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  const res = {};

  for (const elem of fields) {
    if (obj.hasOwnProperty(elem)) {
      res[elem] = obj[elem];
    }
  }
  return res;
};
