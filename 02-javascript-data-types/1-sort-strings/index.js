/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = "asc") {
  const directions = {
    asc: 1,
    desc: -1,
  };
  const direction = directions[param];

  if (!Array.isArray(arr)) {
    throw new Error(
      "This function waits for array only. Please, check your first argument!"
    );
  } else if (typeof direction === "undefined") {
    throw new Error(
      'This function waits for param with value "desc" or "asc" only'
    );
  }

  return [...arr].sort((a, b) => {
    return direction * a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" });
  });
}
