# remark-lint-prohibited-strings
remark-lint plugin to prohibit specified strings in markdown files

Example configuration:

```javascript
  [
    require("remark-lint-prohibited-strings"),
    [
      { no: "end-of-life", yes: "End-of-Life" },
      { no: 'gatsby', yes: "Gatsby", ignoreNextTo: "-" },
      { no: "github", yes: "GitHub" },
      { no: "javascript", yes: "JavaScript" },
      { no: "node\\.js", yes: "Node.js" },
      { no: "rfc", yes: "RFC" },
      { no: "RFC\\d+", yes: "RFC <number>" },
      { no: "unix", yes: "Unix" },
      { no: "v8", yes: "V8" }
    ]
  ]
  ```

`no` is a string specifying the string you wish to prohibit. Regular expression
characters are respected. The `no` values are treated as case-insensitive
values. If a string case-insensitive matches the `no` value, it will be flagged
as an error unless the string also case-sensitive matches the `yes` value. If
`no` is omitted, it is inferred to be the same as `yes`. In other words,
`{ yes: 'foo' }` means that _foo_ is permitted, but _Foo_ and _FOO_ are
prohibited.

`yes` is an optional string specifying what someone will be told to use instead
of the matched `no` value.

`ignoreNextTo` is a string that will make a prohibited string allowable if it
appears next to that string. For example, in the configuration above, _gatsby_
will be flagged as a problem and the user will be told to use _Gatsby_ instead.
However, _gatsby-plugin_ will not be flagged because `'-'` is included in
`ignoreNextTo` for that rule.
