# sample json
To extract all first data items of the same structure and same type from a JSON object/file.

# install
npm i -g sample-json

# CLI tool
```text
sample-json v0.0.4

To extract all first data items of the same structure and same type from a JSON object/file

Usage: sample-json [ -i <input-file> ] [ -o <output-file> ] [ --prefix-type ]

Options:
  -i <input-file>               Input file; if not specified, read from pipe/redirection.
  -o <output-file>              Optional, output file (default: stdout).
  --prefix-type                 Optional, stringify the value to "type: value".
                                  when type string and value string are different.
  --verbose <0|1>               Optional, 0: silent, 1: default.
```

# API
```javascript
/*
options:
  mapping: set an object to receive the mapping of the structure
  getType: a function to get the type of a value (default is defaultGetType)
  prefixType: stringify the value to "type: value" when type string and value string are different
*/
function sampleJson(json, options = null);

```
