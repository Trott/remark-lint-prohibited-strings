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
