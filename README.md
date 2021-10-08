# remark-lint-prohibited-strings
remark-lint plugin to prohibit specified strings in markdown files

Example configuration:

```javascript
{
  "plugins": [
    "remark-lint-prohibited-strings",
    [
      { no: "End-Of-Life", yes: "End-of-Life" },
      { no: "End-of-life", yes: "End-of-Life" },
      { no: 'gatsby', yes: "Gatsby", ignoreNextTo: "-" },
      { no: "Github", yes: "GitHub" },
      { no: "Javascript", yes: "JavaScript" },
      { no: "Node.JS", yes: "Node.js" },
      { no: "Rfc", yes: "RFC" },
      { no: "[Rr][Ff][Cc]\\d+", yes: "RFC $1", replaceCapture: true },
      { no: "rfc", yes: "RFC" },
      { no: "UNIX", yes: "Unix" },
      { no: "unix", yes: "Unix" },
      { no: "v8", yes: "V8" },
      { yes: 'Docker' }
    ]
  ]
}
```

`yes` [string] _required_ - Specifies what users will be told to use instead
of the matched `no` value (if provided). For example, in the configuration
above, users will be told to use _GitHub_ instead of any other variation of it.

`no` [string | regex] _optional_ - Specifies the string you wish to prohibit. If
omitted, then the `no` string will be inferred to be a string literal,
case-insensitive match of `yes`. For example, in the configuration above,
_docker_ and _DOCKER_ will be flagged as prohibited strings.

`ignoreNextTo` [string] _optional_ - Makes a prohibited string allowable if it
appears next to that string. It is interpreted as a literal sequence of
character(s) that appear immediately before or after the `yes` text. For
example, in the configuration above, _gatsby_ will be flagged as a problem and
the user will be told to use _Gatsby_ instead. However, _gatsby-plugin_ will not
be flagged because `'-'` is included in `ignoreNextTo` for that rule.

`replaceCaptureGroups` - [boolean] _optional_ - Enables replacement of regular
expression capture groups. Defaults to `false`. If set to a truthy value, the
message reported to the user will have capture groups supplied from the regular
expression match using the same process as the replacement string in
[String.prototype.replace()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace).
For example, in the configuration above for
`"[Rr][Ff][Cc](\\d+)"`, and given an input text of "rfc123", the rule will tell
the user to use `"RFC 123"` instead of `"rfc123"`.
