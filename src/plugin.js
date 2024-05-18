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
        let ProgramDoc = [...$.join($.hardline, path.map(print, 'body')), $.hardline];

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
        let VariableDeclaratorDoc = $.group([path.call(print, 'id'), ' =', path.call(print, 'init')]);

        return VariableDeclaratorDoc;
      }

      /** @type {ECMAScript.Identifier} identifierNode */
      let identifierNode = node;
      if (identifierNode.type === 'Identifier') {
        let IdentifierDoc = '';

        /** @type {ECMAScript.Property} parentNodeProperty */
        let parentNodeProperty = path.getParentNode();
        if (parentNodeProperty.type === 'Property') {
          /** Key: String */
          IdentifierDoc = identifierNode.name;

          return IdentifierDoc;
        }

        /** Primitive: Undefined */
        if (identifierNode.name === 'undefined') {
          let groupId = Symbol('assignment');
          IdentifierDoc = [
            $.group($.indent($.line), {
              id: groupId,
            }),
            $.lineSuffixBoundary,
            $.indentIfBreak('undefined', { groupId }),
          ];

          return IdentifierDoc;
        }

        IdentifierDoc = $.group(identifierNode.name);

        return IdentifierDoc;
      }

      /** @type {ECMAScript.Literal} literalNode */
      let literalNode = node;
      if (literalNode.type === 'Literal') {
        let LiteralDoc = '';

        /** @type {ECMAScript.ArrayExpression} parentNodeArrayExpression */
        let parentNodeArrayExpression = path.getParentNode();
        if (parentNodeArrayExpression.type === 'ArrayExpression') {
          /** Array Element: Number or String */
          if (typeof literalNode.value === 'number' || typeof literalNode.value === 'string') {
            LiteralDoc = $.group(literalNode.raw);
          }

          return LiteralDoc;
        }

        /** @type {ECMAScript.Property} parentNodeProperty */
        let parentNodeProperty = path.getParentNode();
        if (parentNodeProperty.type === 'Property') {
          /** Key & Value: Number or String */
          if (typeof literalNode.value === 'number' || typeof literalNode.value === 'string') {
            LiteralDoc = literalNode.raw;
          }

          return LiteralDoc;
        }

        /** Primitive: Number */
        if (typeof literalNode.value === 'number') {
          LiteralDoc = [' ', literalNode.raw];
          return LiteralDoc;
        }

        /** Primitive: String */
        if (typeof literalNode.value === 'string') {
          LiteralDoc = $.group($.indent([$.line, literalNode.raw]));
          return LiteralDoc;
        }

        /** Primitive: Null */
        if (literalNode.value === null) {
          let groupId = Symbol('assignment');
          LiteralDoc = [
            $.group($.indent($.line), {
              id: groupId,
            }),
            $.lineSuffixBoundary,
            $.indentIfBreak('null', { groupId }),
          ];

          return LiteralDoc;
        }
      }

      /** @type {ECMAScript.ArrayExpression} assignmentExpressionNode */
      let arrayExpressionNode = node;
      if (arrayExpressionNode.type === 'ArrayExpression') {
        let groupId = Symbol('assignment');
        let elementsDoc = [];

        for (let index = 0; index < arrayExpressionNode.elements.length; index++) {
          let elementDoc = path.call(print, 'elements', index);
          elementsDoc.push(elementDoc);
        }

        let ArrayExpressionDoc = [
          $.group($.indent($.line), {
            id: groupId,
          }),
          $.lineSuffixBoundary,
          $.indentIfBreak(
            $.group(['[', $.indent([$.softline, $.join([',', $.line], elementsDoc), $.ifBreak(',')]), $.softline, ']']),
            { groupId },
          ),
        ];

        return ArrayExpressionDoc;
      }

      /** @type {ECMAScript.ObjectExpression} objectExpressionNode */
      let objectExpressionNode = node;
      if (objectExpressionNode.type === 'ObjectExpression') {
        let groupId = Symbol('assignment');
        let propertiesDoc = [];

        for (let index = 0; index < objectExpressionNode.properties.length; index++) {
          let propertyDoc = path.call(print, 'properties', index);
          propertiesDoc.push(propertyDoc);
        }

        let ObjectExpressionDoc = [
          $.group($.indent($.line), {
            id: groupId,
          }),
          $.lineSuffixBoundary,
          $.indentIfBreak(
            $.group(['{', $.indent([$.line, $.join([',', $.line], propertiesDoc)]), $.ifBreak(','), $.line, '}']),
            { groupId },
          ),
        ];

        return ObjectExpressionDoc;
      }

      /** @type {ECMAScript.Property} propertyNode */
      let propertyNode = node;
      if (propertyNode.type === 'Property') {
        let PropertyDoc = $.group($.group([$.group(path.call(print, 'key')), ':', ' ', path.call(print, 'value')]));

        return PropertyDoc;
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
