# http-content-type-header

Parses an HTTP Content-Type header string into its media type, subtype, and a flat object of structured parameters. Zero runtime dependencies, ESM only.

## Usage

```js
import { parseContentType } from 'http-content-type-header';

const { type, subtype, parameters } = parseContentType('text/html; charset="utf-8"');
// type === 'text', subtype === 'html', parameters === { charset: 'utf-8' }

const { type: t, subtype: s, parameters: p } = parseContentType('multipart/form-data; boundary=----WebKitFormBoundary');
// t === 'multipart', s === 'form-data', p === { boundary: '----WebKitFormBoundary' }
```

`parseContentType(header: string): { type: string, subtype: string, parameters: Record<string, string> }`

Returns `{ type: '', subtype: '', parameters: {} }` for empty, null, or undefined input.

## Why

Hand-rolled Content-Type parsing tends to forget one of three things: trimming whitespace, lowercasing parameter names, or removing surrounding quotes from quoted values. This library does exactly those three, nothing more. It does not normalise charsets, drop unknown parameters, or interpret RFC 7231's full quoted-string grammar. The trade-off is a small, predictable surface that behaves the same way everywhere it runs.

## Edge cases

- **Surrounding double quotes only.** Single quotes are NOT treated as quoting characters per RFC 7231; `charset='utf-8'` is preserved verbatim.
- **Duplicate parameters.** Last value wins. If a header repeats a name, the final assignment is what `parameters` keeps.
- **No `/`.** A media type without a slash yields an empty subtype (`parseContentType('application')` → `{ type: 'application', subtype: '', parameters: {} }`).
- **Escaped quotes.** Inside a quoted value, `\"` is unescaped to `"`.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.


## Limitations

Values are coerced to floats, so very large integers lose precision. If you need
exact integer aggregates over a window, this is the wrong tool.


## License

MIT.
