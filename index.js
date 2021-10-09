'use strict'

import escapeStringRegexp from 'escape-string-regexp'
import { pointStart } from 'unist-util-position'
import { lintRule } from 'unified-lint-rule'
import { visit } from 'unist-util-visit'
import { location } from 'vfile-location'

const remarkLintProhibitedStrings = lintRule('remark-lint:prohibited-strings', prohibitedStrings)

export default remarkLintProhibitedStrings

/*
`ignoreNextTo` [string | string[]] _optional_ - Makes a prohibited string
allowable if it appears next to that string. As a string, it is interpreted as a
literal sequence of character(s) that appear immediately before or after the
`yes` text. For example, in the configuration above, _gatsby_ will be flagged as
a problem and the user will be told to use _Gatsby_ instead. However,
_gatsby-plugin_ will not be flagged because `'-'` is included in `ignoreNextTo`
for that rule. As an array, the item(s) are combined into a
[regex or condition](https://www.ocpsoft.org/tutorials/regular-expressions/or-in-regex/)
to match a number of possible sequence of characters(s) that might appear
immediately before or after the `yes` text.
*/

function testProhibited (val, content) {
  let regexpFlags = 'g'
  let no = val.no

  if (!no) {
    no = escapeStringRegexp(val.yes)
    regexpFlags += 'i'
  }

  let regexpString = '(?<!\\.|@[a-zA-Z0-9/-]*)'
  let ignoreNextTo
  if (val.ignoreNextTo) {
    if (Array.isArray(val.ignoreNextTo)) {
      ignoreNextTo = `(?:${val.ignoreNextTo.join('|')})`
    } else {
      ignoreNextTo = escapeStringRegexp(val.ignoreNextTo)
    }
  } else {
    ignoreNextTo = ''
  }
  const replaceCaptureGroups = !!val.replaceCaptureGroups

  // If it starts with a letter, make sure it is a word break.
  if (/^\b/.test(no)) {
    regexpString += '\\b'
  }
  if (ignoreNextTo) {
    regexpString += `(?<!${ignoreNextTo})`
  }

  regexpString += `(${no})`

  if (ignoreNextTo) {
    regexpString += `(?!${ignoreNextTo})`
  }

  // If it ends with a letter, make sure it is a word break.
  if (/\b$/.test(no)) {
    regexpString += '\\b'
  }
  regexpString += '(?!\\.\\w)'
  const re = new RegExp(regexpString, regexpFlags)

  const results = []
  let result = re.exec(content)
  while (result) {
    if (result[1] !== val.yes) {
      let yes = val.yes
      if (replaceCaptureGroups) {
        yes = result[1].replace(new RegExp(no), yes)
      }
      results.push({ result: result[1], index: result.index, yes: yes })
    }
    result = re.exec(content)
  }

  return results
}

function prohibitedStrings (ast, file, strings) {
  const myLocation = location(file)

  visit(ast, 'text', checkText)

  function checkText (node) {
    const content = node.value
    const initial = pointStart(node).offset

    strings.forEach((val) => {
      const results = testProhibited(val, content)
      if (results.length) {
        results.forEach(({ result, index, yes }) => {
          const message = val.yes ? `Use "${yes}" instead of "${result}"` : `Do not use "${result}"`
          file.message(message, {
            start: myLocation.toPoint(initial + index),
            end: myLocation.toPoint(initial + index + [...result].length)
          })
        })
      }
    })
  }
}
