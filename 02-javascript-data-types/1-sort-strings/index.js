/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  let res = [...arr];

  res.sort((a, b) => a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" }));

  if (param === "desc") {
    res.reverse();
  }
  return res;
}