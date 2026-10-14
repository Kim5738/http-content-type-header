/**
 * Parses an HTTP Content-Type header string.
 *
 * Returns an object with:
 *   - type:        the media type (e.g. "text", "application"), lowercased and trimmed.
 *   - subtype:     the subtype (e.g. "plain", "json"), lowercased and trimmed.
 *   - parameters:  an object mapping lowercased parameter names to string values.
 *
 * Design choices (stated plainly so tests match behaviour):
 *   1. Charsets and other parameters are NOT special-cased. "charset" is returned
 *      verbatim under the "charset" key, with surrounding quotes removed.
 *   2. Only surrounding double quotes are stripped from parameter values (RFC 7231
 *      quoted-string form). Single quotes are left intact, matching the spec which only
 *      recognises double quotes as quoting characters.
 *   3. Empty input returns { type: "", subtype: "", parameters: {} }.
 *   4. Media type tokens are tokenised on ";". The first token is the type/subtype.
 *      Whitespace around every token is trimmed.
 *   5. The type/subtype token is split on the FIRST "/". Anything after the first
 *      slash is the subtype. If no "/" is present, subtype is "" and type is the whole
 *      token.
 *   6. Duplicate parameter names: the LAST value wins. This mirrors typical header
 *      consumption where later declarations override earlier ones.
 *   7. Parameter names are lowercased. Values are NOT lowercased (case-sensitive),
 *      since RFC 7231 permits case in quoted-string content.
 *
 * @param {string} header
 * @returns {{type: string, subtype: string, parameters: Record<string, string>}}
 */
export function parseContentType(header) {
  const out = { type: '', subtype: '', parameters: {} };
  if (header == null || header === '') return out;

  const str = String(header);
  const segments = str.split(';');

  const mediaToken = segments.length > 0 ? segments[0].trim() : '';
  if (mediaToken !== '') {
    const slashIdx = mediaToken.indexOf('/');
    if (slashIdx === -1) {
      out.type = mediaToken.toLowerCase();
      out.subtype = '';
    } else {
      out.type = mediaToken.slice(0, slashIdx).toLowerCase().trim();
      out.subtype = mediaToken.slice(slashIdx + 1).toLowerCase().trim();
    }
  }

  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    const eqIdx = seg.indexOf('=');
    if (eqIdx === -1) continue;

    let name = seg.slice(0, eqIdx).trim();
    if (name === '') continue;
    name = name.toLowerCase();

    let value = seg.slice(eqIdx + 1).trim();
    // RFC 7231 quoted-string: leading and trailing DQUOTE are removed. The pair
    // \" is unescaped to ".
    if (value.length >= 2 && value.charCodeAt(0) === 34 && value.charCodeAt(value.length - 1) === 34) {
      value = value.slice(1, -1);
      value = value.replace(/\\"/g, '"');
    }
    out.parameters[name] = value;
  }

  return out;
}
