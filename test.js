'use strict';

const test = require('tape');
const remark = require('remark');
const lint = require('remark-lint');
const vfile = require('vfile');
const noProhibitedStrings = require('./');

const processorWithOptions =
  (options) => remark().use(lint).use(noProhibitedStrings, options);

test('remark-lint-prohibited-strings', (t) => {
  const path = 'fhqwhgads.md';

  {
    const contents = 'the v8 javascript engine';
    t.deepEqual(
      processorWithOptions([])
        .processSync(vfile({ path: path, contents: contents }))
        .messages.map(String),
      [],
      'should not flag anything if no options set'
    );
  }

  {
    const contents = 'the v8 javascript engine';
    t.deepEqual(
      processorWithOptions([{ yes: 'V8', no: 'v8' }])
        .processSync(vfile({ path: path, contents: contents }))
        .messages.map(String),
      [ 'fhqwhgads.md:1:1-1:25: Use "V8" instead of "v8"' ],
      'should flag string if option set'
    );
  }

  {
    const contents = 'the V8 JavaScript engine';
    t.deepEqual(
      processorWithOptions([{ yes: 'V8', no: 'v8' }])
        .processSync(vfile({ path: path, contents: contents }))
        .messages.map(String),
      [],
      'should not flag string if it is not prohibited'
    );
  }

  {
    const contents = '# fhqwhgads.v8';
    t.deepEqual(
      processorWithOptions([{ yes: 'V8', no: 'v8' }])
        .processSync(vfile({ path: path, contents: contents }))
        .messages.map(String),
      [],
      'should ignore prohibited string if it is in code (preceded by .)'
    );
  }

  {
    const contents = '# v8.fhqwhgads';
    t.deepEqual(
      processorWithOptions([{ yes: 'V8', no: 'v8' }])
        .processSync(vfile({ path: path, contents: contents }))
        .messages.map(String),
      [],
      'should ignore prohibited string if it is in code (followed by .word)'
    );
  }

  {
    const contents = 'The name of this band is v8.';
    t.deepEqual(
      processorWithOptions([{ yes: 'V8', no: 'v8' }])
        .processSync(vfile({ path: path, contents: contents }))
        .messages.map(String),
      [ 'fhqwhgads.md:1:1-1:29: Use "V8" instead of "v8"' ],
      'should flag prohibited string if it is followed by . alone'
    );
  }
  t.end();
});
