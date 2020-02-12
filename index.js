'use strict';

const rule = require('unified-lint-rule');
const visit = require('unist-util-visit');

module.exports = rule('remark-lint:prohibited-strings', prohibitedStrings);

function testProhibited(val, content) {
  let regexpString = '(\\.|@[a-z0-9/-]*)?';

  // If it starts with a letter, make sure it is a word break.
  if (/^\b/.test(val.no)) {
    regexpString += '\\b';
  }
  regexpString += `(${val.no})`;

  // If it ends with a letter, make sure it is a word break.
  if (/\b$/.test(val.no)) {
    regexpString += '\\b';
  }
  regexpString += '(\\.\\w)?';
  const re = new RegExp(regexpString, 'g');

  let result = null;
  while (result = re.exec(content)) {
    if (!result[1] && !result[3]) {
      return result[2];
    }
  }

  return false;
}

function prohibitedStrings(ast, file, strings) {
  visit(ast, 'text', checkText);

  function checkText(node) {
    const content = node.value;

    strings.forEach((val) => {
      const result = testProhibited(val, content);
      if (result) {
        file.message(`Use "${val.yes}" instead of "${result}"`, node);
      }
    });
  }
}
