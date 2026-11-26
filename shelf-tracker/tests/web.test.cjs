'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'web', 'index.html'), 'utf8');

function section(start, end) {
  const from = source.indexOf(start), to = source.indexOf(end, from);
  assert.ok(from >= 0 && to > from, 'Missing function section: ' + start);
  return source.slice(from, to);
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

function ui() {
  const calls = [], messages = [], elements = new Map();
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      innerHTML: '', innerText: '', textContent: '', style: {}, disabled: false, value: '', events: {},
      classList: { toggle() {}, add() {}, remove() {} },
      addEventListener(name, handler) { this.events[name] = handler; },
      querySelector(selector) { return element(id + selector); }
    });
    return elements.get(id);
  }
  const context = vm.createContext({
    $, Date, Promise, setTimeout, clearTimeout,
    document: { querySelector: () => element('haul-host') },
    window: {}, navigator: {},
    URL: { createObjectURL: () => 'blob:synthetic', revokeObjectURL() {} },
    I: { chk: '', spark: '', box: '' },
    esc: String, fmtMon: date => String(date.getMonth()),
    triplet: () => ['#eee', '#ddd', '#ccc'], baseColor: () => '#ddd',
    toTxt: value => value,
    model: row => ({ ...row, s1: '#eee', sdeep: '#ccc' }),
    findDup: () => null,
    toast: text => messages.push(text),
    reloadBoot() {}, resetAdd() {}, go() {},
    RUN: (name, ok, fail, ...args) => calls.push({ name, ok, fail, args })
  });
  function $(id) { return element(id); }
  vm.runInContext(section('function effExp(', 'function model('), context);
  vm.runInContext(section('var HAUL =', 'function reloadBoot('), context);
  vm.runInContext(section('function commitItem(', '/* ---------------- TOAST'), context);
  vm.runInContext(section('var scanBusy=', '/* ---------------- PHOTO FOR AI'), context);
  vm.runInContext(section('var PASTE_SAMPLE=', '/* ---------------- CATALOG: grid'), context);
  vm.runInContext(section('function loadHaul(', '/* ---------------- DARK MODE'), context);
  context.HAUL = [{ row: '0001-doc', brand: 'Synthetic', checked: false, krw: 2000 }];
  context.renderHaul();
  function clickHaul(remove = false) {
    element('haul-list').events.click({ stopPropagation() {}, target: { closest(selector) {
      if (selector === '[data-del]') return remove ? { dataset: { del: '0001-doc' } } : null;
      return { dataset: { row: '0001-doc' }, classList: { toggle() {} } };
    } } });
  }
  return { context, element, calls, messages, clickHaul };
}

test('Firebase Tracker includes an earlier manufacture estimate', () => {
  const { context } = ui();
  const expiry = context.effExp({ exp: 'Jan 1, 2030', mfg: 'Jan 1, 2023' });
  assert.equal(expiry.d.getFullYear(), 2026);
  assert.equal(expiry.est, true);
});
for (const pao of ['not a number', '0', '-6', 'Infinity', '1e308']) {
  test(`Firebase Tracker ignores invalid PAO ${pao}`, () => {
    assert.equal(ui().context.effExp({ opened: 'Jan 1, 2025', pao }), null);
  });
}

const row = ['', '霧面唇彩', 'Lip', '01', 'Rose', '', '', '', '6', '0012345678905', '', '', '', '', '', ''];
test('Firebase import preview preserves leading blank fields and code strings', () => {
  const { context, element } = ui(), lookups = [];
  context.findDup = (...args) => { lookups.push(args); return null; };
  element('paste').innerText = row.join('\t');
  context.previewImport();
  assert.deepEqual(lookups[0], ['', '01', '霧面唇彩', 'Rose']);
});
test('Firebase import submission preserves original populated rows', () => {
  const { context, element, calls } = ui();
  element('paste').innerText = '\r\n\t\t\r\n' + row.join('\t') + '\r\n';
  context.wireImport();
  element('import-go').events.click();
  assert.equal(calls[0].name, 'bulkImport');
  assert.equal(calls[0].args[0], row.join('\t'));
});

function api(overrides = {}) {
  const writes = [];
  const context = vm.createContext({
    Date, Promise,
    ITEMS: { doc: () => ({ id: 'synthetic-new-id' }) },
    DB: { batch: () => ({ set: (ref, data) => writes.push(data), commit: () => Promise.resolve() }) },
    ...overrides
  });
  vm.runInContext(section('var HEADERS =', 'function fmtMon('), context);
  vm.runInContext(section('var API =', 'function RUN('), context);
  return { context, writes };
}
test('Firestore import keeps the 16-column contract and string zeroes', async () => {
  const { context, writes } = api();
  const result = await context.API.bulkImport('\n\t\t\n' + row.join('\t'));
  assert.equal(result.added, 1);
  assert.equal(writes[0].brand_name, '');
  assert.equal(writes[0].product_name, '霧面唇彩');
  assert.equal(writes[0].shade_number, '01');
  assert.equal(writes[0].barcode, '0012345678905');
  assert.equal(writes[0].status, 'active');
  assert.equal(writes[0].swatch_color, '');
});
test('Firestore haul reads propagate failures instead of returning an empty inventory', async () => {
  const { context } = api({ HAULC: { orderBy: () => ({ get: () => Promise.reject(new Error('synthetic permission failure')) }) } });
  await assert.rejects(context.API.getHaul(), /synthetic permission failure/);
});
test('haul failure preserves known rows and offers retry', () => {
  const { context, element, calls, messages } = ui();
  context.loadHaul();
  calls[0].fail(new Error('synthetic read failure'));
  assert.equal(context.HAUL.length, 1);
  assert.match(messages.at(-1), /synthetic read failure/);
  assert.equal(typeof element('haul-retry').onclick, 'function');
});
test('haul serializes checked-state writes and restores failed optimistic state', () => {
  const { context, calls, clickHaul } = ui();
  clickHaul();
  clickHaul();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].args[0], '0001-doc');
  calls[0].fail(new Error('synthetic write failure'));
  assert.equal(context.HAUL[0].checked, false);
});
test('haul removal keeps the complete string document ID', () => {
  const { calls, clickHaul } = ui();
  clickHaul(true);
  assert.equal(calls[0].name, 'removeHaulItem');
  assert.equal(calls[0].args[0], '0001-doc');
});
test('failed scanner saves restore the scanner button', () => {
  const { context, element, calls } = ui();
  element('scan-save').disabled = true;
  context.doAdd({ brand_name: 'Synthetic' }, false);
  calls[0].fail(new Error('synthetic write failure'));
  assert.equal(element('scan-save').disabled, false);
});
test('canceling duplicate confirmation leaves scanner Save available', () => {
  const { context, element } = ui();
  context.findDup = () => ({ brand: 'Synthetic', status: 'fresh' });
  context.scanResult('0012345678905', { found: false });
  element('s_brand').value = 'Synthetic';
  element('scan-save').onclick();
  element('sheet-body').querySelector('[data-cancel]').onclick();
  assert.equal(element('scan-save').disabled, false);
});

function cameraHarness() {
  const harness = ui();
  const enumerate = deferred(), start = deferred();
  const instances = [];
  class Scanner {
    constructor() { this.starts = 0; this.stops = 0; this.clears = 0; this.running = false; instances.push(this); }
    start() { this.starts++; return start.promise.then(() => { this.running = true; }); }
    stop() { this.stops++; if (!this.running) return Promise.reject(new Error('not running')); this.running = false; return Promise.resolve(); }
    clear() { this.clears++; }
    static getCameras() { return enumerate.promise; }
  }
  harness.context.Html5Qrcode = Scanner;
  return { ...harness, enumerate, start, instances };
}
test('camera enumeration resolving after Cancel cannot reopen or replace the reset UI', async () => {
  const { context, element, enumerate, instances } = cameraHarness();
  context.startLiveScan();
  await flush();
  context.resetScan();
  enumerate.resolve([{ id: 'synthetic-camera', label: 'back' }]);
  await flush();
  assert.ok(instances.every(scanner => scanner.starts === 0));
  assert.equal(element('scan-result-wrap').innerHTML, '');
});
test('camera start resolving after Cancel closes the late stream', async () => {
  const { context, element, enumerate, start, instances } = cameraHarness();
  context.startLiveScan();
  enumerate.resolve([{ id: 'synthetic-camera', label: 'back' }]);
  await flush();
  assert.equal(instances[0].starts, 1);
  context.resetScan();
  start.resolve();
  await flush();
  assert.equal(instances[0].running, false);
  assert.match(element('vf-hint').textContent, /upload a photo/);
});
test('a replacement camera waits for the canceled start and cleanup to finish', async () => {
  const { context, enumerate, start, instances } = cameraHarness();
  context.startLiveScan();
  enumerate.resolve([{ id: 'synthetic-camera', label: 'back' }]);
  await flush();
  context.resetScan();
  context.startLiveScan();
  await flush();
  assert.equal(instances.length, 1);
  start.resolve();
  await flush();
  assert.equal(instances[0].running, false);
  assert.equal(instances[1].running, true);
  assert.equal(instances[0].clears, 1);
});
test('old stop DOM cleanup finishes before a replacement camera touches the reader', async () => {
  const { context, element } = ui(), stopping = deferred(), instances = [];
  class Scanner {
    constructor() { this.id = instances.length + 1; instances.push(this); }
    start() { element('reader').innerHTML = 'video-' + this.id; return Promise.resolve(); }
    stop() { return stopping.promise.then(() => { element('reader').innerHTML = ''; }); }
    clear() { element('reader').innerHTML = ''; }
    static getCameras() { return Promise.resolve([{ id: 'synthetic-camera' }]); }
  }
  context.Html5Qrcode = Scanner;
  context.startLiveScan();
  await flush();
  assert.equal(element('reader').innerHTML, 'video-1');
  context.resetScan();
  context.startLiveScan();
  await flush();
  assert.equal(instances.length, 1);
  stopping.resolve();
  await flush();
  assert.equal(instances.length, 2);
  assert.equal(element('reader').innerHTML, 'video-2');
});
test('a rejected canceled start releases the cleanup barrier for a camera retry', async () => {
  const { context, element } = ui(), firstStart = deferred(), instances = [];
  class Scanner {
    constructor() { this.id = instances.length + 1; instances.push(this); }
    start() { return this.id === 1 ? firstStart.promise : Promise.resolve(); }
    stop() { throw new Error('not scanning'); }
    clear() {}
    static getCameras() { return Promise.resolve([{ id: 'synthetic-camera' }]); }
  }
  context.Html5Qrcode = Scanner;
  context.startLiveScan();
  await flush();
  context.resetScan();
  context.startLiveScan();
  firstStart.reject(new Error('synthetic permission failure'));
  await flush();
  assert.equal(instances.length, 2);
  assert.equal(context.liveScanner, instances[1]);
  assert.equal(element('scan-result-wrap').innerHTML, '');
  assert.equal(element('vf-hint').textContent, 'Point at the barcode…');
});
test('late barcode lookup cannot repopulate a canceled scan', () => {
  const { context, element, calls } = ui();
  context.onCode('0012345678905');
  context.resetScan();
  calls[0].ok({ found: true, brand: 'Synthetic', product: 'Tint' });
  assert.equal(element('scan-result-wrap').innerHTML, '');
});
test('late uploaded-photo decode cannot start a lookup after Cancel', async () => {
  const { context, element, calls } = ui(), detection = deferred();
  context.window.BarcodeDetector = true;
  context.BarcodeDetector = class { detect() { return detection.promise; } };
  context.createImageBitmap = async () => ({ close() {} });
  const pending = context.onScanFile({ target: { files: [{}] } });
  await flush();
  context.resetScan();
  detection.resolve([{ rawValue: '0012345678905' }]);
  await pending;
  assert.equal(calls.length, 0);
  assert.equal(element('scan-result-wrap').innerHTML, '');
});
