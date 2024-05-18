import * as Prettier from 'prettier';
import * as ECMAScript from 'acorn';

let $ = Prettier.doc.builders;

const languages = [
  {
    name: 'ECMAScript',
    extensions: ['.ecmascript'],
    parsers: ['ecmaScriptParse'],
  },
];

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
};

const printers = {
  ecmaScriptAst: {
    /**
     *
     * @param {Prettier.AstPath<unknown>} path
     * @param {Prettier.ParserOptions} options
     * @param {(path: Prettier.AstPath<ECMAScript.Program>) => Prettier.Doc} print
     * @returns Prettier.Doc | string
     */
    print: (path, options, print) => {
      let node = path.getNode();

      /** @type {ECMAScript.Program} programNode */
      let programNode = node;
      if (programNode.type === 'Program') {
        let ProgramDoc = [
          ...$.join($.hardline, path.map(print, 'body')),
          $.hardline,
        ];

        return ProgramDoc;
      }

      /** @type {ECMAScript.VariableDeclaration} variableDeclarationNode */
      let variableDeclarationNode = node;
      if (variableDeclarationNode.type === 'VariableDeclaration') {
        let VariableDeclarationDoc = $.group([
          variableDeclarationNode.kind,
          ' ',
          path.call(print, 'declarations', 0),
          ';',
        ]);

        return VariableDeclarationDoc;
      }

      /** @type {ECMAScript.VariableDeclarator} variableDeclaratorNode */
      let variableDeclaratorNode = node;
      if (variableDeclaratorNode.type === 'VariableDeclarator') {
        const VariableDeclaratorDoc = $.group([
          path.call(print, 'id'),
          ' =',
          path.call(print, 'init'),
        ]);

        return VariableDeclaratorDoc;
      }

      /** @type {ECMAScript.Identifier} identifierNode */
      let identifierNode = node;
      if (identifierNode.type === 'Identifier') {
        const IdentifierDoc = $.group(identifierNode.name);

        return IdentifierDoc;
      }

      /** @type {ECMAScript.Literal} literalNode */
      let literalNode = node;
      if (literalNode.type === 'Literal') {
        let LiteralDoc = null;

        if (typeof literalNode.value === 'number') {
          LiteralDoc = [' ', literalNode.raw];
          return LiteralDoc;
        }

        if (typeof literalNode.value === 'string') {
          LiteralDoc = $.group($.indent([$.line, literalNode.raw]));
          return LiteralDoc;
        }
      }
    },
  },
};

const plugin = {
  languages,
  parsers,
  printers,
};

export default plugin;
