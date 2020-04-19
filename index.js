'use strict';

const escapeStringRegexp = require('escape-string-regexp');
const position = require('unist-util-position');
const rule = require('unified-lint-rule');
const visit = require('unist-util-visit');
const vfileLocation = require('vfile-location');

const start = position.start;

module.exports = rule('remark-lint:prohibited-strings', prohibitedStrings);

function testProhibited(val, content) {
  if (!val.no) {
    val.no = val.yes;
  }

  let regexpString = '(\\.|@[a-zA-Z0-9/-]*)?';

  const ignoreNextTo =
    val.ignoreNextTo ? escapeStringRegexp(val.ignoreNextTo) : '';

  // If it starts with a letter, make sure it is a word break.
  if (/^\b/.test(val.no)) {
    regexpString += '\\b';
  }
  if (ignoreNextTo) {
    regexpString += `(?<!${ignoreNextTo})`;
  }

  regexpString += `(${val.no})`;

  if (ignoreNextTo) {
    regexpString += `(?!${ignoreNextTo})`;
  }

  // If it ends with a letter, make sure it is a word break.
  if (/\b$/.test(val.no)) {
    regexpString += '\\b';
  }
  regexpString += '(\\.\\w)?';
  const re = new RegExp(regexpString, 'gi');

  let result = null;
  const results = [];
  while (result = re.exec(content)) {
    // TODO: This can now be replaced with lookarounds now that Node.js 8 is no
    // longer supported.
    if (!result[1] && !result[3] && result[2] !== val.yes) {
      results.push({ result: result[2], index: result.index });
    }
  }

  return results;
}

function prohibitedStrings(ast, file, strings) {
  const location = vfileLocation(file);

  visit(ast, 'text', checkText);

  function checkText(node) {
    const content = node.value;
    const initial = start(node).offset;

    strings.forEach((val) => {
      const results = testProhibited(val, content);
      if (results.length) {
        results.forEach(({ result, index }) => {
          const message = val.yes ? `Use "${val.yes}" instead of "${result}"` :
            `Do not use "${result}"`;
          file.message(message, {
            start: location.toPosition(initial + index),
            end: location.toPosition(initial + index + [...result].length)
          });
        });
      }
    });
  }
}
