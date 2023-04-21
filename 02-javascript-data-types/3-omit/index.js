/**
 * omit - creates an object composed of enumerable elemerty fields
 * @param {object} obj - the source object
 * @param {...string} fields - the elemerties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  const res = {};

  for (const key of Object.keys(obj)) {
    if (!fields.includes(key)) {
      res[key] = obj[key];
    }
  }
  return res;
};
