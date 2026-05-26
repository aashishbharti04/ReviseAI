/* ReviseAI — client-side study compressor.
   Runs entirely in the browser so it can be hosted on GitHub Pages. */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const $ = (id) => document.getElementById(id);
const STORE_KEY = "reviseai.subjects";
const SETTINGS_KEY = "reviseai.settings";

const state = {
  files: [],        // {name, kind, file}
  text: "",         // extracted text of current subject
  subject: "",
  examDate: "",
  current: null,    // active subject record
};

/* ---------------- Navigation ---------------- */
function show(view) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  $(view).classList.add("active");
  $("navHome").classList.toggle("active", view === "dashboard");
  $("navStudy").classList.toggle("active", view === "study");
}
$("navHome").onclick = () => show("dashboard");
$("navStudy").onclick = () => show("study");

/* ---------------- Settings ---------------- */
function getSettings() {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}; }
  catch { return {}; }
}
function openSettings() {
  const s = getSettings();
  $("aiProvider").value = s.provider || "offline";
  $("apiKey").value = s.key || "";
  $("settingsModal").classList.remove("hidden");
}
$("settingsBtn").onclick = openSettings;
$("closeSettings").onclick = () => $("settingsModal").classList.add("hidden");
$("saveSettings").onclick = () => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({
    provider: $("aiProvider").value,
    key: $("apiKey").value.trim(),
  }));
  $("settingsModal").classList.add("hidden");
};

/* ---------------- Theme ---------------- */
function applyTheme(t) {
  document.body.dataset.theme = t;
  localStorage.setItem("reviseai.theme", t);
  $("themeBtn").textContent = t === "light" ? "🌙" : "🌞";
}
$("themeBtn").onclick = () =>
  applyTheme(document.body.dataset.theme === "light" ? "dark" : "light");

/* ---------------- File handling ---------------- */
const dropzone = $("dropzone");
$("browseBtn").onclick = () => $("fileInput").click();
$("fileInput").onchange = (e) => addFiles(e.target.files);

["dragenter", "dragover"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add("drag"); }));
["dragleave", "drop"].forEach((ev) =>
  dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove("drag"); }));
dropzone.addEventListener("drop", (e) => addFiles(e.dataTransfer.files));

function kindOf(file) {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) return "image";
  return "text";
}
function addFiles(fileList) {
  for (const f of fileList) state.files.push({ name: f.name, kind: kindOf(f), file: f });
  renderFiles();
}
function renderFiles() {
  const el = $("fileList");
  el.innerHTML = "";
  state.files.forEach((f, i) => {
    const icon = f.kind === "pdf" ? "📕" : f.kind === "image" ? "🖼️" : "📄";
    const row = document.createElement("div");
    row.className = "fileitem";
    row.innerHTML = `<span>${icon} ${f.name}</span><button title="Remove">✕</button>`;
    row.querySelector("button").onclick = () => { state.files.splice(i, 1); renderFiles(); };
    el.appendChild(row);
  });
  $("processBtn").disabled = state.files.length === 0;
}

/* ---------------- Extraction ---------------- */
function loader(on, text = "Working…") {
  $("loaderText").textContent = text;
  $("loader").classList.toggle("hidden", !on);
}

async function extractPdf(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let out = "";
  for (let p = 1; p <= pdf.numPages; p++) {
    loader(true, `Reading PDF page ${p}/${pdf.numPages}…`);
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    out += content.items.map((i) => i.str).join(" ") + "\n";
  }
  return out;
}
async function extractImage(file) {
  loader(true, `OCR scanning ${file.name}… (first run downloads the engine)`);
  const { data } = await Tesseract.recognize(file, "eng");
  return data.text;
}
function extractText(file) { return file.text(); }

$("processBtn").onclick = async () => {
  state.subject = $("subjectName").value.trim() || "Untitled subject";
  state.examDate = $("examDate").value;
  $("processStatus").textContent = "Starting…";
  let text = "";
  try {
    for (const f of state.files) {
      if (f.kind === "pdf") text += await extractPdf(f.file) + "\n";
      else if (f.kind === "image") text += await extractImage(f.file) + "\n";
      else text += await extractText(f.file) + "\n";
    }
  } catch (err) {
    loader(false);
    $("processStatus").textContent = "❌ Could not read a file: " + err.message;
    return;
  }
  loader(false);
  text = cleanText(text);
  if (text.split(/\s+/).length < 20) {
    $("processStatus").textContent = "⚠️ Very little text found. If these are photos, OCR may have struggled — try clearer images.";
  } else {
    $("processStatus").textContent = `✅ Extracted ~${text.split(/\s+/).length} words.`;
  }
  state.text = text;
  const record = saveSubject();
  loadSubject(record);
  show("study");
};

function cleanText(t) {
  return t.replace(/ /g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

/* ---------------- Storage ---------------- */
function getSubjects() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}
function setSubjects(list) { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }

// Spaced-repetition intervals (days) after each successful review.
const SR_INTERVALS = [1, 3, 7, 16, 35];

function saveSubject() {
  const list = getSubjects();
  const record = {
    id: Date.now().toString(36),
    subject: state.subject,
    examDate: state.examDate,
    text: state.text,
    created: new Date().toISOString(),
    srStage: 0,
    nextReview: addDays(new Date(), SR_INTERVALS[0]).toISOString(),
    weakTerms: [],
  };
  list.unshift(record);
  setSubjects(list.slice(0, 25)); // keep storage bounded
  renderRecent();
  renderDue();
  return record;
}

function updateSubject(id, patch) {
  const list = getSubjects();
  const i = list.findIndex((r) => r.id === id);
  if (i < 0) return;
  list[i] = { ...list[i], ...patch };
  setSubjects(list);
  if (state.current && state.current.id === id) state.current = list[i];
  renderRecent();
  renderDue();
}

function addDays(date, n) { return new Date(date.getTime() + n * 86400000); }

/* ---------------- Spaced repetition (due for revision) ---------------- */
function renderDue() {
  const el = $("dueSection");
  const now = new Date();
  const due = getSubjects().filter((r) => r.nextReview && new Date(r.nextReview) <= now);
  if (!due.length) { el.innerHTML = ""; return; }
  el.innerHTML = `<div class="due-banner"><h3>🔁 Due for revision today (${due.length})</h3>
    <div class="due-list">${due.map((r) => `
      <div class="due-chip" data-id="${r.id}">
        <span class="dc-title">${escapeHtml(r.subject)}</span>
        <span style="font-size:12px">stage ${r.srStage + 1} · ${r.weakTerms?.length ? r.weakTerms.length + " weak topics" : "on track"}</span>
        <div style="display:flex;gap:6px">
          <button class="open">Study</button>
          <button class="revised">✓ Revised</button>
        </div>
      </div>`).join("")}</div></div>`;
  el.querySelectorAll(".due-chip").forEach((chip) => {
    const id = chip.dataset.id;
    const rec = getSubjects().find((r) => r.id === id);
    chip.querySelector(".open").onclick = () => { loadSubject(rec); show("study"); };
    chip.querySelector(".revised").onclick = () => {
      const stage = Math.min((rec.srStage || 0) + 1, SR_INTERVALS.length - 1);
      updateSubject(id, { srStage: stage, nextReview: addDays(new Date(), SR_INTERVALS[stage]).toISOString() });
    };
  });
}

function renderRecent() {
  const el = $("recentList");
  const list = getSubjects();
  if (!list.length) { el.innerHTML = `<p class="recent-empty">No subjects yet — upload your first notes!</p>`; return; }
  el.innerHTML = "";
  list.forEach((r) => {
    const days = daysLeft(r.examDate);
    const div = document.createElement("div");
    div.className = "recent-item";
    div.innerHTML = `<h4>${escapeHtml(r.subject)}</h4>
      <div class="sub"><span>${new Date(r.created).toLocaleDateString()}</span>
      <span>${days != null ? days + " days to exam" : "no exam date"}</span></div>`;
    div.onclick = () => { loadSubject(r); show("study"); };
    el.appendChild(div);
  });
}

function loadSubject(record) {
  state.current = record;
  state.text = record.text;
  state.subject = record.subject;
  state.examDate = record.examDate;
  $("studyTitle").textContent = record.subject;
  $("studyMeta").textContent = `${record.text.split(/\s+/).length} words · saved ${new Date(record.created).toLocaleString()}`;
  renderCountdown();
  document.querySelectorAll(".tool[data-tool]").forEach((b) => b.classList.remove("active"));
  $("output").innerHTML = `<p class="muted center">Pick a tool above to generate your study materials.</p>`;
}

function daysLeft(date) {
  if (!date) return null;
  const diff = Math.ceil((new Date(date) - new Date()) / 86400000);
  return diff;
}
function renderCountdown() {
  const el = $("countdown");
  const d = daysLeft(state.examDate);
  if (d == null) { el.innerHTML = ""; return; }
  el.classList.toggle("soon", d <= 3);
  el.innerHTML = d < 0
    ? `<span class="num">✓</span><span class="lbl">exam passed</span>`
    : `<span class="num">${d}</span><span class="lbl">days to exam</span>`;
}

/* ---------------- Text analysis engine (offline) ---------------- */
const STOP = new Set(("a an the of to in on at for and or but is are was were be been being this that these those it its as by with from into about above after again against all am any because before below between both did do does doing down during each few further had has have having he her here hers him his how i if me more most my no nor not now of off once only other our out over own same she should so some such than then there they through too under until up very we what when where which while who whom why will you your".split(" ")));

function sentences(text) {
  return text
    .replace(/\n+/g, " ")
    .match(/[^.!?]+[.!?]+|\S[^.!?]*$/g)?.map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 4) || [];
}
function words(text) {
  return (text.toLowerCase().match(/[a-z][a-z'-]+/g) || []).filter((w) => !STOP.has(w) && w.length > 2);
}
function freqMap(text) {
  const map = {};
  for (const w of words(text)) map[w] = (map[w] || 0) + 1;
  return map;
}
function topKeywords(text, n = 18) {
  const map = freqMap(text);
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n).map((e) => e[0]);
}
function rankSentences(text, n) {
  const fm = freqMap(text);
  const sents = sentences(text);
  const scored = sents.map((s, idx) => {
    const ws = words(s);
    const score = ws.reduce((a, w) => a + (fm[w] || 0), 0) / (ws.length + 1);
    return { s, idx, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, n)
    .sort((a, b) => a.idx - b.idx).map((x) => x.s);
}
function findFormulas(text) {
  return text.split(/\n|(?<=[.!?])\s/)
    .filter((l) => /[=≈≤≥±×÷√∑∫πΩλμ]|(\b\d+\s*[\/^]\s*\d+)/.test(l) && l.length < 160)
    .map((l) => l.trim()).filter(Boolean).slice(0, 12);
}
function findDefinitions(text) {
  const out = [];
  for (const s of sentences(text)) {
    const m = s.match(/^(.{2,50}?)\s+(?:is|are|refers to|means|is defined as|is called)\s+(.{8,})$/i);
    if (m) out.push({ term: m[1].replace(/^(the|a|an)\s+/i, "").trim(), def: s.trim() });
    if (out.length >= 14) break;
  }
  return out;
}

/* ---------------- AI provider (optional) ---------------- */
async function aiGenerate(prompt) {
  const s = getSettings();
  if (s.provider === "gemini" && s.key) return geminiCall(prompt, s.key);
  if (s.provider === "openai" && s.key) return openaiCall(prompt, s.key);
  return null; // offline
}
async function geminiCall(prompt, key) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error("Gemini API error " + res.status);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
async function openaiCall(prompt, key) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "user", content: prompt }], temperature: 0.4 }),
  });
  if (!res.ok) throw new Error("OpenAI API error " + res.status);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
function truncForAI(text, max = 12000) {
  return text.length > max ? text.slice(0, max) + "\n...[truncated]" : text;
}

/* ---------------- Tools ---------------- */
const out = $("output");
document.querySelectorAll(".tool[data-tool]").forEach((btn) => {
  btn.onclick = async () => {
    if (!state.text) { out.innerHTML = `<p class="muted center">Upload and process notes first.</p>`; return; }
    stopVoice();
    document.querySelectorAll(".tool[data-tool]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const tool = btn.dataset.tool;
    try {
      if (tool === "summary") await renderSummary();
      else if (tool === "flashcards") await renderFlashcards();
      else if (tool === "quiz") renderQuiz();
      else if (tool === "mindmap") renderMindmap();
      else if (tool === "explain") await renderExplain();
      else if (tool === "voice") renderVoice();
      else if (tool === "lastnight") await renderLastNight();
      else if (tool === "share") renderShare();
      else if (tool === "source") renderSource();
    } catch (err) {
      loader(false);
      out.innerHTML = `<p class="muted">⚠️ ${escapeHtml(err.message)}. Falling back to offline mode usually fixes this (check ⚙️ settings).</p>`;
    }
  };
});

async function renderSummary() {
  const ai = getSettings().provider !== "offline";
  if (ai) {
    loader(true, "Asking AI to compress your notes…");
    const prompt = `You are an exam coach. Compress the following study notes into concise revision notes.
Return: (1) 8-12 key bullet points, (2) important definitions, (3) any formulas.
Use clear short lines. Notes:\n\n${truncForAI(state.text)}`;
    const res = await aiGenerate(prompt);
    loader(false);
    if (res) { out.innerHTML = `<h3>📝 Compressed Notes (AI)</h3><div>${mdLite(res)}</div>`; return; }
  }
  // offline
  const points = rankSentences(state.text, 10);
  const defs = findDefinitions(state.text);
  const formulas = findFormulas(state.text);
  const keys = topKeywords(state.text, 16);
  let html = `<h3>📝 Compressed Notes</h3>`;
  html += `<div class="section-block"><h4>Key points</h4><ul>${points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul></div>`;
  if (defs.length) html += `<div class="section-block"><h4>Definitions</h4><ul>${defs.map((d) => `<li><strong>${escapeHtml(d.term)}</strong> — ${escapeHtml(d.def)}</li>`).join("")}</ul></div>`;
  if (formulas.length) html += `<div class="section-block"><h4>Formulas & key lines</h4>${formulas.map((f) => `<div class="formula">${escapeHtml(f)}</div>`).join("")}</div>`;
  html += `<div class="section-block"><h4>Important terms</h4>${keys.map((k) => `<span class="pill">${escapeHtml(k)}</span>`).join("")}</div>`;
  out.innerHTML = html;
}

async function renderFlashcards() {
  const cards = buildFlashcards();
  if (!cards.length) { out.innerHTML = `<p class="muted center">Not enough structured content to build flashcards. Try the Compress tool.</p>`; return; }
  out.innerHTML = `<h3>🃏 Flashcards <span class="muted">(tap to flip)</span></h3>
    <div class="flash-grid">${cards.map((c, i) => `
      <div class="flashcard" data-i="${i}">
        <div class="flash-inner">
          <div class="flash-face flash-front"><span class="flash-tag">Q</span>${escapeHtml(c.q)}</div>
          <div class="flash-face flash-back"><span class="flash-tag">A</span>${escapeHtml(c.a)}</div>
        </div>
      </div>`).join("")}</div>`;
  out.querySelectorAll(".flashcard").forEach((el) => el.onclick = () => el.classList.toggle("flipped"));
}
function buildFlashcards() {
  const cards = [];
  for (const d of findDefinitions(state.text)) cards.push({ q: `What is ${d.term}?`, a: d.def });
  const keys = topKeywords(state.text, 14);
  const sents = sentences(state.text);
  for (const k of keys) {
    if (cards.length >= 16) break;
    const s = sents.find((x) => new RegExp(`\\b${k}\\b`, "i").test(x));
    if (s && !cards.some((c) => c.a === s)) cards.push({ q: `Explain the term "${k}".`, a: s });
  }
  return cards.slice(0, 16);
}

function renderQuiz() {
  const qs = buildQuiz();
  if (!qs.length) { out.innerHTML = `<p class="muted center">Not enough content to build a quiz.</p>`; return; }
  let html = weaknessBanner();
  html += `<h3>❓ Quiz <span class="muted">(${qs.length} questions)</span></h3><div id="quizScore" class="quiz-score"></div>`;
  qs.forEach((q, qi) => {
    html += `<div class="quiz-q"><div class="qtext">${qi + 1}. ${escapeHtml(q.question)}</div>`;
    q.options.forEach((opt, oi) => {
      html += `<button class="quiz-opt" data-q="${qi}" data-correct="${oi === q.answer}">${escapeHtml(opt)}</button>`;
    });
    html += `</div>`;
  });
  out.innerHTML = html;
  let answered = 0, correct = 0;
  const wrongTerms = new Set();
  out.querySelectorAll(".quiz-opt").forEach((b) => {
    b.onclick = () => {
      const qi = b.dataset.q;
      const group = out.querySelectorAll(`.quiz-opt[data-q="${qi}"]`);
      if ([...group].some((x) => x.classList.contains("correct") || x.classList.contains("wrong"))) return;
      const isCorrect = b.dataset.correct === "true";
      group.forEach((x) => { if (x.dataset.correct === "true") x.classList.add("correct"); });
      if (!isCorrect) { b.classList.add("wrong"); if (qs[qi].term) wrongTerms.add(qs[qi].term); }
      answered++; if (isCorrect) correct++;
      $("quizScore").textContent = `Score: ${correct} / ${answered}`;
      // Persist weak topics once the whole quiz is answered.
      if (answered === qs.length && state.current) {
        const prev = new Set(state.current.weakTerms || []);
        wrongTerms.forEach((t) => prev.add(t));
        updateSubject(state.current.id, { weakTerms: [...prev].slice(0, 20) });
        $("quizScore").textContent += wrongTerms.size
          ? ` · Saved ${wrongTerms.size} weak topic(s) for revision`
          : " · 🎉 No weak topics!";
      }
    };
  });
}
function buildQuiz() {
  const keys = topKeywords(state.text, 24);
  const quiz = [];
  for (const s of rankSentences(state.text, 18)) {
    if (quiz.length >= 8) break;
    const target = keys.find((k) => new RegExp(`\\b${k}\\b`, "i").test(s));
    if (!target) continue;
    const distractors = keys.filter((k) => k !== target).sort(() => Math.random() - 0.5).slice(0, 3);
    if (distractors.length < 3) continue;
    const question = s.replace(new RegExp(`\\b${target}\\b`, "i"), "_____");
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);
    quiz.push({ question: "Fill the blank: " + question, options, answer: options.indexOf(target), term: target });
  }
  return quiz;
}
function weaknessBanner() {
  const weak = state.current?.weakTerms || [];
  if (!weak.length) return "";
  return `<div class="weak-box"><h4>⚠️ Your weak topics (from past quizzes)</h4>
    <div>${weak.map((t) => `<span class="pill">${escapeHtml(t)}</span>`).join("")}</div></div>`;
}

async function renderLastNight() {
  const ai = getSettings().provider !== "offline";
  let body = "";
  if (ai) {
    loader(true, "Building your last-night cheat sheet…");
    const prompt = `Create an emergency "night before the exam" cheat sheet from these notes.
Include: the 8 most important concepts (one line each), all key formulas, and the top 10 most probable exam questions.
Be extremely concise. Notes:\n\n${truncForAI(state.text)}`;
    const res = await aiGenerate(prompt);
    loader(false);
    if (res) body = mdLite(res);
  }
  if (!body) {
    const must = rankSentences(state.text, 8);
    const formulas = findFormulas(state.text);
    const probable = buildProbableQuestions();
    body = `<div class="section-block"><h4>🔑 Must-know concepts</h4><ul>${must.map((m) => `<li>${escapeHtml(m)}</li>`).join("")}</ul></div>`;
    if (formulas.length) body += `<div class="section-block"><h4>🧮 Formulas only</h4>${formulas.map((f) => `<div class="formula">${escapeHtml(f)}</div>`).join("")}</div>`;
    body += `<div class="section-block"><h4>🎯 Top probable questions</h4><ul>${probable.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul></div>`;
  }
  out.innerHTML = `<div class="ln-banner"><h3>🌙 Last-Night Revision Mode</h3><p class="muted">Everything essential, nothing else.</p></div>${body}`;
}
function buildProbableQuestions() {
  const defs = findDefinitions(state.text);
  const keys = topKeywords(state.text, 12);
  const qs = [];
  defs.slice(0, 6).forEach((d) => qs.push(`Define / explain: ${d.term}.`));
  keys.forEach((k) => { if (qs.length < 10) qs.push(`Write short notes on "${k}".`); });
  return qs.slice(0, 10);
}

/* ---------------- Mindmap (SVG radial) ---------------- */
function renderMindmap() {
  const subject = state.subject || "Notes";
  const keys = topKeywords(state.text, 7);
  const sents = sentences(state.text);
  if (!keys.length) { out.innerHTML = `<p class="muted center">Not enough content to build a mindmap.</p>`; return; }
  const W = 820, H = 600, cx = W / 2, cy = H / 2, R = 160, R2 = 270;
  const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  let lines = "", nodes = "";
  keys.forEach((k, i) => {
    const a = (i / keys.length) * Math.PI * 2 - Math.PI / 2;
    const bx = cx + R * Math.cos(a), by = cy + R * Math.sin(a);
    lines += `<line class="mm-line" x1="${cx}" y1="${cy}" x2="${bx}" y2="${by}" />`;
    const snip = sents.find((s) => new RegExp(`\\b${k}\\b`, "i").test(s));
    if (snip) {
      const lx = cx + R2 * Math.cos(a), ly = cy + R2 * Math.sin(a);
      lines += `<line class="mm-line" x1="${bx}" y1="${by}" x2="${lx}" y2="${ly}" />`;
      nodes += mmNode(lx, ly, trunc(snip.split(/\s+/).slice(0, 5).join(" "), 24), "mm-leaf", 150, 40, snip);
    }
    nodes += mmNode(bx, by, trunc(k, 16), "mm-branch", 120, 38);
  });
  nodes += mmNode(cx, cy, trunc(subject, 18), "mm-center", 150, 46);
  out.innerHTML = `<h3>🧠 Mindmap</h3><div class="mindmap-wrap">
    <svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${lines}${nodes}</svg></div>
    <p class="muted center">Auto-built from your most important topics. Hover a node for the full text.</p>`;
}
function mmNode(x, y, label, cls, w, h, title) {
  return `<g class="mm-node ${cls}" transform="translate(${x},${y})">
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="10" />
    <text x="0" y="4" text-anchor="middle">${escapeHtml(label)}</text>
    <title>${escapeHtml(title || label)}</title></g>`;
}

/* ---------------- Explain Simply ---------------- */
let explainMode = "beginner";
const EXPLAIN_MODES = {
  beginner: "Explain like I'm a beginner, in plain simple English with short sentences",
  kid: "Explain like I'm 10 years old, using fun simple analogies",
  hindi: "Explain in simple Hindi (Devanagari script)",
  teacher: "Explain like an exam teacher giving clear, structured points students can write in an exam",
};
async function renderExplain() {
  out.innerHTML = `<h3>✨ Explain Simply</h3>
    <div class="mode-row">
      ${Object.keys(EXPLAIN_MODES).map((m) => `<button class="mode-btn ${m === explainMode ? "active" : ""}" data-mode="${m}">${{ beginner: "👶 Beginner", kid: "🧒 Kid Mode", hindi: "🇮🇳 Hindi", teacher: "👩‍🏫 Teacher" }[m]}</button>`).join("")}
    </div><div id="explainBody"></div>`;
  out.querySelectorAll(".mode-btn").forEach((b) => b.onclick = () => {
    explainMode = b.dataset.mode;
    out.querySelectorAll(".mode-btn").forEach((x) => x.classList.toggle("active", x === b));
    runExplain();
  });
  await runExplain();
}
async function runExplain() {
  const body = $("explainBody");
  const aiOn = getSettings().provider !== "offline";
  if (aiOn) {
    loader(true, "Simplifying with AI…");
    const prompt = `${EXPLAIN_MODES[explainMode]}. Summarize and explain the key ideas from these notes so they are easy to understand and remember for an exam. Use short bullet points.\n\n${truncForAI(state.text)}`;
    try {
      const res = await aiGenerate(prompt);
      loader(false);
      if (res) { body.innerHTML = mdLite(res); return; }
    } catch (e) { loader(false); }
  }
  // Offline fallback
  const points = rankSentences(state.text, 8);
  const defs = findDefinitions(state.text);
  let html = "";
  if (explainMode === "hindi") {
    html += `<p class="muted">ℹ️ Offline mode can't translate to Hindi. Add a free Gemini key in ⚙️ Settings for true Hindi explanations. Showing simplified key points for now:</p>`;
  }
  html += `<ul>${points.map((p) => `<li>${escapeHtml(simplify(p))}</li>`).join("")}</ul>`;
  if (defs.length) html += `<div class="section-block"><h4>Glossary</h4><ul>${defs.map((d) => `<li><strong>${escapeHtml(d.term)}</strong>: ${escapeHtml(d.def)}</li>`).join("")}</ul></div>`;
  body.innerHTML = html;
}
function simplify(s) {
  // Offline "simplify": keep the first clause, trim filler.
  return s.split(/[,;:]/)[0].replace(/\b(therefore|however|moreover|consequently|furthermore)\b/gi, "").trim() + (s.includes(",") ? "." : "");
}

/* ---------------- Voice revision (Web Speech API) ---------------- */
const voiceState = { sentences: [], idx: 0, playing: false, rate: 1 };
function stopVoice() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  voiceState.playing = false;
}
function buildRevisionText() {
  const pts = rankSentences(state.text, 14);
  const defs = findDefinitions(state.text).map((d) => d.def);
  return [...pts, ...defs];
}
function renderVoice() {
  if (!("speechSynthesis" in window)) {
    out.innerHTML = `<p class="muted center">Your browser doesn't support speech synthesis.</p>`; return;
  }
  voiceState.sentences = buildRevisionText();
  voiceState.idx = 0;
  out.innerHTML = `<h3>🔊 Voice Revision</h3>
    <div class="voice-panel">
      <button class="btn primary" id="vPlay">▶️ Play</button>
      <button class="btn ghost" id="vPause">⏸ Pause</button>
      <button class="btn ghost" id="vResume">⏵ Resume</button>
      <button class="btn ghost" id="vStop">⏹ Stop</button>
      <label>Speed <input type="range" id="vRate" min="0.6" max="1.6" step="0.1" value="1"></label>
    </div>
    <div class="voice-text">${voiceState.sentences.map((s, i) => `<span id="v-s-${i}">${escapeHtml(s)} </span>`).join("")}</div>
    <p class="muted">Great for revising while walking, in the gym, or travelling. 🎧</p>`;
  $("vRate").oninput = (e) => { voiceState.rate = parseFloat(e.target.value); };
  $("vPlay").onclick = () => speakFrom(0);
  $("vPause").onclick = () => window.speechSynthesis.pause();
  $("vResume").onclick = () => window.speechSynthesis.resume();
  $("vStop").onclick = () => { stopVoice(); clearVoiceHighlight(); };
}
function speakFrom(i) {
  window.speechSynthesis.cancel();
  voiceState.idx = i; voiceState.playing = true;
  speakNext();
}
function speakNext() {
  if (!voiceState.playing || voiceState.idx >= voiceState.sentences.length) {
    voiceState.playing = false; clearVoiceHighlight(); return;
  }
  const u = new SpeechSynthesisUtterance(voiceState.sentences[voiceState.idx]);
  u.rate = voiceState.rate;
  u.onstart = () => highlightVoice(voiceState.idx);
  u.onend = () => { if (voiceState.playing) { voiceState.idx++; speakNext(); } };
  window.speechSynthesis.speak(u);
}
function highlightVoice(i) {
  clearVoiceHighlight();
  const el = $(`v-s-${i}`);
  if (el) { el.classList.add("speaking"); el.scrollIntoView({ block: "center", behavior: "smooth" }); }
}
function clearVoiceHighlight() {
  document.querySelectorAll(".voice-text .speaking").forEach((e) => e.classList.remove("speaking"));
}

/* ---------------- Shareable revision card (PNG) ---------------- */
function renderShare() {
  const points = rankSentences(state.text, 12).filter((p) => p.length < 220);
  if (!points.length) { out.innerHTML = `<p class="muted center">Not enough content for a share card.</p>`; return; }
  let idx = 0;
  out.innerHTML = `<h3>📸 Shareable Revision Card</h3><div class="share-wrap">
    <canvas id="shareCanvas" width="1080" height="1080"></canvas>
    <div class="share-controls">
      <button class="btn ghost" id="prevCard">‹ Prev</button>
      <button class="btn ghost" id="nextCard">Next ›</button>
      <button class="btn primary" id="dlCard">⬇️ Download PNG</button>
    </div>
    <p class="muted">Post it to your story — instant revision + free marketing. 🚀</p></div>`;
  const draw = () => drawCard(points[idx]);
  $("prevCard").onclick = () => { idx = (idx - 1 + points.length) % points.length; draw(); };
  $("nextCard").onclick = () => { idx = (idx + 1) % points.length; draw(); };
  $("dlCard").onclick = () => {
    const a = document.createElement("a");
    a.download = `ReviseAI_card_${idx + 1}.png`;
    a.href = $("shareCanvas").toDataURL("image/png");
    a.click();
  };
  draw();
}
function drawCard(point) {
  const c = $("shareCanvas"), ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 1080, 1080);
  g.addColorStop(0, "#6c5ce7"); g.addColorStop(1, "#00b3a4");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1080);
  ctx.fillStyle = "rgba(255,255,255,0.10)"; roundRect(ctx, 70, 70, 940, 940, 40); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 46px Segoe UI, sans-serif";
  ctx.fillText("📚 ReviseAI", 110, 170);
  ctx.font = "600 34px Segoe UI, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillText(wrapTrim(state.subject || "Revision", 32), 110, 240);
  // main point, wrapped + vertically centered
  ctx.font = "bold 54px Segoe UI, sans-serif"; ctx.fillStyle = "#fff";
  const lines = wrapText(ctx, point, 860);
  const startY = 540 - (lines.length - 1) * 35;
  lines.forEach((ln, i) => ctx.fillText(ln, 110, startY + i * 70));
  ctx.font = "500 28px Segoe UI, sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText("Made with ReviseAI · revise smarter", 110, 960);
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function wrapText(ctx, text, maxW) {
  const words = text.split(/\s+/), lines = []; let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines.slice(0, 9);
}
function wrapTrim(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }

function renderSource() {
  out.innerHTML = `<h3>📄 Extracted Source Text</h3><pre style="white-space:pre-wrap;font-size:13px;line-height:1.5;color:var(--muted)">${escapeHtml(state.text)}</pre>`;
}

/* ---------------- PDF export ---------------- */
$("downloadBtn").onclick = () => {
  if (!state.text) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48, width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;
  const line = (txt, size = 11, bold = false, color = [30, 30, 30]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size); doc.setTextColor(...color);
    for (const l of doc.splitTextToSize(txt, width)) {
      if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin; }
      doc.text(l, margin, y); y += size + 5;
    }
  };
  line("ReviseAI — Revision Sheet", 18, true, [108, 92, 231]); y += 4;
  line(state.subject, 13, true); y += 6;

  line("Key Points", 14, true, [108, 92, 231]);
  rankSentences(state.text, 10).forEach((p) => line("• " + p));
  y += 8;
  const defs = findDefinitions(state.text);
  if (defs.length) { line("Definitions", 14, true, [108, 92, 231]); defs.forEach((d) => line("• " + d.def)); y += 8; }
  const formulas = findFormulas(state.text);
  if (formulas.length) { line("Formulas", 14, true, [108, 92, 231]); formulas.forEach((f) => line(f, 11, false, [0, 120, 100])); y += 8; }
  line("Probable Questions", 14, true, [108, 92, 231]);
  buildProbableQuestions().forEach((q, i) => line(`${i + 1}. ${q}`));

  doc.save(`${state.subject.replace(/[^\w]+/g, "_")}_ReviseAI.pdf`);
};

/* ---------------- Helpers ---------------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function mdLite(md) {
  return escapeHtml(md)
    .replace(/^### (.*)$/gm, "<h4>$1</h4>")
    .replace(/^## (.*)$/gm, "<h4>$1</h4>")
    .replace(/^\* (.*)$/gm, "<li>$1</li>")
    .replace(/^- (.*)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.*)$/gm, "<li>$1</li>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n{2,}/g, "<br><br>");
}

/* ---------------- Init ---------------- */
applyTheme(localStorage.getItem("reviseai.theme") || "dark");
renderRecent();
renderDue();
renderFiles();
