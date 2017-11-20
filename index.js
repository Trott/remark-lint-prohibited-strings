'use strict';

const rule = require('unified-lint-rule');
const visit = require('unist-util-visit');

module.exports = rule('remark-lint:prohibited-strings', prohibitedStrings);

function prohibitedStrings(ast, file, strings) {
  visit(ast, 'text', checkText);

  function checkText(node) {
    const content = node.value;

    strings.forEach((val) => {
      const re = new RegExp(`(?<!\\.)${val.no}(?!\\.\\w)`);
      if (re.test(content)) {
        file.message(`Use "${val.yes}" instead of "${val.no}"`, node);
      }
    });
  }
}
