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

// ------------------------------------- немного теории про объекты и поверхностное копирование через "..."
{
  const obj = {
    color: "green",
    size: "big",
    props: {
      weight: 2,
      height: 4,
    },
  };
  function changeObject(data) {
    const copy = { ...data };
    copy.size = "small";
    copy.props.weight = "5";

    // ... - это поверхностное копирование, т.е. не мутируется только верхний уровень исходного объекта
    // вложенные объекты мутируются

    return copy;
  }
  console.log(changeObject(obj));
  console.log(obj);
}
