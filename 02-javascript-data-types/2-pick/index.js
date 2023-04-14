/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  const res = {};
  const arrayWithArgs = fields;

  for (let i = 0; i < arrayWithArgs.length; i++) {
    if (arrayWithArgs[i] in obj) {
      res[arrayWithArgs[i]] = obj[arrayWithArgs[i]];
    }
  }
  return res;
};

{
  /* const object = {
    age: 30,
    name: "Dmitriy",
    id: 4578,
    isMarried: true,
  };

  function pick(obj, ...args) {}

  console.log(pick(object, "age", "id", "name")); */
}
