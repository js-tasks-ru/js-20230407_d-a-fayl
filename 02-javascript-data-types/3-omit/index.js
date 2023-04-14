/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  const res = { ...obj };
  const arrayWithArgs = fields;

  for (let i = 0; i < arrayWithArgs.length; i++) {
    if (arrayWithArgs[i] in res) {
      delete res[arrayWithArgs[i]];
    }
  }
  return res;
};
