import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { parse } from 'parse5';

// Exercise the actual built head script, including operation before the body exists.
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const documentNode = parse(html);
const head = documentNode.childNodes.find((node) => node.tagName === 'html').childNodes.find((node) => node.tagName === 'head');
const scriptNode = head.childNodes.find((node) => node.tagName === 'script');
assert(scriptNode, 'Theme initialization must be in the head');
assert(!scriptNode.attrs.some(({ name }) => ['src', 'defer', 'async', 'type'].includes(name)), 'Theme must run synchronously');
const script = scriptNode.childNodes.map((node) => node.value ?? '').join('');
const styleIndex = head.childNodes.findIndex((node) => node.tagName === 'style' ||
  (node.tagName === 'link' && node.attrs.some(({ name, value }) => name === 'rel' && value === 'stylesheet')));
assert(styleIndex > head.childNodes.indexOf(scriptNode), 'Restore theme before inline or linked styles');

class Events {
  listeners = new Map();
  addEventListener(name, callback) { this.listeners.set(name, callback); }
  emit(name, event = {}) { this.listeners.get(name)?.(event); }
}

function visit({ dark = false, saved = null, blockedRead = false, blockedWrite = false } = {}) {
  const system = Object.assign(new Events(), { matches: dark });
  const button = Object.assign(new Events(), {
    hidden: true,
    setAttribute(name, value) { this[name] = value; },
  });
  let ready = false;
  let stored = saved;
  const document = Object.assign(new Events(), {
    documentElement: { dataset: {} },
    querySelector: () => ready ? button : null,
  });
  const window = Object.assign(new Events(), { matchMedia: () => system });
  const localStorage = {
    getItem(key) { assert.equal(key, 'jitka-web-theme'); if (blockedRead) throw Error('denied'); return stored; },
    setItem(key, value) { assert.equal(key, 'jitka-web-theme'); if (blockedWrite) throw Error('denied'); stored = value; },
  };
  runInNewContext(script, { document, window, localStorage });
  const initial = document.documentElement.dataset.theme;
  ready = true;
  document.emit('DOMContentLoaded');
  return {
    initial, button,
    get theme() { return document.documentElement.dataset.theme; },
    get stored() { return stored; },
    os(dark) { system.matches = dark; system.emit('change'); },
    storage(value, key = 'jitka-web-theme') { window.emit('storage', { key, newValue: value }); },
  };
}

for (const dark of [false, true]) {
  for (const saved of [null, '', 'invalid', 'light', 'dark']) {
    const page = visit({ dark, saved });
    const expected = ['light', 'dark'].includes(saved) ? saved : dark ? 'dark' : 'light';
    assert.equal(page.initial, expected, 'Theme applied before body/DOMContentLoaded');
    assert.equal(page.button['aria-pressed'], String(expected === 'dark'));
    assert.equal(page.button.hidden, false);
    page.os(!dark);
    assert.equal(page.theme, ['light', 'dark'].includes(saved) ? saved : dark ? 'light' : 'dark');
    const before = page.theme;
    page.button.emit('click');
    assert.equal(page.theme, before === 'dark' ? 'light' : 'dark');
    assert.equal(page.stored, page.theme);
    page.os(dark);
    assert.equal(page.theme, page.stored, 'Manual preference wins over later OS changes');
    assert.equal(visit({ dark, saved: page.stored }).initial, page.theme, 'Saved choice survives a new document');
  }
}
for (const dark of [false, true]) {
  const page = visit({ dark, blockedRead: true, blockedWrite: true });
  assert.equal(page.initial, dark ? 'dark' : 'light');
  page.button.emit('click');
  assert.equal(page.theme, dark ? 'light' : 'dark');
  page.os(!dark);
  page.os(dark);
  assert.equal(page.theme, dark ? 'light' : 'dark', 'A failed save must not undo this page’s choice');
}
const tabs = visit({ dark: true, saved: 'light' });
tabs.storage('dark', 'unrelated-key');
assert.equal(tabs.theme, 'light');
tabs.storage('dark');
assert.equal(tabs.theme, 'dark');
tabs.storage(null);
tabs.os(false);
assert.equal(tabs.theme, 'light', 'Removing the saved choice restores system mode');
tabs.storage('dark');
tabs.storage(null, null);
assert.equal(tabs.theme, 'light', 'Clearing storage restores system mode');
console.log('Theme regression passed: early restore, OS/default/invalid/saved choices, toggle state, persistence, blocked storage, OS and cross-tab changes.');
