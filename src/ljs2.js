import fs from "fs"
import sywac from "sywac"
import F from "fluture"
import literate from "./literate"

const ljs2 = () => {
  const cli = new F((bad, good) => {
    sywac
      .showHelpByDefault()
      .help("-h, --help")
      .version("-v, --version")
      .string("-i, --input", { desc: "An input file" })
      .string("-o, --output", { desc: "An output file" })
      .boolean("-C, --no-code", {
        desc: "Don't include code in the output file"
      })
      .boolean("-M, --no-meld", { desc: "Don't meld consecutive line-breaks" })
      .outputSettings({ maxWidth: 75 })
      .parseAndExit()
      .catch(bad)
      .then(good)
  })
  return cli.map(program => {
    console.log(JSON.stringify(program, null, 2), "... config")
    const {
      output,
      "no-meld": noMeld,
      "no-code": noCode,
      input: filename
    } = program
    console.log(output, noMeld, noCode, filename, "<<<")
    let litContents
    try {
      litContents = literate(filename, { code: !noCode })
    } catch (e) {
      process.stderr.write("Error while literating -- " + e.message)
      return 1
    }
    if (!noMeld) {
      litContents = litContents.replace(/\n\n+/g, "\n\n")
    }
    if (output) {
      fs.writeFileSync(output, litContents, "utf8")
    } else {
      process.stdout.write(litContents)
    }
  })
}

export default ljs2
