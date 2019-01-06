export const magicIndicator = ` =>`
export const codeFenceOpen = `\n\`\`\`js\n`
export const codeFenceClose = `\n\`\`\`\n\n`
export const CODE = `code`
export const TEXT = `text`
export const EMPTY = ``
export const STAR = `*`
export const NEWLINE = `\n`
export const tokenTypes = {
  EOF: `EOF`,
  plain: `Plain`,
  comment: `Comment`,
  block: `Block`
}
const withTrailingAndOptionalWhitespace = x =>
  new RegExp(`^\\s*${x}\\s+(.*?)\\s*$`)
export const regex = {
  plain: withTrailingAndOptionalWhitespace("plain"),
  include: withTrailingAndOptionalWhitespace("include"),
  ignore: withTrailingAndOptionalWhitespace("#"),
  whitespaceEnd: /^\s*$/,
  whitespace: /^(\s*)/,
  newline: /\n/,
  strippable: /^(?:\s*\n)+/,
  strippable2: /[\s\n]*$/,
  EOF: /\n+$/,
  shebang: /^#!\/[^\n]*\n/
}
