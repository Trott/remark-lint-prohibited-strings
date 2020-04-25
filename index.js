'use strict';

const position = require('unist-util-position');
const rule = require('unified-lint-rule');
const visit = require('unist-util-visit');
const vfileLocation = require('vfile-location');

var start = position.start;

module.exports = rule('remark-lint:prohibited-strings', prohibitedStrings);

function testProhibited(val, content) {
  let regexpString = '(\\.|@[a-zA-Z0-9/-]*)?';

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
      return { result: result[2], index: result.index };
    }
  }

  return false;
}

function prohibitedStrings(ast, file, strings) {
  const location = vfileLocation(file);
  visit(ast, 'text', checkText);

  function checkText(node) {
    const content = node.value;
    const initial = start(node).offset;

    strings.forEach((val) => {
      const { result, index } = testProhibited(val, content);
      if (result) {
        file.message(`Use "${val.yes}" instead of "${result}"`, {
          start: location.toPosition(initial + index),
          end: location.toPosition(initial + index + [...result].length)
        });
      }
    });
  }
}
