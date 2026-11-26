'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'Code.gs'), 'utf8');
const copy = value => JSON.parse(JSON.stringify(value));

function backend() {
  const operations = [];
  const messages = [];
  const sheet = {
    getLastRow: () => 3,
    getRange(row, column, rows = 1, columns = 1) {
      return {
        setNumberFormat(format) {
          operations.push({ type: 'format', row, column, rows, columns, format });
          return this;
        },
        setValues(values) {
          operations.push({ type: 'write', row, column, rows, columns, values: copy(values) });
          return this;
        }
      };
    }
  };
  class FixedDate extends Date {
    constructor(...args) { super(...(args.length ? args : ['2026-11-26T12:00:00Z'])); }
  }
  const context = vm.createContext({
    Date: FixedDate,
    SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheets: () => [sheet] }) },
    Session: {
      getScriptTimeZone: () => 'UTC',
      getEffectiveUser: () => ({ getEmail: () => 'fixture@example.invalid' })
    },
    Utilities: { formatDate: date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-') },
    MailApp: { sendEmail: (...args) => messages.push(args) }
  });
  vm.runInContext(source, context, { filename: 'Code.gs' });
  return { context, operations, messages };
}

test('bulk import preserves leading blank columns and string codes', () => {
  const { context, operations } = backend();
  const row = ['', '霧面唇彩', 'lips', '01', 'Rose', 'Jan 10, 2028', '', '', '6',
    '0012345678905', '', '12.00', '', '', 'synthetic note', ''];
  assert.equal(context.bulkImport(row.join('\t')).added, 1);
  row[10] = 'active';
  assert.deepEqual(operations.find(op => op.type === 'write').values, [row]);
});

test('bulk import ignores blank lines and formats text columns before writing', () => {
  const { context, operations } = backend();
  const row = ['Synthetic Brand', 'Lip tint', 'lips', '001', '紅', '', '', '', '', '000123'];
  assert.equal(context.bulkImport('\r\n\t\t\r\n' + row.join('\t') + '\r\n   \r\n').added, 1);
  const writeIndex = operations.findIndex(op => op.type === 'write');
  assert.deepEqual(operations.slice(0, writeIndex).map(op => op.column), [4, 6, 7, 8, 10, 13]);
  assert.ok(operations.slice(0, writeIndex).every(op => op.type === 'format' && op.format === '@'));
  const written = operations[writeIndex].values[0];
  assert.equal(written.length, 16);
  assert.equal(written[3], '001');
  assert.equal(written[9], '000123');
});

test('digest includes an earlier manufacture estimate even with a future printed date', () => {
  const { context, messages } = backend();
  context.getBootstrap = () => ({ rows: [{ b: 'Synthetic', p: 'Earlier estimate', status: 'active',
    exp: 'Jan 10, 2030', mfg: 'Jan 1, 2023' }] });
  assert.equal(context.sendExpiryDigest(), 'sent 1');
  assert.equal(messages.length, 1);
  assert.match(messages[0][2], /2026-01-01/);
  assert.match(messages[0][2], /est\./);
});

for (const pao of ['not a number', '0', '-6', 'Infinity', '1e308']) test(`invalid PAO ${pao} cannot suppress or replace a valid printed expiry`, () => {
  const { context, messages } = backend();
  context.getBootstrap = () => ({ rows: [{ b: 'Synthetic', p: 'Printed expiry', status: 'active',
    exp: 'Jan 1, 2026', opened: 'Jan 1, 2025', pao }] });
  assert.equal(context.sendExpiryDigest(), 'sent 1');
  assert.equal(messages.length, 1);
  assert.match(messages[0][2], /2026-01-01/);
});

test('digest still selects the earliest valid PAO and ignores retired rows', () => {
  const { context, messages } = backend();
  context.getBootstrap = () => ({ rows: [
    { b: 'Synthetic', p: 'PAO', status: 'active', exp: 'Jan 1, 2030', opened: 'Jan 1, 2026', pao: '6' },
    { b: 'Synthetic', p: 'Retired', status: 'retired', exp: 'Jan 1, 2020' }
  ] });
  assert.equal(context.sendExpiryDigest(), 'sent 1');
  assert.equal(messages.length, 1);
  assert.match(messages[0][2], /2026-07-01/);
  assert.doesNotMatch(messages[0][2], /Retired/);
});
