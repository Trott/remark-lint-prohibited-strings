'use strict'

const escapeStringRegexp = require('escape-string-regexp')
const position = require('unist-util-position')
const rule = require('unified-lint-rule')
const visit = require('unist-util-visit')
const vfileLocation = require('vfile-location')

const start = position.start

module.exports = rule('remark-lint:prohibited-strings', prohibitedStrings)

function testProhibited (val, content) {
  let regexpFlags = 'g'
  let no = val.no

  if (!no) {
    no = escapeStringRegexp(val.yes)
    regexpFlags += 'i'
  }

  let regexpString = '(?<!\\.|@[a-zA-Z0-9/-]*)'

  const ignoreNextTo = val.ignoreNextTo ? escapeStringRegexp(val.ignoreNextTo) : ''
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
  const location = vfileLocation(file)

  visit(ast, 'text', checkText)

  function checkText (node) {
    const content = node.value
    const initial = start(node).offset

    strings.forEach((val) => {
      const results = testProhibited(val, content)
      if (results.length) {
        results.forEach(({ result, index, yes }) => {
          const message = val.yes ? `Use "${yes}" instead of "${result}"` : `Do not use "${result}"`
          file.message(message, {
            start: location.toPoint(initial + index),
            end: location.toPoint(initial + index + [...result].length)
          })
        })
      }
    })
  }
}
