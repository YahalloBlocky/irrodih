// Navigation, progress, graphs, quiz. Hash routing keeps links working on Vercel.
const $ = s => document.querySelector(s), main = $('#main');
let S = { done: {}, last: '#/overview', scores: {}, hist: [], theme: 'light' };
try { Object.assign(S, JSON.parse(localStorage.getItem('mrs') || '{}')) } catch (e) { }
const save = () => { try { localStorage.setItem('mrs', JSON.stringify(S)) } catch (e) { } };
const keys = () => Object.entries(LESSONS).flatMap(([k, v]) => v.items.map((_, i) => `${k}/${i}`));
function buildNav(f = '') {
  let h = `<a href="#/overview">Overview</a>`;
  for (const [k, v] of Object.entries(LESSONS)) {
    const it = v.items.map((x, i) => [x, i]).filter(([x]) => !f || (x.t + x.h).toLowerCase().includes(f));
    if (it.length) h += `<details ${f ? 'open' : ''} data-k="${k}"><summary>${v.name}</summary>${it.map(([x, i]) => `<a href="#/${k}/${i}">${S.done[k + '/' + i] ? '✓ ' : ''}${x.t}</a>`).join('')}</details>`
  }
  h += `<a href="#/formulas">Formula Summary</a><a href="#/graphs">Graph Interpretation</a><a href="#/quiz">Practice Quiz</a><p><button id="reset">Reset progress</button></p>`;
  if (f && h.indexOf('<details') < 0) h = `<p class="note">No lessons match “${f}”.</p>` + h; $('#side').innerHTML = h;
  const r = location.hash || '#/overview'; document.querySelectorAll('#side a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === r));
  const d = $(`#side details[data-k="${r.split('/')[1]}"]`); if (d) d.open = true;
  $('#reset').onclick = () => { if (confirm('Erase all progress and quiz scores?')) { S = { done: {}, last: '#/overview', scores: {}, hist: [], theme: S.theme }; save(); route() } }
}
function route() {
  const r = location.hash || '#/overview', p = r.split('/'); document.body.classList.remove('open'); quiz = null;
  if (p[1] === 'formulas') formulas(); else if (p[1] === 'graphs') graphs(); else if (p[1] === 'quiz') quizMenu(); else if (LESSONS[p[1]]) lesson(p[1], +p[2] || 0); else overview();
  if (LESSONS[p[1]]) { S.last = r; save() } buildNav($('#search').value.toLowerCase()); window.scrollTo(0, 0); main.classList.remove('in'); void main.offsetWidth; main.classList.add('in')
}
function pct() { const k = keys(); return Math.round(100 * k.filter(x => S.done[x]).length / k.length) }
function overview() {
  const done = keys().filter(x => S.done[x]).length, sc = Object.values(S.scores), avg = sc.length ? Math.round(sc.reduce((a, b) => a + b.best, 0) / sc.length) : 0;
  main.innerHTML = `<h1>Math 1: Conic Sections Reviewer</h1><p>Understand the Circle, Parabola, and Ellipse through simple explanations, worked examples, interactive graphs, and practice quizzes.</p><p>Conic sections are curves you get by slicing a cone with a plane. This reviewer covers three of them.</p>
 <div class="grid">${[['circle', 'Points at one distance from a center.'], ['parabola', 'Points equally far from a focus and a line.'], ['ellipse', 'Points whose distances to two foci add to a constant.']].map(([k, d]) => `<div class="card"><h2>${LESSONS[k].name}</h2><p>${d}</p>${thumb(k)}<p><a href="#/${k}/0"><button class="p">Start studying</button></a></p></div>`).join('')}</div>
 <div class="card"><h2>Your progress</h2><div class="bar"><i style="width:${pct()}%"></i></div><p>Lessons completed: ${done}/${keys().length} (${pct()}%)<br>Quizzes completed: ${sc.length}<br>Average best score: ${sc.length ? avg + '%' : 'no quizzes yet'}</p>
 <p>${S.hist.length ? 'Recent: ' + S.hist.slice(-3).reverse().join('; ') : 'No activity yet. Open a lesson to begin.'}</p><a href="${S.last}"><button class="p">${S.last === '#/overview' ? 'Start with the Circle' : 'Continue where you left off'}</button></a></div>`
}
function thumb(k) { const s = { circle: '<circle cx="60" cy="35" r="26"/>', parabola: '<path d="M20 60Q60 -20 100 60"/>', ellipse: '<ellipse cx="60" cy="35" rx="45" ry="22"/>' }[k]; return `<svg viewBox="0 0 120 70" width="120" fill="none" stroke="#2a6fd6" stroke-width="2">${s}</svg>` }
function lesson(k, i) {
  const L = LESSONS[k], x = L.items[i]; if (!x) return overview(); const id = k + '/' + i, all = keys(), n = all.indexOf(id), pv = all[n - 1], nx = all[n + 1];
  main.innerHTML = `<p>${L.name} · Lesson ${i + 1} of ${L.items.length}</p><h1>${x.t.replace(/^\d+\. /, '')}</h1>${x.h}<hr><button id="done" class="p">${S.done[id] ? '✓ Completed (click to undo)' : 'Mark as completed'}</button>
 <div class="nav2">${pv ? `<a href="#/${pv}"><button>← Previous</button></a>` : '<span></span>'}${nx ? `<a href="#/${nx}"><button class="p">Next →</button></a>` : `<a href="#/formulas"><button class="p">Formula Summary →</button></a>`}</div>`;
  $('#done').onclick = () => { S.done[id] = !S.done[id]; if (S.done[id]) S.hist.push(`Completed ${L.name} ${i + 1}`); save(); route() }
}
function formulas() {
  const rows = [['Circle', ['(x − h)² + (y − k)² = r²', 'x² + y² + Dx + Ey + F = 0', 'Tangent at (x₁,y₁) on x² + y² = r²: xx₁ + yy₁ = r²']], ['Parabola', ['(y − k)² = 4p(x − h): focus (h + p, k), directrix x = h − p', '(x − h)² = 4p(y − k): focus (h, k + p), directrix y = k − p', 'Latus rectum length = |4p|']], ['Ellipse', ['(x − h)²/a² + (y − k)²/b² = 1 (horizontal)', '(x − h)²/b² + (y − k)²/a² = 1 (vertical)', 'c² = a² − b²', 'e = c/a', 'Tangent at (x₁,y₁) on x²/a² + y²/b² = 1: xx₁/a² + yy₁/b² = 1']]];
  main.innerHTML = `<h1>Formula Summary</h1>` + rows.map(([n, f]) => `<h2>${n}</h2>${f.map(F).join('')}`).join('') + `<div class="note"><b>Checklist:</b> circle: center then radius. Parabola: vertex, then which variable is squared. Ellipse: center, longer axis, a² under the major-axis variable. Watch signs: (x − (−2)) = (x + 2). r, a, b, c are never negative.</div>`
}
// ---- Graphs: SVG, 20px per unit, origin at (200,150)
const X = x => 200 + 20 * x, Y = y => 150 - 20 * y;
function graphs() {
  main.innerHTML = `<h1>Graph Interpretation</h1><p>Change the values to see the graph and its properties update.</p>${['circle', 'parabola', 'ellipse'].map(k => `<h2>${LESSONS[k].name} graph</h2><div id="g-${k}"></div>`).join('')}`;
  gbuild('circle', [['h', -5, 5, 1, 2], ['k', -4, 4, 1, -1], ['r', 1, 6, 1, 3]], v => ({ svg: `<circle cx="${X(v.h)}" cy="${Y(v.k)}" r="${20 * v.r}" fill="none" stroke="#2a6fd6" stroke-width="2"/><line x1="${X(v.h)}" y1="${Y(v.k)}" x2="${X(v.h + v.r)}" y2="${Y(v.k)}" stroke="#e67e22" stroke-dasharray="4"/><circle cx="${X(v.h)}" cy="${Y(v.k)}" r="3"/><text x="${X(v.h) + 4}" y="${Y(v.k) + 14}">center (${v.h}, ${v.k})</text><text x="${X(v.h + v.r / 2)}" y="${Y(v.k) - 4}">r = ${v.r}</text>`, info: `Center (${v.h}, ${v.k}), radius ${v.r}.<br>Equation: ${eq('x', v.h)}² + ${eq('y', v.k)}² = ${v.r * v.r}` }));
  gbuild('parabola', [['h', -5, 5, 1, 0], ['k', -4, 4, 1, 0], ['p', -4, 4, 0.5, 2], ['horizontal(1)/vertical(0)', 0, 1, 1, 1]], v => {
    const { h, k, p } = v, H = v['horizontal(1)/vertical(0)'] === 1; if (!p) return { svg: '', info: 'p cannot be 0.' }; let pts = []; for (let t = -10; t <= 10; t += .2) { const u = t * t / (4 * p); pts.push(H ? `${X(h + u)},${Y(k + t)}` : `${X(h + t)},${Y(k + u)}`) }
    const fx = H ? h + p : h, fy = H ? k : k + p; return {
      svg: `<polyline points="${pts.join(' ')}" fill="none" stroke="#2a6fd6" stroke-width="2"/>${H ? `<line x1="${X(h - p)}" y1="0" x2="${X(h - p)}" y2="300" stroke="#c0392b" stroke-dasharray="5"/><line x1="0" y1="${Y(k)}" x2="400" y2="${Y(k)}" stroke="#999" stroke-dasharray="2"/>` : `<line x1="0" y1="${Y(k - p)}" x2="400" y2="${Y(k - p)}" stroke="#c0392b" stroke-dasharray="5"/><line x1="${X(h)}" y1="0" x2="${X(h)}" y2="300" stroke="#999" stroke-dasharray="2"/>`}<circle cx="${X(h)}" cy="${Y(k)}" r="4"/><circle cx="${X(fx)}" cy="${Y(fy)}" r="4" fill="#e67e22"/><text x="${X(h) + 6}" y="${Y(k) + 14}">vertex</text><text x="${X(fx) + 6}" y="${Y(fy) - 6}">focus</text>`,
      info: `Vertex (${h}, ${k}); p = ${p}; focus (${fx}, ${fy}); directrix ${H ? 'x = ' + (h - p) : 'y = ' + (k - p)}; axis ${H ? 'y = ' + k : 'x = ' + h}; opens ${H ? (p > 0 ? 'right' : 'left') : (p > 0 ? 'up' : 'down')}; latus rectum ${Math.abs(4 * p)}.<br>${H ? `(y ${sg(k)})² = ${4 * p}(${eq('x', h)})` : `(${eq('x', h)})² = ${4 * p}(y ${sg(k)})`}`
    }
  });
  gbuild('ellipse', [['h', -4, 4, 1, 1], ['k', -3, 3, 1, -1], ['a', 1, 8, 1, 4], ['b', 1, 6, 1, 2]], v => {
    const { h, k, a, b } = v, H = a >= b, A = Math.max(a, b), B = Math.min(a, b), c = Math.sqrt(A * A - B * B); return {
      svg: `<ellipse cx="${X(h)}" cy="${Y(k)}" rx="${20 * a}" ry="${20 * b}" fill="none" stroke="#2a6fd6" stroke-width="2"/><line x1="${X(h - a)}" y1="${Y(k)}" x2="${X(h + a)}" y2="${Y(k)}" stroke="#e67e22" stroke-dasharray="4"/><line x1="${X(h)}" y1="${Y(k - b)}" x2="${X(h)}" y2="${Y(k + b)}" stroke="#1a7f4b" stroke-dasharray="4"/><circle cx="${X(h)}" cy="${Y(k)}" r="3"/><text x="${X(h) + 4}" y="${Y(k) + 14}">center</text><text x="${X(h + a) - 30}" y="${Y(k) - 4}">x-axis: ${2 * a}</text><text x="${X(h) + 4}" y="${Y(k + b) + 12}">y-axis: ${2 * b}</text>`,
      info: `Center (${h}, ${k}). ${H ? 'Horizontal' : 'Vertical'} major axis (length ${2 * A}), minor axis length ${2 * B}. c = ${+c.toFixed(3)}, e = ${+(c / A).toFixed(3)}.<br>Vertices (${H ? `${h - a}, ${k}) and (${h + a}, ${k}` : `${h}, ${k - A}) and (${h}, ${k + A}`}); co-vertices (${H ? `${h}, ${k - B}) and (${h}, ${k + B}` : `${h - B}, ${k}) and (${h + B}, ${k}`}).<br>${H ? `${eq('x', h)}²/${a * a} + ${eq('y', k)}²/${b * b} = 1` : `${eq('x', h)}²/${a * a} + ${eq('y', k)}²/${b * b} = 1`}`
    }
  })
}
const eq = (v, h) => h === 0 ? v : `(${v} ${h > 0 ? '−' : '+'} ${Math.abs(h)})`, sg = h => h === 0 ? '' : '';
function gbuild(k, specs, fn) {
  const el = $('#g-' + k), v = {}; specs.forEach(s => v[s[0]] = s[4]);
  el.innerHTML = `<svg viewBox="0 0 400 300" width="400"></svg><div class="sliders"></div><div class="note info"></div>`;
  const sv = el.querySelector('.sliders'); specs.forEach(([n, mn, mx, st, d]) => {
    sv.insertAdjacentHTML('beforeend', `<label class="sl">${n}<input type="range" min="${mn}" max="${mx}" step="${st}" value="${d}"><b>${d}</b></label>`);
    const inp = sv.lastChild.querySelector('input'); inp.oninput = () => { v[n] = +inp.value; inp.nextSibling.textContent = inp.value; draw() }
  });
  const grid = `<line x1="0" y1="150" x2="400" y2="150" stroke="#888"/><line x1="200" y1="0" x2="200" y2="300" stroke="#888"/>`;
  function draw() { let r = fn(v); el.querySelector('svg').innerHTML = grid + r.svg; el.querySelector('.info').innerHTML = r.info } draw()
}
// ---- Quiz
let quiz = null;
function quizMenu() {
  main.innerHTML = `<h1>Practice Quiz</h1><div class="grid">${['circle', 'parabola', 'ellipse', 'mixed'].map(k => `<div class="card"><h2>${k[0].toUpperCase() + k.slice(1)} Quiz</h2><p>${k === 'mixed' ? '20 random questions' : (QUIZ.filter(q => q.t === k).length) + ' questions'}${S.scores[k] ? `<br>Best: ${S.scores[k].best}% (${S.scores[k].n} attempts)` : ''}</p><button class="p" data-q="${k}">Start</button></div>`).join('')}</div>`;
  main.querySelectorAll('[data-q]').forEach(b => b.onclick = () => startQuiz(b.dataset.q))
}
function startQuiz(k) { let qs = k === 'mixed' ? [...QUIZ].sort(() => Math.random() - .5).slice(0, 20) : QUIZ.filter(q => q.t === k); quiz = { k, qs, a: Array(qs.length).fill(null), i: 0, done: false }; qrender() }
function qrender() {
  const { qs, a, i } = quiz, q = qs[i];
  main.innerHTML = `<h1>${quiz.k} quiz</h1><div class="bar"><i style="width:${100 * a.filter(x => x !== null).length / qs.length}%"></i></div><p>Question ${i + 1} of ${qs.length} · ${q.lv}</p><div class="card"><b>${q.q}</b>${q.o.map((o, j) => `<button class="opt ${a[i] === j ? 'sel' : ''}" data-o="${j}">${o}</button>`).join('')}</div>
 <div class="qn">${qs.map((_, j) => `<button class="${a[j] !== null ? 'ans' : ''}" data-j="${j}">${j + 1}</button>`).join('')}</div><div class="nav2"><button id="pv" ${i ? '' : 'disabled'}>← Previous</button>${i < qs.length - 1 ? '<button id="nx" class="p">Next →</button>' : '<button id="sub" class="p">Submit</button>'}</div>`;
  main.querySelectorAll('.opt').forEach(b => b.onclick = () => { a[i] = +b.dataset.o; qrender() }); main.querySelectorAll('[data-j]').forEach(b => b.onclick = () => { quiz.i = +b.dataset.j; qrender() });
  $('#pv').onclick = () => { quiz.i--; qrender() }; if ($('#nx')) $('#nx').onclick = () => { quiz.i++; qrender() }; if ($('#sub')) $('#sub').onclick = submit
}
function submit() {
  const un = quiz.a.filter(x => x === null).length; if (!confirm(un ? `${un} question(s) unanswered. Submit anyway?` : 'Submit your answers?')) return;
  const { qs, a, k } = quiz, sc = qs.filter((q, i) => a[i] === q.a).length, p = Math.round(100 * sc / qs.length), d = p >= 90 ? 'Excellent!' : p >= 75 ? 'Very Good!' : p >= 60 ? 'Good. Keep reviewing.' : 'Needs more practice. Review the lessons.';
  const s = S.scores[k] || { best: 0, n: 0 }; S.scores[k] = { best: Math.max(s.best, p), n: s.n + 1 }; S.hist.push(`${k} quiz ${p}%`); save();
  main.innerHTML = `<h1>Results</h1><div class="card"><h2>Score: ${sc}/${qs.length}</h2>Correct: ${sc} · Incorrect: ${qs.length - sc}<br>Percentage: ${p}%<br>Performance: ${d}</div>` + qs.map((q, i) => { const ok = a[i] === q.a; return `<div class="card"><b>${i + 1}. ${q.q}</b><br>Your answer: ${a[i] === null ? '(none)' : q.o[a[i]]}<br>Correct answer: ${q.o[q.a]}<br><span class="${ok ? 'good' : 'badc'}">${ok ? 'Correct' : 'Incorrect'}</span><br>${q.e}</div>` }).join('') + `<div class="nav2"><button class="p" id="re">Retake</button><a href="#/quiz"><button>All quizzes</button></a></div>`; $('#re').onclick = () => startQuiz(k); quiz = null
}
// ---- Global UI
document.addEventListener('click', e => {
  const c = e.target.closest('[data-copy]'); if (c) navigator.clipboard?.writeText(c.dataset.copy.replace(/&nbsp;/g, ' ')).then(() => { c.textContent = 'Copied'; setTimeout(() => c.textContent = 'Copy', 1200) });
  if (e.target.id === 'scrim' || e.target.closest('#side a')) document.body.classList.remove('open')
});
$('#menu').onclick = () => document.body.classList.toggle('open'); $('#search').oninput = e => buildNav(e.target.value.toLowerCase());
$('#theme').onclick = () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.t = S.theme; save() }; document.documentElement.dataset.t = S.theme;
$('#up').onclick = () => scrollTo({ top: 0, behavior: 'smooth' }); addEventListener('scroll', () => $('#up').style.display = scrollY > 400 ? 'block' : 'none');
addEventListener('hashchange', route); route();