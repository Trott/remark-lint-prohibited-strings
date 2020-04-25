# remark-lint-prohibited-strings
remark-lint plugin to prohibit specified strings in markdown files

Example configuration:

```javascript
  [
    require("remark-lint-prohibited-strings"),
    [
      { no: "End-Of-Life", yes: "End-of-Life" },
      { no: "End-of-life", yes: "End-of-Life" },
      { no: "Github", yes: "GitHub" },
      { no: "Javascript", yes: "JavaScript" },
      { no: "Node.JS", yes: "Node.js" },
      { no: "Rfc", yes: "RFC" },
      { no: "[Rr][Ff][Cc]\\d+", yes: "RFC <number>" },
      { no: "rfc", yes: "RFC" },
      { no: "UNIX", yes: "Unix" },
      { no: "unix", yes: "Unix" },
      { no: "v8", yes: "V8" }
    ]
  ]
  ```

The `no` values are treated are incorporated into regular expressions, which
means that you can do fancy things with negative lookaheads and negative
lookbehinds. For example, if you wanted to flag "gatsby" because you want it
capitalized ("Gatsby"), but you want to allow it to appear in hyphenated strings
(like plugin-gatsby or gatsby-module or plugin-gatsby-module):

```javascript
{ yes: 'Gatsby', no: '(?<!-)gatsby(?!-)' }
```
