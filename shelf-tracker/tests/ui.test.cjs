'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const tracker = fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'index.html'), 'utf8');
const catalog = fs.readFileSync(path.join(__dirname, '..', 'makeup-shelf-check.html'), 'utf8');

function section(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  assert.ok(from >= 0 && to > from, `Missing source section: ${start}`);
  return source.slice(from, to);
}

function expiry() {
  const context = vm.createContext({
    Date,
    NOW: new Date('2026-11-26T12:00:00Z'),
    DAY: 864e5,
    fmtMon: date => date.toISOString().slice(0, 7),
    shadeColor: () => '#D8CCCE'
  });
  vm.runInContext(section(tracker, 'function effExp(', 'function model('), context);
  // Evaluate only the function; never execute the embedded inventory or wishlist.
  vm.runInContext(section(catalog, 'function enrich(', 'const DATA = RAW.map'), context);
  return context;
}

function assertExpiry(row, expected, estimated) {
  const context = expiry();
  const actual = context.effExp({ ...row });
  const legacy = context.enrich({ ...row }, 0);
  const calendar = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  assert.equal(actual && calendar(actual.d), expected);
  assert.equal(legacy.expDate && calendar(legacy.expDate), expected);
  if (expected) {
    assert.equal(actual.est, estimated);
    assert.equal(legacy.est, estimated);
  }
}

test('Tracker and Catalog select an earlier manufacture estimate even with a printed date', () => {
  assertExpiry({ exp: 'Jan 1, 2030', opened: 'Jan 1, 2026', pao: '12', mfg: 'Jan 1, 2023' }, '2026-01-01', true);
});

test('Tracker and Catalog select an earlier opened-plus-PAO date', () => {
  assertExpiry({ exp: 'Jan 1, 2030', opened: 'Jan 1, 2026', pao: '6', mfg: 'Jan 1, 2025' }, '2026-07-01', false);
});

test('Tracker and Catalog retain an earlier printed date', () => {
  assertExpiry({ exp: 'Jan 1, 2026', opened: 'Jan 1, 2026', pao: '6', mfg: 'Jan 1, 2025' }, '2026-01-01', false);
});

test('invalid printed dates do not suppress a valid manufacture estimate', () => {
  assertExpiry({ exp: 'not a date', mfg: 'Jan 1, 2023' }, '2026-01-01', true);
});

for (const pao of ['not a number', '0', '-6', 'Infinity', '1e308']) {
  test(`invalid PAO ${pao} cannot produce an expiry date`, () => {
    assertExpiry({ opened: 'Jan 1, 2025', pao }, null);
  });
}

test('missing dates remain unknown', () => assertExpiry({}, null));

function imports(text) {
  const elements = new Map();
  const lookups = [];
  const calls = [];
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      innerText: id === 'paste' ? text : '', innerHTML: '', style: {}, disabled: false,
      events: {}, addEventListener(event, handler) { this.events[event] = handler; }
    });
    return elements.get(id);
  }
  const context = vm.createContext({
    $: element,
    findDup: (...args) => { lookups.push(args); return null; },
    triplet: () => ['#eee', '#ddd', '#ccc'],
    esc: String,
    toast: () => {},
    RUN: (...args) => calls.push(args),
    setTimeout,
    reloadBoot: () => {}
  });
  vm.runInContext(section(tracker, 'var PASTE_SAMPLE=', '/* ---------------- CATALOG: grid'), context);
  return { context, element, lookups, calls };
}

const tsvRow = ['', '霧面唇彩', 'Lip', '01', 'Rose', '', '', '', '6', '0012345678905', '', '', '', '', '', ''];

test('import preview preserves the first row blank brand and leading-zero shade code', () => {
  const { context, lookups } = imports(tsvRow.join('\t'));
  context.previewImport();
  assert.deepEqual(lookups[0], ['', '01', '霧面唇彩', 'Rose']);
});

test('import submission preserves every first-row tab and leading-zero code', () => {
  const text = tsvRow.join('\t');
  const { context, element, calls } = imports(text);
  context.wireImport();
  element('import-go').events.click();
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], 'bulkImport');
  assert.equal(calls[0][3], text);
});

test('import ignores whitespace-only lines without trimming populated rows', () => {
  const row = tsvRow.join('\t');
  const { context, element, calls } = imports('\r\n\t\t\r\n' + row + '\r\n  \r\n');
  context.wireImport();
  element('import-go').events.click();
  assert.equal(calls[0][3], row);
});

function interactive() {
  const calls = [];
  const messages = [];
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      innerHTML: '', style: {}, disabled: false, dataset: {}, events: {},
      classList: { toggle() {}, add() {}, remove() {} },
      addEventListener(event, handler) { this.events[event] = handler; },
      querySelector(selector) { return element(id + selector); }
    });
    return elements.get(id);
  }
  const bridge = {
    withSuccessHandler(ok) {
      return { withFailureHandler(fail) {
        return new Proxy({}, { get: (_, name) => (...args) => calls.push({ name, args, ok, fail }) });
      } };
    }
  };
  const google = { script: { run: bridge } };
  const context = vm.createContext({
    $: element,
    document: { querySelector: () => element('haul-host') },
    window: { google }, google,
    esc: String,
    I: { chk: '' },
    toast: message => messages.push(message),
    setTimeout,
    resetAdd() {}, reloadBoot() {}, go() {},
    model: row => ({ ...row, s1: '#eee', sdeep: '#ccc' }),
    openSheet() {}, closeSheet() {}
  });
  vm.runInContext(section(tracker, 'function RUN(', '/* ---------------- tiny helpers'), context);
  vm.runInContext(section(tracker, 'var HAUL =', 'function reloadBoot('), context);
  vm.runInContext(section(tracker, 'function loadHaul(', '/* ---------------- DARK MODE'), context);
  vm.runInContext(section(tracker, 'function commitItem(', '/* ---------------- TOAST'), context);
  vm.runInContext(section(tracker, 'function scanResult(', 'function wireScan('), context);
  context.HAUL = [
    { row: 2, brand: 'Synthetic A', product: 'Tint', checked: false, krw: 1000 },
    { row: 3, brand: 'Synthetic B', product: 'Blush', checked: false, krw: 2000 },
    { row: 4, brand: 'Synthetic C', product: 'Shadow', checked: false, krw: 3000 }
  ];
  function click(row, remove = false) {
    const item = { dataset: { row: String(row) }, classList: { toggle() {} } };
    const del = { dataset: { del: String(row) } };
    element('haul-list').events.click({ stopPropagation() {}, target: { closest: selector =>
      selector === '[data-del]' ? (remove ? del : null) : selector === '.haul-item' ? item : null
    } });
  }
  context.renderHaul();
  return { context, calls, messages, element, click };
}

test('haul serializes mutations and waits for refreshed physical row identities', () => {
  const { context, calls, click } = interactive();
  click(2, true);
  click(3, true);
  click(3);
  assert.deepEqual(calls.map(call => call.name), ['removeHaulItem']);
  calls[0].ok();
  assert.equal(calls[1].name, 'getHaul');
  click(3, true);
  assert.equal(calls.length, 2);
  calls[1].ok([{ row: 2, brand: 'Synthetic B', checked: false, krw: 2000 }]);
  click(2, true);
  assert.equal(calls[2].name, 'removeHaulItem');
  assert.equal(calls[2].args[0], 2);
  assert.equal(context.HAUL[0].brand, 'Synthetic B');
});

test('failed haul refresh preserves last known rows and blocks writes until a successful retry', () => {
  const { context, calls, messages, element, click } = interactive();
  click(2, true);
  calls[0].ok();
  calls[1].fail(new Error('synthetic read failure'));
  assert.equal(context.HAUL.length, 3);
  assert.match(messages.at(-1), /synthetic read failure/);
  click(3, true);
  assert.equal(calls.length, 2);
  assert.equal(typeof element('haul-retry').onclick, 'function');
  element('haul-retry').onclick();
  assert.equal(calls[2].name, 'getHaul');
  calls[2].ok([{ row: 2, brand: 'Synthetic B', checked: false, krw: 2000 }]);
  click(2);
  assert.equal(calls[3].name, 'setHaulChecked');
  assert.equal(calls[3].args[0], 2);
});

test('failed haul check restores the prior checked state and subtotal before refresh', () => {
  const { context, calls, messages, element, click } = interactive();
  click(2);
  assert.equal(context.HAUL[0].checked, true);
  calls[0].fail(new Error('synthetic write failure'));
  assert.equal(context.HAUL[0].checked, false);
  assert.match(messages.at(-1), /synthetic write failure/);
  assert.match(element('haul-host').innerHTML, /₩0/);
});

test('haul fetches cannot race with a pending mutation or another fetch', () => {
  const { context, calls, click } = interactive();
  click(2, true);
  context.loadHaul();
  assert.equal(calls.length, 1);
  calls[0].ok();
  context.loadHaul();
  assert.equal(calls.length, 2);
});

test('scan Save is restored when addItem fails', () => {
  const { context, calls, element } = interactive();
  element('scan-save').disabled = true;
  context.doAdd({ brand_name: 'Synthetic' }, false);
  calls[0].fail(new Error('synthetic save failure'));
  assert.equal(element('scan-save').disabled, false);
});

test('canceling a scan duplicate confirmation restores scan Save', () => {
  const { context, element } = interactive();
  context.findDup = () => ({ brand: 'Synthetic', status: 'fresh' });
  context.toTxt = value => value;
  context.baseColor = () => '#D8CCCE';
  context.scanResult('0012345678905', { found: false });
  for (const [name, value] of Object.entries({ s_brand: 'Synthetic', s_product: 'Tint', s_sn: '01', s_exp: '' })) {
    element(name).value = value;
  }
  element('scan-save').onclick();
  element('sheet-body').querySelector('[data-cancel]').onclick();
  assert.equal(element('scan-save').disabled, false);
});
