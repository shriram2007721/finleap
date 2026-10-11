// Smoke test: bundles the single-file app and clicks through every screen in jsdom.
// Run: npm test
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const out = path.resolve('.smoke/app.mjs');
await build({ entryPoints: ['src/LakshyaFinLit.jsx'], bundle: true, format: 'esm', platform: 'node', outfile: out, external: ['react', 'react-dom', 'lucide-react'], logLevel: 'error' });

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { pretendToBeVisual: true, url: 'http://localhost/' });
const { window } = dom;
window.scrollTo = () => {};
for (const k of ['window', 'document', 'navigator', 'localStorage', 'requestAnimationFrame', 'cancelAnimationFrame', 'HTMLElement', 'Node']) {
  try { Object.defineProperty(globalThis, k, { value: window[k], configurable: true, writable: true }); } catch (e) { /* keep node's */ }
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__LF_MISSING = new Set();

const React = (await import('react')).default;
const { act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { default: App, DICT, PERSONAS, SCENARIOS, QUIZ } = await import(pathToFileURL(out).href);

let fails = 0;
const ok = (cond, msg) => { if (!cond) { fails += 1; console.log('  FAIL:', msg); } };
const errors = [];
const origErr = console.error;
console.error = (...a) => { errors.push(a.map(String).join(' ').slice(0, 300)); };

// ---- 1. dictionary checks
const en = Object.keys(DICT.en); const te = Object.keys(DICT.te);
ok(en.every((k) => k in DICT.te), 'te missing: ' + en.filter((k) => !(k in DICT.te)));
ok(te.every((k) => k in DICT.en), 'en missing: ' + te.filter((k) => !(k in DICT.en)));
const vars = (s) => (s.match(/\{[a-z]+\}/g) || []).sort().join();
const count = (s, re) => (s.match(re) || []).length;
for (const k of en.filter((x) => x !== 'i.formula')) {
  if (DICT.te[k] && vars(DICT.en[k]) !== vars(DICT.te[k])) ok(false, `placeholder mismatch ${k}`);
  for (const l of ['en', 'te']) {
    const s = DICT[l][k] || '';
    if (count(s, /\[\[/g) !== count(s, /\]\]/g) || count(s.replace(/\[\[|\]\]/g, ''), /[[\]]/g)) ok(false, `bracket mismatch ${l} ${k}`);
  }
  if (k.startsWith('sc.') && DICT.te[k]) ok(count(DICT.en[k], /\[\[/g) === count(DICT.te[k], /\[\[/g), `flag count differs ${k}`);
}
const banned = /mutual fund|nifty|sensex|\bSIP\b|zerodha|groww|paytm|phonepe|gpay|google pay|\bSBI\b|HDFC|ICICI|you should invest/i;
for (const l of ['en', 'te']) for (const k of en) ok(!banned.test(DICT[l][k] || ''), `banned term in ${l} ${k}`);

// ---- 2. click-through helpers
const root = createRoot(document.getElementById('root'));
await act(async () => { root.render(React.createElement(App)); });
let lang = 'en';
const t = (k, v) => { let s = DICT[lang][k]; if (s == null) { ok(false, 'test used unknown key ' + k); return k; } for (const x in (v || {})) s = s.split(`{${x}}`).join(String(v[x])); return s; };
const visible = (el) => !el.closest('[hidden]');
const all = (sel) => [...document.querySelectorAll(sel)].filter(visible);
const btn = (text, nth = 0) => all('button').filter((b) => b.textContent.includes(text))[nth];
const click = async (el, why) => {
  if (!el) { ok(false, 'no element: ' + why); return; }
  if (el.disabled) { ok(false, 'disabled: ' + why); return; }
  await act(async () => { el.dispatchEvent(new window.MouseEvent('click', { bubbles: true })); });
};
const tap = (text, nth) => click(btn(text, nth), text);
const body = () => all('main, .max-w-6xl').map((e) => e.textContent).join(' ');
const setLang = async (l) => {
  const targetText = l === 'te' ? 'తెలుగు' : 'English';
  let b = btn(targetText);
  if (b) {
    await click(b, targetText);
  } else if (globalThis.window && globalThis.window.__LF_DISPATCH) {
    await act(async () => {
      globalThis.window.__LF_DISPATCH({ type: 'lang', v: l });
    });
  }
  lang = l;
};
const xp = () => { const m = /Total XP: (\d+)|మొత్తం XP: (\d+)|(\d+) XP/.exec(all('main')[0].textContent); return m ? +(m[1] || m[2] || m[3]) : 0; };
const tab = (id) => click(all('nav button').find((b) => b.textContent.includes(t(`tab.${id}`))), 'tab ' + id);
const change = async (el, value) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, value);
    el.dispatchEvent(new window.Event('input', { bubbles: true }));
    el.dispatchEvent(new window.Event('change', { bubbles: true }));
  });
};
const homeXp = async () => { await tab('home'); return xp(); };

async function playBudget(P) {
  await tab('budget'); await tap(t('c.start'));
  const card = (i) => all('li[draggable]')[i];
  const inCard = (i, text) => [...card(i).querySelectorAll('button')].find((x) => x.textContent.includes(text));
  for (let i = 0; i < P.items.length; i++) {
    const it = P.items[i]; let ans = it.ans;
    if (it.ctx) { await click(inCard(i, t(`it.${it.id}.q.${it.ctx[0][0]}`)), 'ctx'); ans = it.ctx[0][1]; }
    if (i === 0) { await click(inCard(i, t(ans === 'need' ? 'b.want' : 'b.need')), 'wrong first'); ok(body().includes(t('fb.rethink')), 'rethink feedback'); }
    await click(inCard(i, t(`b.${ans}`)), `${it.id}->${ans}`);
    if (i === 0) ok(body().includes(t('fb.comeback')), 'comeback feedback');
    ok(body().includes(t(it.ctx ? `it.${it.id}.why.${it.ctx[0][0]}` : `it.${it.id}.why`)), 'why shown ' + it.id);
  }
  let moved = 0;
  for (let i = 0; i < P.items.length && btn(t('b.toGoal')).disabled; i++) {
    const it = P.items[i];
    if ((it.ctx ? it.ctx[0][1] : it.ans) === 'want') { await click(inCard(i, t('b.later')), 'move later'); moved += 1; }
  }
  ok(moved > 0, 'over-budget trade-off was required');
  await tap(t('b.toGoal'));
  await tap(t(`g.${P.goals[1].id}`));
  await change(all('#lf-weekly')[0], '100');
  ok(body().includes(t('b.goal.result', { n: Math.ceil(P.goals[1].cost / 100) })), 'weeks to goal');
  await tap(t('c.finish'));
  ok(body().includes(t('sum.title')), 'budget summary');
}

async function playSave(P, jar) {
  await tab('save');
  if (btn(t('s.replay'))) await tap(t('s.replay'));
  const sw = all('[role=switch]')[0];
  if ((sw.getAttribute('aria-checked') === 'true') !== jar) await click(sw, 'jar switch');
  await tap(t('s.begin'));
  for (let wk = 0; wk < 4; wk++) {
    if (wk === 2) {
      ok(body().includes(t('s.paths')) && body().includes(t('s.with.d')), 'two paths panel');
      if (!jar) { ok(btn(t('s.keep')).disabled, 'must choose trade'); await tap(t(`tr.goal.${P.id}`)); ok(body().includes(t('s.yours')), 'your path marked'); }
      await tap(t('s.keep'));
    }
    ok(body().includes(t('s.week', { n: wk + 1 })), 'week ' + (wk + 1));
    const cards = all('fieldset');
    for (let i = 0; i < 2; i++) {
      const [hi, lo] = cards[i].querySelectorAll('button'); // the pricier option is disabled when the wallet cannot cover it
      await click(jar || wk % 2 === 0 || hi.disabled ? lo : hi, `week ${wk + 1} choice ${i}`);
    }
    await tap(t(wk === 3 ? 's.endMonth' : 's.nextWeek'));
  }
  ok(body().includes(t('sum.title')), 'save summary');
  ok(body().includes(jar ? t('s.with.d') : t(`tr.goal.${P.id}.c`)), 'path recap');
}

async function playInvest() {
  await tab('invest');
  if (btn(t('c.tryAgain'))) await tap(t('c.tryAgain')); else await tap(t('c.start'));
  await change(all('#lf-m')[0], '500'); await change(all('#lf-y')[0], '10');
  await tap(t('i.high'));
  for (const cb of all('main input[type=checkbox]')) await click(cb, 'toggle');
  ok(body().includes(t('i.disclaimer')), 'disclaimer visible'); ok(body().includes(t('i.bumpy.note')), 'bumpy note');
  ok(body().includes('60,000'), 'contributions 500 x 120 = 60,000');
  ok(all('main svg[role=img] path').length === 6, 'chart paths: ' + all('main svg[role=img] path').length);
  await tap(t('i.toDiv'));
  await tap(t('i.div.all')); await tap(t('i.div.run'));
  ok(body().includes(t('i.div.hit', { x: 'A' })), 'tough year result'); ok(body().includes(t('i.div.fb.conc')), 'concentrated feedback');
  await tap(t('i.div.even')); await tap(t('i.div.again')); ok(body().includes(t('i.div.fb.spread')), 'spread feedback');
  await tap(t('i.toQuiz'));
  for (let i = 0; i < QUIZ.length; i++) {
    const q = QUIZ[i];
    if (i === 0) { await tap(t(`q.${q.id}.${q.opts.find((o) => o !== q.ans)}`)); ok(body().includes(t('q.rethink')), 'quiz rethink'); await tap(t('c.tryAgain')); }
    await tap(t(`q.${q.id}.${q.ans}`)); ok(body().includes(t(`q.${q.id}.why`)), 'quiz why');
    await tap(t(i < 2 ? 'c.next' : 'c.finish'));
  }
  ok(body().includes(t('sum.title')), 'invest summary');
}

async function playSafe(P) {
  await tab('safe');
  if (btn(t('c.tryAgain'))) await tap(t('c.tryAgain')); else await tap(t('c.start'));
  const seen = [];
  for (let i = 0; i < P.scams.length; i++) {
    ok(body().includes(t('f.count', { a: i + 1, b: P.scams.length })), 'count ' + i);
    const id = P.scams.find((x) => body().includes(t(`sc.${x}.from`)) && body().includes(t(`sc.${x}`).replace(/\[\[|\]\]/g, '').slice(0, 25)));
    ok(!!id, 'scenario identified'); if (!id) return seen;
    seen.push(id); const sc = SCENARIOS[id];
    if (i < 2) { await tap(t('f.share')); ok(body().includes(t('f.pause')), 'pause panel'); ok(all('mark').length > 0, 'flags highlighted'); await tap(t('c.tryAgain')); ok(all('mark').length === 0, 'flags hidden on retry'); }
    await tap(t(sc.ans === 'block' ? 'f.block' : 'f.genuine'));
    ok(body().includes(t(`sc.${id}.why`)) && body().includes(t(`r.${sc.rule}`)), 'why + rule ' + id);
    await tap(t(sc.ans === 'block' ? 'f.reveal' : 'f.revealGood')); ok(all('mark').length > 0, 'reveal flags ' + id);
    await tap(t(i < P.scams.length - 1 ? 'c.next' : 'c.finish'));
  }
  ok(new Set(seen).size === P.scams.length, 'every scenario shown once');
  ok(body().includes(t('sum.title')), 'safe summary');
  return seen;
}

for (const pid of ['arjun', 'priya']) {
  const P = PERSONAS[pid];
  console.log('persona', pid);
  let last = 0;
  if (pid === 'arjun') await tap(t('wel.cta')); else { last = await homeXp(); await tap(t('per.switch')); }
  await tap(t('per.pick', { name: t(`per.${pid}.name`) }));
  ok(body().includes(t('home.hi', { name: t(`per.${pid}.name`) })), 'home greeting');
  ok(body().includes(new Intl.NumberFormat('en-IN').format(P.wallet)), 'wallet shown');
  ok(body().includes(t('st.0')) && !body().includes(t('st.2')), 'attempt state reset for persona');
  const mono = async (label) => { const now = await homeXp(); ok(now >= last, `xp dropped after ${label}: ${last} -> ${now}`); console.log('  ', label, '-> xp', now); last = now; };
  await mono('persona pick');
  await playBudget(P); await mono('budget');
  await tab('budget'); await setLang('te'); ok(body().includes(t('sum.title')), 'state kept across language switch');
  await playSave(P, true); await mono('save with jar');
  await playSave(P, false); await mono('save without jar');
  await setLang('en');
  await playInvest(); await mono('invest');
  await setLang('te');
  const o1 = await playSafe(P); await mono('safe');
  const o2 = await playSafe(P); await mono('safe replay');
  console.log('   shuffled:', o1.join() !== o2.join());
  await setLang('en'); await tab('home');
  ok(body().includes(t('home.allDone')), 'all done');
  const earned = all('main button').filter((b) => b.textContent.includes(t('home.earned'))).length;
  ok(earned === 6, 'six badges earned, got ' + earned);
  await tap(t('bd.comeback')); ok(document.querySelector('[role=dialog]'), 'badge modal'); await click(document.querySelector('[role=dialog] button'), 'close modal');
  await tap(t('privacy.chip')); ok(document.body.textContent.includes(t('privacy.body')), 'privacy explainer'); await click(document.querySelector('[role=dialog] button'), 'close');
  ok(body().includes(t('footer')), 'footer');
}

console.log('admin');
for (const l of ['en', 'te']) {
  await setLang(l);
  await tap(t('role.admin'));
  ok(body().includes(t('a.sample')) && body().includes(t('a.you')), 'admin header + you row');
  ok(body().includes('1,440'), 'cohort KPI'); ok(body().includes(t('footer')), 'admin footer');
  ok(/HYD-B\d-\d{4}/.test(body()), 'id format');
  ok(all('tbody tr')[0].textContent.includes('4/4'), 'you row mirrors session');
  const rowsN = () => all('tbody tr').length;
  ok(rowsN() === 10, 'page size 10, got ' + rowsN());
  await tap(t('a.next')); ok(body().includes(t('a.page', { a: 2, b: 7 })), 'pagination');
  await tap(t('a.prev'));
  const firstId = () => all('tbody tr')[1].textContent.slice(0, 11);
  await click(all('thead button')[3], 'sort safety'); const a = firstId(); await click(all('thead button')[3], 'sort desc'); ok(a !== firstId(), 'sort changes order');
  const sel = all('select');
  await change(sel[0], '1'); ok(body().includes('240'), 'batch filter scales cohort'); ok(all('tbody tr').slice(1).every((r) => r.textContent.includes('HYD-B2')), 'batch rows');
  await change(sel[1], 'te'); ok(all('tbody tr').slice(1).every((r) => r.textContent.includes('తెలుగు')), 'language rows');
  await click(all('.max-w-6xl input[type=checkbox]')[0], 'action only');
  await change(all('input[type=search]')[0], 'zzz'); ok(body().includes(t('a.empty')), 'empty state');
  await tap(t('a.f.clear')); ok(rowsN() === 10, 'cleared');
  await tap(t('a.export')); ok(body().includes(t('a.export.ok')), 'export note');
  await tap(t('a.export.alt')); const ta = document.querySelector('textarea');
  ok(ta && ta.value.split('\n').length === 62 && ta.value.startsWith('student_id'), 'csv rows ' + (ta && ta.value.split('\n').length));
  await click(document.querySelector('[role=dialog] button'), 'close csv');
  await tap(t('role.student')); ok(body().includes(t('home.allDone')), 'student state kept after role toggle');
}

console.error = origErr;
const missing = [...globalThis.__LF_MISSING];
ok(missing.length === 0, 'missing i18n keys: ' + missing.join(', '));
const real = errors.filter((e) => !e.includes('Not implemented: navigation')); // jsdom cannot follow the CSV download link
ok(real.length === 0, 'console errors:\n' + [...new Set(real)].slice(0, 8).join('\n'));
console.log(fails ? `\n${fails} FAILURES` : '\nALL CHECKS PASSED');
process.exit(fails ? 1 : 0);
