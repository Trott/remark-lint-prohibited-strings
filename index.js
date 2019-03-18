'use strict';

const rule = require('unified-lint-rule');
const visit = require('unist-util-visit');

module.exports = rule('remark-lint:prohibited-strings', prohibitedStrings);

function testProhibited(val, content) {
  const re = new RegExp(`(\\.|@[a-z0-9/-]*)?(${val.no})(\\.\\w)?`, 'g');

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
