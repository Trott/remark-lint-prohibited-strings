# remark-lint-prohibited-strings
remark-lint plugin to prohibit specified strings in markdown files

Example configuration:

```javascript
  [
    require("remark-lint-prohibited-strings"),
    [
      { no: "End-Of-Life", yes: "End-of-Life" },
      { no: "End-of-life", yes: "End-of-Life" },
      { no: 'gatsby', yes: "Gatsby", ignoreNextTo: "-" },
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

`no` is a string specifying the string you wish to prohibit. Regular expression
characters are respected.

`yes` is a string specifying what someone will be told to use instead.

`ignoreNextTo` is a string that will make a prohibited string allowable if it
appears next to that string. For example, in the configuration above, _gatsby_
will be flagged as a problem and the user will be told to use _Gatsby_ instead.
However, _gatsby-plugin_ will not be flagged because `'-'` is included in
`ignoreNextTo` for that rule.
