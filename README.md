# remark-lint-prohibited-strings

A [remark-lint](https://www.npmjs.com/package/remark-lint) plugin to prohibit specified strings in markdown files. It can be used to lint consistent spelling, abbreviations, or syntax within the text of markdown files (e.g. it will not lint [code blocks](https://www.markdownguide.org/extended-syntax/#fenced-code-blocks)).

Example configuration:
```javascript
{
  "plugins": [
    "remark-lint-prohibited-strings",
    [
      { no: "End-Of-Life", yes: "End-of-Life" },
      { no: "End-of-life", yes: "End-of-Life" },
      { no: 'gatsby', yes: "Gatsby", ignoreNextTo: "-" },
      { no: 'sales', yes: "Sales", ignoreNextTo: [ "-", "\'", "'" ] },
      { no: "Github", yes: "GitHub" },
      { no: "Javascript", yes: "JavaScript" },
      { no: "Node.JS", yes: "Node.js" },
      { no: "[Rr][Ff][Cc](\\d+)", yes: "RFC $1", replaceCaptureGroups: true },
      { no: "v8", yes: "V8" },
      { yes: 'Unix' }
    ]
  ]
}
```

## Configuration

### no

`string`, _optional_

Specifies the string you wish to prohibit. [Regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) are respected, but can only be supplied as a string. If `no` is provided, the value must be a string, and the match is case-sensitive.  If omitted, then the `no` string will default to be the case-insensitive match of `yes`. For example, in the configuration above, users will be told to use "Unix" instead of "unix", or "UNIX".

### yes

`string`, _optional_

Specifies what users will be told to use instead of the matched `no` value (if provided). For example, in the configuration above, users will be told to use "GitHub" instead of "Github".

### ignoreNextTo

`string` | `string []`, _optional_

Makes a prohibited string allowable if it appears next to that string. It is interpreted as a literal sequence of character(s) that appear immediately before or after the `yes` text. For example, in the configuration above, users will be told to use "Gatsby" instead of "gatsby". However, "gatsby-plugin" and "node-gatsby" will not be flagged because `'-'` is included in `ignoreNextTo` for that rule.

As an array of strings, the items are combined into a [regex OR condition](https://www.ocpsoft.org/tutorials/regular-expressions/or-in-regex/) to match a number of possible sequences of characters that might appear immediately before or after the `yes` text. In the configuration above, the linter will instruct the user to use "Sales" instead of "sales", but it will ignore "pre-sales", `'sales'`, and `"sales"` (within quotes).

### replaceCaptureGroups

`boolean`, _optional_

Defaults to `false`. If set to a truthy value, it enables replacement of [regular expression capture groups](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges#using_groups), that are matched in the `no` regular expression, with group placeholders in `yes`. It can be used to provide better linting messages. The message reported to the user will use the same process as the the replacement string in [String.prototype.replace()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace). For example, in the configuration above, users will be told to use "RFC 123" instead of "rfc123", "RFC123", or "Rfc123".
