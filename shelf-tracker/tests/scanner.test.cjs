'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '../scanner/shelf-scanner.html'), 'utf8');
const script = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');

function scanner() {
  const elements = new Map();
  function element() {
    const children = new Map();
    return {
      style: {}, dataset: {}, innerHTML: '', textContent: '', listeners: {},
      classList: { add() {}, remove() {}, toggle() {} },
      addEventListener(name, callback) { this.listeners[name] = callback; },
      appendChild() {},
      querySelector(selector) {
        if (!children.has(selector)) children.set(selector, element());
        return children.get(selector);
      }
    };
  }
  const document = {
    body: element(),
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, element());
      return elements.get(selector);
    },
    querySelectorAll() { return []; },
    createElement: element,
  };
  const copied = [];
  const revoked = [];
  const context = vm.createContext({
    document, window: {}, navigator: { clipboard: { writeText(value) { copied.push(value); return Promise.resolve(); } } },
    URL: { createObjectURL() { return 'blob:synthetic'; }, revokeObjectURL(url) { revoked.push(url); } },
    setTimeout() { return 1; }, clearTimeout() {},
    fetch() { throw new Error('Unexpected network request'); },
  });
  vm.runInContext(script, context);
  context.resizeToBase64 = async () => 'synthetic-image-bytes';
  const photo = () => {
    const p = { file: { name: 'synthetic.jpg' }, url: 'blob:synthetic-' + context.photos.length, el: element() };
    context.photos.push(p);
    return p;
  };
  return { context, elements, photo, copied, revoked };
}

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
function response(products) {
  return { ok: true, json: async () => ({ content: [{ type: 'text', text: JSON.stringify(products) }] }) };
}

test('clear keeps an in-flight response from restoring removed rows', async () => {
  const { context, elements, photo, revoked } = scanner();
  const request = deferred();
  context.fetch = () => request.promise;
  const firstPhoto = photo();
  const secondPhoto = photo();
  const pending = context.scan(firstPhoto);
  await Promise.resolve(); // the request is now waiting for its response
  assert.deepEqual(revoked, []);
  elements.get('#clearBtn').listeners.click();
  request.resolve(response([{ brand_name: 'Synthetic', shade_number: '01', confidence: 'high' }]));
  await pending;
  assert.equal(context.rows.length, 0);
  assert.equal(context.photos.length, 0);
  assert.deepEqual(revoked, [firstPhoto.url, secondPhoto.url]);
  elements.get('#clearBtn').listeners.click();
  assert.deepEqual(revoked, [firstPhoto.url, secondPhoto.url]);
});

test('clear during image decoding prevents a stale upload', async () => {
  const { context, elements, photo, revoked } = scanner();
  const decode = deferred();
  let requests = 0;
  context.resizeToBase64 = () => decode.promise;
  context.fetch = async () => { requests++; return response([{ brand_name: 'Synthetic' }]); };
  const p = photo();
  const pending = context.scan(p);
  elements.get('#clearBtn').listeners.click();
  decode.resolve('synthetic-image-bytes');
  await pending;
  assert.equal(requests, 0);
  assert.equal(context.rows.length, 0);
  assert.deepEqual(revoked, [p.url]);
});

test('a malformed product array does not leave partially accepted rows', async () => {
  const { context, photo } = scanner();
  context.addRow({ brand_name: 'Earlier', confidence: 'high' }, 'blob:earlier');
  context.fetch = async () => response([{ brand_name: 'Synthetic', confidence: 'high' }, null]);
  const p = photo();
  await context.scan(p);
  assert.equal(p.el.className, 'photo fail');
  assert.equal(context.rows.length, 1);
  assert.equal(context.rows[0].data.brand_name, 'Earlier');
});

for (const confidence of ['', 'unexpected']) {
  test(`untrusted confidence ${JSON.stringify(confidence)} remains flagged for review`, () => {
    const { context } = scanner();
    assert.equal(context.lowConf({ confidence }), true);
  });
}

test('explicit high confidence and valid results retain normal behavior', async () => {
  const { context, photo } = scanner();
  context.fetch = async () => response([{ brand_name: 'Synthetic', shade_number: '01', confidence: 'high' }]);
  const p = photo();
  await context.scan(p);
  assert.equal(p.el.className, 'photo read');
  assert.equal(context.rows.length, 1);
  assert.equal(context.rows[0].data.shade_number, '01');
  assert.equal(context.lowConf(context.rows[0].data), false);
});

test('copy preserves sixteen columns, text codes, and unchecked exclusions', () => {
  const { context, elements, copied } = scanner();
  context.addRow({ brand_name: '', product_name: 'Synthetic', shade_number: '01', barcode: '0012345678901', confidence: 'high' }, '');
  context.addRow({ brand_name: 'Unchecked', confidence: 'high' }, '');
  context.rows[1].checked = false;
  elements.get('#copyBtn').listeners.click();
  assert.equal(copied.length, 1);
  const columns = copied[0].split('\t');
  assert.equal(columns.length, 16);
  assert.equal(columns[0], '');
  assert.equal(columns[3], '01');
  assert.equal(columns[9], '0012345678901');
  assert.equal(columns[10], 'active');
  assert.equal(copied[0].includes('Unchecked'), false);
});


test('a numeric zero code is preserved as text rather than discarded', () => {
  const { context } = scanner();
  context.addRow({ shade_number: 0, confidence: 'high' }, '');
  assert.equal(context.rows[0].data.shade_number, '0');
});

test('copy flattens every TSV line delimiter inside fields', () => {
  const { context, elements, copied } = scanner();
  context.addRow({ brand_name: 'Synthetic', notes: 'one\rtwo\nthree\tfour', confidence: 'high' }, '');
  elements.get('#copyBtn').listeners.click();
  assert.equal(copied[0].includes('\r'), false);
  assert.equal(copied[0].includes('\n'), false);
  assert.equal(copied[0].split('\t').length, 16);
  assert.equal(copied[0].split('\t')[14], 'one two three four');
});
