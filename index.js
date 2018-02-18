'use strict';

const rule = require('unified-lint-rule');
const visit = require('unist-util-visit');

module.exports = rule('remark-lint:prohibited-strings', prohibitedStrings);

function testProhibited(val, content) {
  const re = new RegExp(`(\\.)?${val.no}(\\.\\w)?`, 'g');

  let result = null;
  while (result = re.exec(content)) {
    if (!result[1] && !result[2]) {
      return true;
    }
  }

  return false;
}

function prohibitedStrings(ast, file, strings) {
  visit(ast, 'text', checkText);

  function checkText(node) {
    const content = node.value;

    strings.forEach((val) => {
      if (testProhibited(val, content)) {
        file.message(`Use "${val.yes}" instead of "${val.no}"`, node);
      }
    });
  }
}
