import * as Prettier from 'prettier';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import config from '../prettier.config.js';
import plugin from '../src/plugin.js';

export function getSourceCode(path) {
  try {
    let content = readFileSync(path, 'utf-8');
    return content;
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
    if (typeof e === 'string') {
      throw new Error(e);
    }
  }
  return '';
}

let actual = await Prettier.format(getSourceCode('./fixtures/input.ecmascript'), {
  ...config,
  parser: 'ecmaScriptParse',
  plugins: [plugin],
});
let expected = getSourceCode('./fixtures/output.ecmascript');

try {
  assert.equal(actual, expected);
  console.log('✅ Test passed\n');
  console.log('📋 Actual: \n', actual);
  console.log('📋 Expected: \n', expected);
} catch (e) {
  console.error(e);
  console.error('Actual:', actual);
  console.error('Expected:', expected);
  process.exit(1);
}
