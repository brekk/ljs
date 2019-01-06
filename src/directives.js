import path from "path"
import glob from "glob"
import { note } from "./utils"

/**
 * @function fileDirective
 * @param {string} filename - file path
 * @param {string} value - value for comparison
 * @param {regex} comparison - regular expression to match value
 * @param {function} callback - a function to call for every file match
 * @return {boolean} wasAnyThingMatched?
 */
export const fileDirective = note(`fileDirective`)(function _fileDirective(
  filename,
  value,
  comparison,
  callback
) {
  const match = value.match(comparison)
  if (match) {
    const directivePattern = match[1]
    const globPattern = path.join(path.dirname(filename), directivePattern)
    const files = glob.sync(globPattern)
    if (files.length === 0) {
      throw new Error(directivePattern + ` doesn't match any files`)
    }
    files.forEach(callback)
    return true
  } else {
    return false
  }
})
