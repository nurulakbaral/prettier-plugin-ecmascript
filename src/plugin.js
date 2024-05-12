import * as Prettier from 'prettier'
import * as ECMAScript from 'acorn'

let $ = Prettier.doc.builders

const languages = [
  {
    name: 'ECMAScript',
    extensions: ['.ecmascript'],
    parsers: ['ecmaScriptParse'],
  },
]

const parsers = {
  ecmaScriptParse: {
    /**
     * @param {string} text
     */
    parse: (text) =>
      ECMAScript.Parser.parse(text, {
        ecmaVersion: 'latest',
      }),
    astFormat: 'ecmaScriptAst',
    /**
     * @param {ECMAScript.Node} node
     */
    locStart: (node) => node.start,
    /**
     * @param {ECMAScript.Node} node
     */
    locEnd: (node) => node.end,
  },
}

const printers = {
  ecmaScriptAst: {
    /**
     *
     * @param {Prettier.AstPath<ECMAScript.Program | ECMAScript.Node>} path
     * @param {Prettier.ParserOptions} options
     * @param {(path: Prettier.AstPath<ECMAScript.Program>) => Prettier.Doc} print
     * @returns Prettier.Doc | string
     */
    print: (path, options, print) => {
      let node = path.getNode()

      return options.originalText
    },
  },
}

const plugin = {
  languages,
  parsers,
  printers,
}

export default plugin
