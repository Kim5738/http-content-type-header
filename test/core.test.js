import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseContentType } from '../src/index.js';

test('empty string yields empty fields', () => {
  const r = parseContentType('');
  assert.deepEqual(r, { type: '', subtype: '', parameters: {} });
});

test('null and undefined are tolerated as empty', () => {
  assert.deepEqual(parseContentType(null), { type: '', subtype: '', parameters: {} });
  assert.deepEqual(parseContentType(undefined), { type: '', subtype: '', parameters: {} });
});

test('basic text/plain', () => {
  assert.deepEqual(parseContentType('text/plain'), {
    type: 'text', subtype: 'plain', parameters: {}
  });
});

test('type and subtype are lowercased', () => {
  assert.deepEqual(parseContentType('TEXT/HTML'), {
    type: 'text', subtype: 'html', parameters: {}
  });
});

test('leading and trailing whitespace around media type is trimmed', () => {
  assert.deepEqual(parseContentType('   application/json   '), {
    type: 'application', subtype: 'json', parameters: {}
  });
});

test('parameter without value is dropped', () => {
  assert.deepEqual(parseContentType('text/plain; charset'), {
    type: 'text', subtype: 'plain', parameters: {}
  });
});

test('quoted charset value has surrounding double quotes removed', () => {
  assert.deepEqual(parseContentType('text/html; charset="utf-8"'), {
    type: 'text', subtype: 'html', parameters: { charset: 'utf-8' }
  });
});

test('unquoted parameter value is preserved verbatim', () => {
  assert.deepEqual(parseContentType('text/html; charset=utf-8'), {
    type: 'text', subtype: 'html', parameters: { charset: 'utf-8' }
  });
});

test('parameter names are case-insensitive, values are not', () => {
  const r = parseContentType('text/html; CHARSET=UTF-8');
  assert.equal(r.parameters.charset, 'UTF-8');
});

test('multiple parameters accumulate', () => {
  assert.deepEqual(parseContentType('multipart/form-data; boundary=----WebKitFormBoundary; charset=UTF-8'), {
    type: 'multipart', subtype: 'form-data',
    parameters: { boundary: '----WebKitFormBoundary', charset: 'UTF-8' }
  });
});

test('duplicate parameter names: last value wins', () => {
  assert.deepEqual(parseContentType('text/plain; charset=utf-8; charset=iso-8859-1'), {
    type: 'text', subtype: 'plain',
    parameters: { charset: 'iso-8859-1' }
  });
});

test('escaped double quote inside quoted value is unescaped', () => {
  const r = parseContentType('application/json; name="a\\"b"');
  assert.equal(r.parameters.name, 'a"b');
});

test('media type without slash has empty subtype', () => {
  assert.deepEqual(parseContentType('application'), {
    type: 'application', subtype: '', parameters: {}
  });
});

test('subtype containing a slash is kept intact', () => {
  assert.deepEqual(parseContentType('application/vnd.api+json'), {
    type: 'application', subtype: 'vnd.api+json', parameters: {}
  });
});

test('whitespace around parameters is tolerated', () => {
  assert.deepEqual(parseContentType('text/plain ;   charset = utf-8 '), {
    type: 'text', subtype: 'plain',
    parameters: { charset: 'utf-8' }
  });
});
