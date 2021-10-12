'use strict'

import { test } from 'tape'
import { remark } from 'remark'
import { VFile } from 'vfile'
import remarkLintProhibitedStrings from './index.js'

const processorWithOptions =
  (options) => remark().use(remarkLintProhibitedStrings, options)

test('remark-lint-prohibited-strings', (t) => {
  const path = 'fhqwhgads.md'

  {
    const value = 'the v8 javascript engine'
    t.deepEqual(
      processorWithOptions([])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should not flag anything if no options set'
    )
  }

  {
    const value = 'the v8 javascript engine'
    t.deepEqual(
      processorWithOptions([{ yes: 'V8', no: 'v8' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:5-1:7: Use "V8" instead of "v8"'],
      'should flag string if option set'
    )
  }

  {
    const value = 'the V8 JavaScript engine'
    t.deepEqual(
      processorWithOptions([{ yes: 'V8', no: 'v8' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should not flag string if it is not prohibited'
    )
  }

  {
    const value = '# fhqwhgads.v8'
    t.deepEqual(
      processorWithOptions([{ yes: 'V8', no: 'v8' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should ignore prohibited string if it is in code (preceded by .)'
    )
  }

  {
    const value = '# v8.fhqwhgads'
    t.deepEqual(
      processorWithOptions([{ yes: 'V8', no: 'v8' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should ignore prohibited string if it is in code (followed by .word)'
    )
  }

  {
    const value = 'The name of this band is v8.'
    t.deepEqual(
      processorWithOptions([{ yes: 'V8', no: 'v8' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:26-1:28: Use "V8" instead of "v8"'],
      'should flag prohibited string if it is followed by . alone'
    )
  }

  {
    const value = 'The gatsby-specific way to do this is as follows:'
    t.deepEqual(
      processorWithOptions([{ yes: 'Gatsby', no: 'gatsby(?!-)\\b' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should allow negative lookaheads with custom regular expression config'
    )
  }

  {
    const value = 'word-gatsby gatsby-word word-gatsby-word'
    t.deepEqual(
      processorWithOptions([{ yes: 'Gatsby', no: '\\b(?<!-)gatsby(?!-)\\b' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should allow negative lookaheads and lookbehinds'
    )
  }

  {
    const value = 'word-gatsby gatsby-word word-gatsby-word gatsby'
    t.deepEqual(
      processorWithOptions([{ yes: 'Gatsby', no: '\\b(?<!-)gatsby(?!-)\\b' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:42-1:48: Use "Gatsby" instead of "gatsby"'],
      'should still find things that do not match lookahead/lookbehind'
    )
  }

  {
    const value = 'gatsbyfoo foogatsby foogatsbyfoo'
    t.deepEqual(
      processorWithOptions([{ yes: 'Gatsby', no: '\\b(?<!-)gatsby(?!-)\\b' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should still match on word boundaries with lookahead/lookbehind'
    )
  }

  {
    const value = 'The fhqwhgads.v8 page for the band v8 rocks.'
    t.deepEqual(
      processorWithOptions([{ yes: 'V8', no: 'v8' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:36-1:38: Use "V8" instead of "v8"'],
      'should flag prohibited string even if an allowed usage precedes it'
    )
  }

  {
    const value = '@nodejs/v8-inspector'
    t.deepEqual(
      processorWithOptions([{ yes: 'V8', no: 'v8' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should ignore prohibited string if it is part of an @-mention'
    )
  }

  {
    const value = '@Nodejs/v8-inspector'
    t.deepEqual(
      processorWithOptions([{ yes: 'V8', no: 'v8' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should ignore prohibited string if it is part of an @-Mention'
    )
  }

  {
    const value = 'RfC123'
    t.deepEqual(
      processorWithOptions([{ yes: 'RFC <number>', no: '[Rr][Ff][Cc]\\d+' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:1-1:7: Use "RFC <number>" instead of "RfC123"'],
      'should provide reasonable output from regexp-y things'
    )
  }

  {
    const value = 'denote that'
    t.deepEqual(
      processorWithOptions([{ no: 'note that', yes: '<nothing>' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should assume word breaks'
    )
  }

  {
    const value = '`the-gatsby-kebab-in-code`'
    t.deepEqual(
      processorWithOptions([{ no: 'gatsby', yes: 'Gatsby' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should ignore strings in backticks'
    )
  }

  {
    const value = '```\nthe-gatsby-kebab-in-code\n```'
    t.deepEqual(
      processorWithOptions([{ no: 'gatsby', yes: 'Gatsby' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should ignore strings in code fences'
    )
  }

  {
    const value = "for Node.js' stuff\n\nand Node.js's stuff too"
    t.deepEqual(
      processorWithOptions([{ no: "Node\\.js's?", yes: 'the Node.js' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [
        'fhqwhgads.md:1:5-1:13: Use "the Node.js" instead of "Node.js\'"',
        'fhqwhgads.md:3:5-3:14: Use "the Node.js" instead of "Node.js\'s"'
      ],
      'should allow flagging of apostrophes as final characters in "no" string'
    )
  }

  {
    const value = 'gatsby Gatsby gatsby'
    t.deepEqual(
      processorWithOptions([{ no: 'gatsby', yes: 'Gatsby' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [
        'fhqwhgads.md:1:1-1:7: Use "Gatsby" instead of "gatsby"',
        'fhqwhgads.md:1:15-1:21: Use "Gatsby" instead of "gatsby"'
      ],
      'should flag multiple violations in a single node'
    )
  }

  {
    const value = 'The gatsby-specific way to do this is as follows:'
    t.deepEqual(
      processorWithOptions([{ yes: 'Gatsby', no: 'gatsby', ignoreNextTo: '-' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should respect ignoreNextTo'
    )
  }

  {
    const value = 'word-gatsby gatsby-word word-gatsby-word'
    t.deepEqual(
      processorWithOptions([{ yes: 'Gatsby', no: 'gatsby', ignoreNextTo: '-' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should respect multiple ignoreNextTo occurrences'
    )
  }

  {
    const value = 'word-gatsby gatsby-word word-gatsby-word gatsby'
    t.deepEqual(
      processorWithOptions([{ yes: 'Gatsby', no: 'gatsby', ignoreNextTo: '-' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:42-1:48: Use "Gatsby" instead of "gatsby"'],
      'should still find things that do not match ignoreNextTo'
    )
  }

  {
    const value = 'gatsbyfoo foogatsby foogatsbyfoo'
    t.deepEqual(
      processorWithOptions([{ yes: 'Gatsby', no: 'gatsby', ignoreNextTo: '-' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should still match on word boundaries with ignoreNextTo'
    )
  }

  {
    const value = 'The gatsby-specific way to do this is as follows:'
    const ignoreNextTo = ['-']
    t.deepEqual(
      processorWithOptions([{ yes: 'Gatsby', no: 'gatsby', ignoreNextTo }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should respect single occurence of one ignoreNextTo array item'
    )
  }

  {
    const value = 'word-gatsby gatsby-word word-gatsby-word'
    const ignoreNextTo = ['-']
    t.deepEqual(
      processorWithOptions([{ yes: 'Gatsby', no: 'gatsby', ignoreNextTo }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should respect multiple occurrences of a one ignoreNextTo array item'
    )
  }

  {
    const value = 'we are pro-rfc, see rfc-3986, rfc@3986'
    const ignoreNextTo = ['-', '@']
    t.deepEqual(
      processorWithOptions([{ no: 'rfc', yes: 'RFC', ignoreNextTo }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should respect multiple occurrences of multiple ignoreNextTo array items'
    )
  }

  {
    const value = 'use rfc.3986, "rfc", /rfc and rfc='
    const ignoreNextTo = ['.', '"', '/']
    t.deepEqual(
      processorWithOptions([{ no: 'rfc', yes: 'RFC', ignoreNextTo }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:31-1:34: Use "RFC" instead of "rfc"'],
      'should respect multiple occurrences of multiple ignoreNextTo array items including regex'
    )
  }

  {
    const value = 'our pre-sales, post-sales, and sales-figures'
    const ignoreNextTo = ['pre-', 'post-', '-figures']
    t.deepEqual(
      processorWithOptions([{ no: 'sales', yes: 'Sales', ignoreNextTo }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should respect multiple occurrences of multiple ignoreNextTo array words'
    )
  }

  {
    const value = 'see rfc-3986'
    const ignoreNextTo = ['"', '@', '#']
    t.deepEqual(
      processorWithOptions([{ no: 'rfc', yes: 'RFC', ignoreNextTo }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:5-1:8: Use "RFC" instead of "rfc"'],
      'should flag text that is not in ignoreNextTo items'
    )
  }

  {
    const value = 'see rfc 3986, rfc, rfc1234 but not rfc-folder or me@rfc.io'
    const options = [{
      yes: 'RFC-$1',
      no: '[Rr][Ff][Cc]\\s*(\\d+)',
      ignoreNextTo: ['-', '@'],
      replaceCaptureGroups: true
    }]
    t.deepEqual(
      processorWithOptions(options)
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [
        'fhqwhgads.md:1:5-1:13: Use "RFC-3986" instead of "rfc 3986"',
        'fhqwhgads.md:1:20-1:27: Use "RFC-1234" instead of "rfc1234"'
      ],
      'should flag text that is not in ignoreNextTo items and use capture groups'
    )
  }

  {
    const value = 'You got Sblounchsked!'
    t.deepEqual(
      processorWithOptions([{ no: 'Sblounchsked' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:9-1:21: Do not use "Sblounchsked"'],
      'should permit omitting the yes option'
    )
  }

  {
    const value = 'strong bad'
    t.deepEqual(
      processorWithOptions([{ yes: 'Strong Bad' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:1-1:11: Use "Strong Bad" instead of "strong bad"'],
      'should flag when there is a `yes` option but no `no` option'
    )
  }

  {
    const value = 'Strong Bad'
    t.deepEqual(
      processorWithOptions([{ yes: 'Strong Bad' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      [],
      'should allow identical case with `yes` option but no `no` option'
    )
  }

  {
    const value = 'end-of-life nodefjs version'
    t.deepEqual(
      processorWithOptions([{ yes: 'End-of-Life' }, { yes: 'Node.js' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:1-1:12: Use "End-of-Life" instead of "end-of-life"'],
      'should escape regexp special chars with `yes` option but no `no` option'
    )
  }

  {
    const value = 'Fhqwhgads\n\nType: End-of-life'
    t.deepEqual(
      processorWithOptions([{ yes: 'End-of-Life' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:3:7-3:18: Use "End-of-Life" instead of "End-of-life"'],
      'should flag yes-only violations on lines other than the first line'
    )
  }

  {
    const value = 'rfc123'
    t.deepEqual(
      processorWithOptions([
        { no: '[Rr][Ff][Cc](\\d+)', yes: 'RFC $1', replaceCaptureGroups: true }
      ])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:1-1:7: Use "RFC 123" instead of "rfc123"'],
      'should use capture groups in replacement messages'
    )
  }

  {
    const value = 'rfc123'
    t.deepEqual(
      processorWithOptions([{ no: '[Rr][Ff][Cc](\\d+)', yes: 'RFC $1' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:1-1:7: Use "RFC $1" instead of "rfc123"'],
      'should not use capture groups in replacement messages without option'
    )
  }

  {
    const value = "Do you think they'll do that?"
    t.deepEqual(
      processorWithOptions([
        { no: "(\\w+)'ll", yes: '$1 will', replaceCaptureGroups: true }
      ])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:14-1:21: Use "they will" instead of "they\'ll"'],
      'should use capture groups in replacement messages'
    )
  }

  {
    const value = "Do you think they'll do that?"
    t.deepEqual(
      processorWithOptions([{ no: "(\\w+)'ll", yes: '$1 will' }])
        .processSync(new VFile({ path, value }))
        .messages.map(String),
      ['fhqwhgads.md:1:14-1:21: Use "$1 will" instead of "they\'ll"'],
      'should not use capture groups in replacement messages without option'
    )
  }

  t.end()
})
