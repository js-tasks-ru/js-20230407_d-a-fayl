/**
 * omit - creates an object composed of enumerable elemerty fields
 * @param {object} obj - the source object
 * @param {...string} fields - the elemerties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  const res = { ...obj };

  for (let elem of fields) {
    if (elem in res) {
      delete res[elem];
    }
  }
  return res;
};
