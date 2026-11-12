import { REGIONS, SITES, WANDERING, CHARS, LORE } from "./data.js";
import { BIOS } from "./bios.js";
import { BOOKS } from "./books.js";
import { buildMap, buildSites, GEO, POS, W, H, regionPts } from "./map.js";
import { planisphere } from "./planisphere.js";
import { drawSection, SEC } from "./sections.js";
import { card, GROUP_LABEL, frameKey } from "./frames.js";
import { noiseURL, esc, smoothClosed, bbox, rng } from "./util.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const RC = Object.fromEntries(REGIONS.map((r) => [r.id, r]));

// ── 데이터 다듬기 ──
const EXTRA = {
  vigilia: { region: "concordia", icon: "eye", mapName: "사역마 쉼터" },
  limen: { region: "concordia", icon: "rift", mapName: "리멘 등대" },
  conventus: { region: "lunatica", icon: "cauldron", mapName: "이름 없는 교차로" },
};
const ALL_SITES = [...SITES, ...WANDERING.map((w) => ({ ...w, ...(EXTRA[w.id] || {}) }))];
const SITE = Object.fromEntries(ALL_SITES.map((s) => [s.id, s]));
SITE["glass-tower"].mapName = "???";
for (const c of Object.values(CHARS)) c.regionLatin = c.region ? RC[c.region].latin : "";
const WHERE = {};
for (const s of ALL_SITES) for (const n of new Set(s.npcs)) (WHERE[n] ||= []).push(s.id);

// 스포일러 열람 기억 (세션 동안)
const opened = new Set();
try { JSON.parse(sessionStorage.getItem("peregrina-open") || "[]").forEach((k) => opened.add(k)); } catch {}
const remember = (k) => { opened.add(k); try { sessionStorage.setItem("peregrina-open", JSON.stringify([...opened])); } catch {} };

document.documentElement.style.setProperty("--noise", `url(${noiseURL()})`);
$("#noise").style.backgroundImage = `url(${noiseURL()})`;

// ───────── 여는 화면 ─────────
function doorSVG(side) {
  const flip = side === "right" ? `transform="translate(200,0) scale(-1,1)"` : "";
  let studs = "";
  for (let y = 120; y < 760; y += 46) studs += `<circle cx="22" cy="${y}" r="4" fill="#b08a48" stroke="#1a120c" stroke-width="1.2"/><circle cx="182" cy="${y}" r="4" fill="#b08a48" stroke="#1a120c" stroke-width="1.2"/>`;
  return `<svg viewBox="0 0 200 800" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><g ${flip}>
    <path d="M0,800 V250 Q0,30 200,0 V800Z" fill="#3a2418" stroke="#120a06" stroke-width="5"/>
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M${40 * i + 8},800 V${i ? 230 - i * 40 : 260}" stroke="#2a180f" stroke-width="2"/>`).join("")}
    <path d="M30,770 V300 Q30,120 175,70 V770Z" fill="none" stroke="#1a100a" stroke-width="3"/>
    <path d="M44,520 H170 V740 H44Z M44,300 Q50,170 170,120 V480 H44Z" fill="#2f1d13" stroke="#b08a48" stroke-width="2"/>
    <path d="M0,330 H200 M0,600 H200" stroke="#6a5030" stroke-width="12"/><path d="M0,330 H200 M0,600 H200" stroke="#1a120c" stroke-width="2" stroke-dasharray="1 22"/>
    ${[330, 600].map((y) => `<path d="M150,${y - 16} q40,16 0,32 q-14,-16 0,-32Z" fill="#6a5030" stroke="#1a120c" stroke-width="1.6"/>`).join("")}
    ${studs}
    <circle cx="178" cy="450" r="22" fill="none" stroke="#c8a050" stroke-width="5"/><circle cx="178" cy="428" r="8" fill="#c8a050" stroke="#1a120c" stroke-width="1.6"/>
    <path d="M107,180 l6,16 l16,6 l-16,6 l-6,16 l-6,-16 l-16,-6 l16,-6Z" fill="#c8a050" stroke="#1a120c" stroke-width="1.2"/>
  </g></svg>`;
}
function archSVG() {
  let s = `<svg viewBox="0 0 520 820" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">`;
  s += `<path d="M0,820 V300 Q0,40 260,0 Q520,40 520,300 V820 H460 V310 Q460,110 260,74 Q60,110 60,310 V820Z" fill="#1b1424" stroke="#c8a050" stroke-width="3"/>`;
  s += `<path d="M30,820 V305 Q30,72 260,36 Q490,72 490,305 V820" fill="none" stroke="#c8a050" stroke-width="1.2" stroke-dasharray="2 8"/>`;
  for (let i = 0; i < 9; i++) { const y = 360 + i * 50; s += `<path d="M8,${y} h44 M468,${y} h44" stroke="#c8a050" stroke-width="1"/>`; }
  s += `<circle cx="260" cy="40" r="30" fill="#141a33" stroke="#c8a050" stroke-width="3"/><path d="M260,16 l6,18 l18,6 l-18,6 l-6,18 l-6,-18 l-18,-6 l18,-6Z" fill="#ead48f"/>`;
  return s + `</svg>`;
}
$(".op-door.left").innerHTML = doorSVG("left");
$(".op-door.right").innerHTML = doorSVG("right");
$(".op-frame").innerHTML = archSVG();

let entered = false;
function enter() {
  if (entered) return;
  entered = true;
  const op = $("#opening");
  op.classList.add("open");
  setTimeout(() => op.classList.add("open2"), 1300);
  setTimeout(() => { op.classList.add("gone"); $("#world").classList.add("on", "intro"); fit(false); }, 1700);
  setTimeout(() => { op.remove(); $("#world").classList.remove("intro"); }, 3300);
}
$(".op-enter").addEventListener("click", enter);
$("#opening").addEventListener("click", (e) => { if (e.target.closest(".op-arch")) enter(); });
document.addEventListener("keydown", (e) => { if (!entered && (e.key === "Enter" || e.key === " ")) enter(); }, { once: false });

// ───────── 세계 지도 ─────────
$("#sky").innerHTML = planisphere();
const map = $("#map");
const parts = buildMap(REGIONS);
const letterX = 2770, letterY = 590;
map.innerHTML = parts.defs +
  `<g id="sea">${parts.sea}</g><g id="land">${parts.land}</g><g id="labels">${parts.labels}</g>` +
  `<g id="letter" class="letter" transform="translate(${letterX},${letterY})" role="button" tabindex="0" aria-label="위치 불명의 서신"><g>
     <path d="M-70,-46 h140 v92 h-140z" fill="#f4e9cd" stroke="#2c2015" stroke-width="2.4" transform="rotate(-8)"/>
     <path d="M-70,-46 l70,52 l70,-52" fill="none" stroke="#2c2015" stroke-width="1.8" transform="rotate(-8)"/>
     <circle cx="0" cy="8" r="20" fill="#a4372f" stroke="#2c2015" stroke-width="2"/><path d="M0,-6 v26 M-8,2 h16" stroke="#f4e9cd" stroke-width="2.4"/>
     <path d="M-6,-60 l12,0 l-6,20z" fill="#888" stroke="#2c2015" stroke-width="1.4"/>
     <text y="76" text-anchor="middle" font-family="Gowun Batang, serif" font-weight="700" font-size="20" fill="#2c2015">위치 불명의 서신</text></g></g>` +
  `<g id="frame">${parts.frame}</g>` +
  `<rect id="dim" width="${W}" height="${H}" fill="#0d0912" opacity="0"/>` +
  `<g id="lift"></g><g id="sitesLayer">${buildSites(ALL_SITES.filter((s) => s.region), REGIONS)}</g><g id="hits"></g>`;
// 대륙 판정 영역
$("#hits").innerHTML = REGIONS.map((r) => `<path class="hit" data-id="${r.id}" d="${smoothClosed(regionPts[r.id])}" tabindex="0" role="button" aria-label="${esc(r.name)}"/>`).join("");
// 지도 위로 사이트 레이어를 올리되, 대륙 판정보다는 아래에 두면 표식이 클릭되지 않으므로 판정을 아래로
$("#hits").after($("#sitesLayer"));

// ── 이동·확대 ──
const stage = $("#stage"), sheet = $("#sheet");
const view = { x: 0, y: 0, s: 0.4 };
let minS = 0.2, maxS = 3;
function apply(anim) {
  sheet.classList.toggle("anim", !!anim);
  sheet.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.s})`;
  const sky = $("#sky svg");
  if (sky) sky.style.transform = `translate(${(view.x - innerWidth / 2) * 0.04}px, ${(view.y - innerHeight / 2) * 0.04}px)`;
}
function clampView() {
  const w = W * view.s, h = H * view.s, m = 120;
  view.x = Math.min(innerWidth - m, Math.max(m - w, view.x));
  view.y = Math.min(innerHeight - m, Math.max(m - h, view.y));
}
function fit(anim = true) {
  const s = Math.min((innerWidth * 0.92) / W, (innerHeight * 0.84) / H);
  minS = s * 0.7;
  maxS = Math.max(3, s * 8);
  view.s = s;
  view.x = (innerWidth - W * s) / 2;
  view.y = (innerHeight - H * s) / 2 + 14;
  apply(anim);
}
function zoomAt(px, py, k, anim) {
  const ns = Math.min(maxS, Math.max(minS, view.s * k));
  view.x = px - (px - view.x) * (ns / view.s);
  view.y = py - (py - view.y) * (ns / view.s);
  view.s = ns;
  clampView();
  apply(anim);
}
stage.addEventListener("wheel", (e) => { e.preventDefault(); zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0015), false); }, { passive: false });
const pointers = new Map();
let dragMoved = 0, pinch = null, last = null;
stage.addEventListener("pointerdown", (e) => {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 1) { last = { x: e.clientX, y: e.clientY }; dragMoved = 0; }
  if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: view.s }; }
});
addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2 && pinch) {
    const [a, b] = [...pointers.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, (pinch.s * (d / pinch.d)) / view.s, false);
    dragMoved = 99;
    return;
  }
  if (!last) return;
  const dx = e.clientX - last.x, dy = e.clientY - last.y;
  dragMoved += Math.abs(dx) + Math.abs(dy);
  if (dragMoved > 6) {
    stage.classList.add("drag");
    if (stage.hasPointerCapture && !stage.hasPointerCapture(e.pointerId)) try { stage.setPointerCapture(e.pointerId); } catch {}
    view.x += dx; view.y += dy; clampView(); apply(false);
    hideTip();
  }
  last = { x: e.clientX, y: e.clientY };
});
const endPtr = (e) => { pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null; if (!pointers.size) { last = null; stage.classList.remove("drag"); } };
addEventListener("pointerup", endPtr);
addEventListener("pointercancel", endPtr);
stage.addEventListener("click", (e) => { if (dragMoved > 6) { e.stopPropagation(); e.preventDefault(); } }, true);
$("#zoomctl").addEventListener("click", (e) => {
  const z = e.target.closest("button")?.dataset.z;
  if (z === "in") zoomAt(innerWidth / 2, innerHeight / 2, 1.5, true);
  if (z === "out") zoomAt(innerWidth / 2, innerHeight / 2, 1 / 1.5, true);
  if (z === "fit") focused ? focusRegion(focused) : fit(true);
});
addEventListener("resize", () => { focused ? focusRegion(focused, false) : fit(false); });

// ── 툴팁 ──
const tip = $("#tip");
function showTip(html, e) { tip.innerHTML = html; tip.hidden = false; moveTip(e); }
function moveTip(e) { if (tip.hidden) return; const x = Math.min(e.clientX + 18, innerWidth - 280), y = Math.min(e.clientY + 18, innerHeight - 90); tip.style.left = x + "px"; tip.style.top = y + "px"; }
function hideTip() { tip.hidden = true; }
map.addEventListener("pointermove", moveTip);

// ── 대륙 강조 (떠오름) ──
let hot = null, focused = null;
const centerOf = (id) => [GEO[id].cx, GEO[id].cy];
function lift(id) {
  const [cx, cy] = centerOf(id);
  const d = smoothClosed(regionPts[id]);
  $("#lift").innerHTML = `<path class="lift-shadow" d="${d}" fill="#07040a" opacity=".55" transform="translate(14,22)"/>` +
    `<g class="lift-land" style="transform-origin:${cx}px ${cy}px"><use href="#reg-${id}"/><use href="#lbl-${id}"/></g>`;
  $$("#sitesLayer .sites").forEach((g) => {
    g.classList.toggle("dim", g.dataset.region !== id);
    g.classList.remove("up");
    g.style.transformOrigin = `${cx}px ${cy}px`;
  });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $("#lift .lift-land")?.classList.add("up");
    $("#sites-" + id)?.classList.add("up");
  }));
  $("#dim").setAttribute("opacity", focused ? ".66" : ".55");
}
function unlift() {
  $("#lift").innerHTML = "";
  $("#dim").setAttribute("opacity", "0");
  $$("#sitesLayer .sites").forEach((g) => g.classList.remove("dim", "up", "active"));
}
$("#hits").addEventListener("pointerover", (e) => {
  const id = e.target.dataset?.id;
  if (!id || focused || pointers.size) return;
  if (hot !== id) { hot = id; lift(id); }
  const r = RC[id];
  showTip(`<b>${esc(r.name)}</b>${r.sym} ${r.attr} · 눌러서 펼쳐 보기`, e);
});
$("#hits").addEventListener("pointerout", (e) => {
  if (focused) return;
  const to = e.relatedTarget;
  if (to && to.closest && (to.closest("#hits") || to.closest("#sitesLayer"))) return;
  hot = null; unlift(); hideTip();
});
$("#hits").addEventListener("click", (e) => { const id = e.target.dataset?.id; if (id && id !== focused) focusRegion(id); });
$("#hits").addEventListener("keydown", (e) => { if (e.key === "Enter") { const id = e.target.dataset?.id; if (id) focusRegion(id); } });

// 기관 표식
$("#sitesLayer").addEventListener("pointerover", (e) => {
  const g = e.target.closest(".site");
  if (!g) return;
  const s = SITE[g.dataset.site];
  if (s.kind === "hidden" && !opened.has("site:" + s.id)) showTip(`<span class="warn">⚠ 스포일러 주의</span><br>이야기의 비밀과 이어진 장소예요. ${focused ? "누르면 열람 여부를 물어봐요." : ""}`, e);
  else if (focused) showTip(`<b>${esc(s.mapName || s.name)}</b>${s.npcs.length}명이 머무는 곳 · 눌러서 도면 보기`, e);
});
$("#sitesLayer").addEventListener("pointerout", (e) => { if (!e.relatedTarget?.closest?.(".site")) { if (!hot || focused) hideTip(); } });
$("#sitesLayer").addEventListener("click", (e) => {
  const g = e.target.closest(".site");
  if (!g) return;
  const s = SITE[g.dataset.site];
  if (!focused) { focusRegion(s.region); return; }
  openSite(s.id);
});
$("#letter").addEventListener("click", () => openSite("caliburnus"));
$("#letter").addEventListener("pointerover", (e) => showTip(`<b>위치 불명의 서신</b>칼에 꿰인 봉인. 어느 지도에도 없는 결사의 흔적.`, e));
$("#letter").addEventListener("pointerout", hideTip);

// ── 대륙 진입 ──
function focusRegion(id, anim = true) {
  focused = id;
  hot = id;
  hideTip();
  map.classList.add("focus");
  $("#world").classList.add("focused");
  lift(id);
  $$("#sitesLayer .sites").forEach((g) => g.classList.toggle("active", g.dataset.region === id));
  // 화면 맞추기
  const pts = regionPts[id];
  const b = bbox(pts.concat(...Object.entries(POS).filter(([k]) => SITE[k]?.region === id).map(([, p]) => [p, [p[0], p[1] - 120]])));
  const pad = 90;
  const wide = innerWidth > 860;
  const availW = wide ? innerWidth - Math.min(420, innerWidth) : innerWidth;
  const availH = wide ? innerHeight : innerHeight * 0.48;
  const s = Math.min((availW - 40) / (b.w + pad * 2), (availH - 60) / (b.h + pad * 2), 2.2);
  view.s = s;
  view.x = (availW - (b.w + pad * 2) * s) / 2 - (b.x - pad) * s;
  view.y = (availH - (b.h + pad * 2) * s) / 2 - (b.y - pad) * s + (wide ? 10 : 0);
  apply(anim);
  renderRegionPanel(id);
  $("#backToWorld").hidden = false;
}
function leaveRegion() {
  focused = null; hot = null;
  map.classList.remove("focus");
  $("#world").classList.remove("focused");
  unlift();
  $("#regionPanel").hidden = true;
  $("#backToWorld").hidden = true;
  fit(true);
}
$("#backToWorld").addEventListener("click", leaveRegion);

const KIND = { school: "SCHOLA", inst: "INSTITUTUM", local: "LOCUS", major: "GENIUS LOCI", ancient: "ANTIQUUS", hidden: "ARCANUM" };
function renderRegionPanel(id) {
  const r = RC[id];
  const sites = ALL_SITES.filter((s) => s.region === id);
  const p = $("#regionPanel");
  p.hidden = false;
  p.style.animation = "none"; p.offsetHeight; p.style.animation = "";
  p.innerHTML = `<div class="rp-seal" style="background:${r.color}">${r.sym}</div>
    <p class="rp-latin">${r.latin}</p><h2 class="rp-name">${esc(r.name)}</h2>
    <span class="chip">${r.sym} ${esc(r.attr)}</span>
    <hr class="rule">
    <dl class="fields">${r.fields.filter((f) => f.v.trim()).map((f) => fieldHTML(f)).join("")}</dl>
    <hr class="rule">
    <p class="rp-latin">LOCA · 주요 기관과 장소</p>
    <ul class="site-list">${sites.map((s) => `<li><button type="button" data-site="${s.id}"><span>${esc(siteName(s))}</span><span class="kind">${KIND[s.kind] || ""}</span></button></li>`).join("")}</ul>`;
  p.scrollTop = 0;
}
$("#regionPanel").addEventListener("click", (e) => { const b = e.target.closest("[data-site]"); if (b) openSite(b.dataset.site); veilClick(e); });
const siteName = (s) => (s.kind === "hidden" && !opened.has("site:" + s.id) ? (s.id === "glass-tower" ? "??? (스포일러)" : s.name + " (스포일러)") : s.realName || s.mapName || s.name);

function fieldHTML(f) {
  const body = esc(f.v.trim()).replace(/\n/g, "<br>");
  const v = f.spoiler ? veil(body) : body;
  return `${f.k ? `<dt>${esc(f.k)}</dt>` : ""}<dd>${v}</dd>`;
}
const veil = (html, tag = "span") => `<${tag} class="veil" tabindex="0" role="button" aria-label="스포일러 내용, 눌러서 보기"><span class="veil-body">${html}</span></${tag}>`;
function veilClick(e) {
  const v = e.target.closest(".veil:not(.open)");
  if (v) { v.classList.add("open"); v.removeAttribute("role"); e.stopPropagation(); return true; }
  return false;
}
document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.classList?.contains("veil")) e.target.click(); });

// ───────── 겹창 공용 ─────────
const overlay = $("#overlay");
const stack = [];
function openLayer(html, onMount) {
  stack.push(html);
  overlay.hidden = false;
  overlay.innerHTML = html;
  onMount && onMount(overlay);
  overlay.querySelector(".close")?.focus();
}
function closeLayer() {
  overlay.hidden = true;
  overlay.innerHTML = "";
  stack.length = 0;
  layerBack = null;
}
let layerBack = null; // 인물 창을 닫으면 돌아갈 곳
overlay.addEventListener("click", (e) => {
  if (veilClick(e)) return;
  if (e.target === overlay || e.target.closest(".close")) {
    if (layerBack) { const b = layerBack; layerBack = null; b(); } else closeLayer();
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!$("#confirm").hidden) return closeConfirm(false);
  if (!overlay.hidden) { if (layerBack) { const b = layerBack; layerBack = null; b(); } else closeLayer(); return; }
  if (!$("#library").hidden) return showWorld();
  if (focused) leaveRegion();
});

// 스포일러 확인
let confirmCb = null;
function ask(title, msg, cb) {
  const c = $("#confirm");
  c.hidden = false;
  c.innerHTML = `<div class="seal">⚠</div><h3>${esc(title)}</h3><p>${msg}</p><div class="row"><button class="btn" data-a="no">돌아가기</button><button class="btn danger" data-a="yes">봉인 풀고 보기</button></div>`;
  confirmCb = cb;
  c.querySelector("[data-a=yes]").focus();
}
function closeConfirm(ok) { $("#confirm").hidden = true; const cb = confirmCb; confirmCb = null; if (ok && cb) cb(); }
$("#confirm").addEventListener("click", (e) => { const a = e.target.closest("[data-a]")?.dataset.a; if (a) closeConfirm(a === "yes"); });

// ───────── 기관 도면 ─────────
function openSite(id) {
  const s = SITE[id];
  if (!s) return;
  if (s.kind === "hidden" && !opened.has("site:" + id)) {
    return ask("스포일러 주의", "이 장소는 이야기의 핵심 비밀과 이어져 있어요.<br>직접 알아 가고 싶다면 돌아가세요.", () => { remember("site:" + id); if (focused) renderRegionPanel(focused); openSite(id); });
  }
  hideTip();
  const color = s.region ? RC[s.region].color : "#a4372f";
  const plan = drawSection(s, CHARS, color);
  const r = s.region ? RC[s.region] : null;
  const name = s.realName || s.name;
  const fields = (s.fields || []).filter((f) => f.v && f.v.trim() && f.k !== "층");
  const floors = (s.fields || []).find((f) => f.k === "층");
  const npcs = [...new Set(s.npcs)];
  layerBack = null;
  openLayer(`<div class="sheet site-sheet" role="dialog" aria-modal="true" aria-label="${esc(name)}">
    <button class="close" type="button" aria-label="닫기">✕</button>
    <div class="site-plan">${plan || ""}</div>
    <div class="site-info">
      <p class="si-kicker">${r ? `${r.sym} ${r.latin}` : "LOCUS INCOGNITUS"} · ${KIND[s.kind] || ""}</p>
      <h2 class="si-name">${esc(name)}</h2>
      ${r ? `<span class="chip">${esc(r.name)}</span>` : `<span class="chip">위치 불명</span>`}
      <hr class="rule">
      <dl class="fields">${fields.map(fieldHTML).join("")}${floors ? `<dt>층별 구성</dt><dd>${esc(floors.v.trim()).replace(/\n/g, "<br>")}</dd>` : ""}</dl>
      <hr class="rule">
      <p class="si-kicker">PERSONAE · 이곳의 인물</p>
      <div class="npc-row">${npcs.map((n) => chip(n)).join("")}</div>
      <p class="si-kicker" style="margin-top:16px">도면의 표식을 눌러도 인물을 볼 수 있어요.</p>
    </div></div>`, (el) => {
    el.querySelector(".site-plan").addEventListener("click", (e) => { const p = e.target.closest(".npc-pin"); if (p) openNPC(p.dataset.npc, () => openSite(id)); });
    el.querySelector(".site-plan").addEventListener("keydown", (e) => { const p = e.target.closest(".npc-pin"); if (p && e.key === "Enter") openNPC(p.dataset.npc, () => openSite(id)); });
    el.querySelector(".npc-row").addEventListener("click", (e) => { const p = e.target.closest("[data-npc]"); if (p) openNPC(p.dataset.npc, () => openSite(id)); });
  });
}
function chip(n) {
  const c = CHARS[n];
  const veiled = c && ((c.hidden && !opened.has("npc:" + n)) || (c.imgSpoiler && !opened.has("img:" + n)));
  return `<button class="npc-chip${veiled ? " veiled" : ""}" type="button" data-npc="${esc(n)}">${c?.img ? `<img src="${c.img}" alt="" loading="lazy">` : ""}<span>${esc(n)}</span></button>`;
}

// ───────── 인물 ─────────
function openNPC(name, back) {
  const c = CHARS[name];
  if (!c) return;
  if (c.hidden && !opened.has("npc:" + name)) {
    return ask("스포일러 주의", `이 인물의 존재 자체가 이야기의 비밀에 닿아 있어요.<br>정말 열람할까요?`, () => { remember("npc:" + name); openNPC(name, back); });
  }
  const bio = BIOS[name] || { text: "" };
  const rc = c.region ? RC[c.region].color : "#c8a050";
  const imgVeil = c.imgSpoiler && !opened.has("img:" + name);
  const where = (WHERE[name] || []).map((id) => `<button type="button" data-site="${id}">${esc(siteName(SITE[id]))}</button>`).join("");
  const fam = c.fields.find((f) => f.k === "사역마" || f.k === "종족");
  const draw = (t) => card(c, rc, { veil: imgVeil, showTrue: t });
  layerBack = back || null;
  openLayer(`<div class="sheet npc-sheet" role="dialog" aria-modal="true" aria-label="${esc(name)}">
    <button class="close" type="button" aria-label="${back ? "돌아가기" : "닫기"}">${back ? "↩" : "✕"}</button>
    <div class="npc-card"><div class="cardwrap">${draw(false)}</div>
      ${c.imgTrue ? `<button class="toggle-true" type="button">본모습 보기</button>` : ""}
      ${imgVeil ? `<button class="toggle-true reveal-img" type="button">⚠ 초상 봉인 풀기</button>` : ""}
    </div>
    <div class="npc-page">
      <p class="si-kicker">${esc(GROUP_LABEL[c.group] || "")}${c.region ? " · " + RC[c.region].latin : ""}</p>
      <h2 class="np-name">${esc(name)}</h2>
      <p class="np-sub">${esc(c.subtitle)}</p>
      <hr class="rule">
      <p class="np-bio">${esc(bio.text)}</p>
      ${fam ? `<dl class="fields"><dt>${fam.k === "종족" ? "종족" : "사역마"}</dt><dd>${esc(fam.v.split("\n")[0])}</dd></dl>` : ""}
      ${bio.secret ? `<div class="secret-note"><span class="label">SECRETUM · 숨겨진 이야기</span>${veil(`<p class="np-bio" style="text-indent:0">${esc(bio.secret)}</p>`, "div")}</div>` : ""}
      ${where ? `<div class="np-where"><p class="si-kicker">LOCA · 만날 수 있는 곳</p>${where}</div>` : ""}
    </div></div>`, (el) => {
    let tf = false;
    el.querySelector(".toggle-true:not(.reveal-img)")?.addEventListener("click", (e) => { tf = !tf; el.querySelector(".cardwrap").innerHTML = draw(tf); e.target.textContent = tf ? "인간형 보기" : "본모습 보기"; });
    el.querySelector(".reveal-img")?.addEventListener("click", () => ask("스포일러 주의", "이 초상은 인물의 숨겨진 정체를 드러내요.", () => { remember("img:" + name); openNPC(name, back); }));
    el.querySelector(".np-where")?.addEventListener("click", (e) => { const b = e.target.closest("[data-site]"); if (b) openSite(b.dataset.site); });
  });
}

// ───────── 아발론 연대기 (책장) ─────────
const DARK = ["#2a1c18", "#1f2328", "#2b2420", "#1d1a24", "#2a2016", "#182220", "#30201c", "#22201c", "#1a1714", "#2c2228"];
const ROSTER = { id: "roster", title: "인물 명부", latin: "PERSONAE", color: "#7a2f3a", emblem: "☙" };
function buildShelf() {
  const shelf = $("#shelf");
  const rows = Math.max(3, Math.min(5, Math.round(innerHeight / 210)));
  const rowH = innerHeight / rows;
  const width = Math.max(innerWidth * 2.2, 2600);
  const R = rng(2026);
  const glows = [ROSTER, ...BOOKS];
  const perRow = Array.from({ length: rows }, () => []);
  glows.forEach((b, i) => perRow[i % rows].push(b));
  let html = `<div class="case" style="width:${width}px">`;
  for (let r = 0; r < rows; r++) {
    html += `<div class="srow" style="height:${rowH}px">`;
    const targets = perRow[r].map((b, k) => ({ b, at: Math.floor(((k + 0.5 + (R() - 0.5) * 0.5) / perRow[r].length) * (width - 140)) + 60 }));
    let x = 30;
    while (x < width - 60) {
      const t = targets.find((t) => !t.done && x >= t.at);
      if (t) {
        t.done = true;
        const h = rowH * (0.8 + R() * 0.08) - 16;
        html += `<button class="book glow" type="button" data-book="${t.b.id}" style="width:48px;height:${h}px" aria-label="${esc(t.b.title)} 펼치기"><span class="em">${t.b.emblem}</span><span class="tt">${esc(t.b.title)}</span><span class="lt">${t.b.latin}</span>${[0, 1, 2].map((m) => `<i class="mote" style="left:${8 + m * 14}px;top:${20 + m * 30}%;animation-delay:${m * 1.6}s"></i>`).join("")}</button>`;
        x += 50;
        continue;
      }
      const w = 16 + Math.floor(R() * 26), h = rowH * (0.5 + R() * 0.38) - 16;
      const c = DARK[Math.floor(R() * DARK.length)];
      const lean = R() < 0.04;
      html += `<span class="book${lean ? " lean" : ""}" style="width:${w}px;height:${h}px;background:${c}">${R() < 0.6 ? `<i class="band" style="top:${10 + R() * 10}%"></i><i class="band" style="bottom:${8 + R() * 8}%"></i>` : ""}</span>`;
      x += w + 2 + (lean ? 6 : 0);
      if (R() < 0.04) x += 30 + R() * 40; // 빈 틈
    }
    html += `</div>`;
  }
  for (let p = 0; p < width; p += 900) html += `<i class="pillar" style="left:${p}px"></i>`;
  html += `</div>`;
  shelf.innerHTML = html;
}
function showLibrary() {
  closeLayer();
  if (focused) leaveRegion();
  buildShelf();
  $("#library").hidden = false;
  $("#shelf").scrollLeft = 0;
  history.replaceState(null, "", "#library");
}
function showWorld() {
  closeLayer();
  $("#library").hidden = true;
  history.replaceState(null, "", "#");
}
$("#bookmark").addEventListener("click", (e) => { e.preventDefault(); showLibrary(); });
$("#libBack").addEventListener("click", showWorld);
addEventListener("resize", () => { if (!$("#library").hidden) buildShelf(); });
// 책장 끌어서 넘기기 / 휠
{
  const sh = $("#shelf");
  let down = null, moved = 0;
  sh.addEventListener("wheel", (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); sh.scrollLeft += e.deltaY; } }, { passive: false });
  sh.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") return; down = { x: e.clientX, l: sh.scrollLeft }; moved = 0; });
  addEventListener("pointermove", (e) => { if (!down) return; moved = Math.abs(e.clientX - down.x); if (moved > 5) { sh.classList.add("drag"); sh.scrollLeft = down.l - (e.clientX - down.x); } });
  addEventListener("pointerup", () => { down = null; sh.classList.remove("drag"); });
  sh.addEventListener("click", (e) => {
    if (moved > 5) { moved = 0; return; }
    const b = e.target.closest(".book.glow");
    if (!b) return;
    b.dataset.book === "roster" ? openRoster() : openBook(b.dataset.book, 0, true);
  });
}

// 마크다운 비슷한 본문 → HTML
function md(src) {
  const lines = src.replace(/\{user\}/g, "당신").split("\n");
  let out = "", list = false, secret = false, buf = "";
  const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  const push = (h) => (secret ? (buf += h) : (out += h));
  const closeList = () => { if (list) { push("</ul>"); list = false; } };
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (l.trim() === "::: secret") { closeList(); secret = true; buf = ""; continue; }
    if (l.trim() === ":::" && secret) { closeList(); secret = false; out += veil(buf, "div"); continue; }
    if (!l.trim()) { closeList(); continue; }
    let m;
    if ((m = l.match(/^#{1,2}\s+(.*)/))) { closeList(); push(`<h3>${inline(m[1])}</h3>`); continue; }
    if ((m = l.match(/^#{3,}\s+(.*)/))) { closeList(); push(`<h4>${inline(m[1])}</h4>`); continue; }
    if ((m = l.match(/^\s+[*-]\s+(.*)/))) { if (!list) { push("<ul>"); list = true; } push(`<li class="sub">${inline(m[1])}</li>`); continue; }
    if ((m = l.match(/^-\s+(.*)/))) {
      if (!list) { push("<ul>"); list = true; }
      const t = m[1];
      const s = t.match(/^\[비밀\]\s*(.*)/);
      push(s ? `<li class="veil" tabindex="0"><span class="veil-body">${inline(s[1])}</span></li>` : `<li>${inline(t)}</li>`);
      continue;
    }
    const s = l.match(/^\[비밀\]\s*(.*)/);
    closeList();
    push(s ? veil(`<p>${inline(s[1])}</p>`, "div") : `<p>${inline(l)}</p>`);
  }
  closeList();
  return out;
}
function chapterHTML(ch) {
  if (ch.lore) return md(LORE[ch.lore] || "");
  return md(ch.md || "");
}
function openBook(id, idx = 0, fresh = false) {
  const b = BOOKS.find((x) => x.id === id);
  const ch = b.chapters[idx];
  const doOpen = () => {
    openLayer(`<div class="reader" role="dialog" aria-modal="true" aria-label="${esc(b.title)}">
      <div class="cover" style="background:${b.color}"></div>
      ${fresh ? `<div class="flap" style="background:${b.color}"><span>${esc(b.title)}</span></div>` : ""}
      <section class="page left">
        <button class="close" type="button" aria-label="책 덮기">✕</button>
        <div class="bk-emblem" style="background:${b.color}">${b.emblem}</div>
        <h2 class="bk-title">${esc(b.title)}</h2><p class="bk-latin">${b.latin}</p>
        <hr class="rule">
        <ol class="toc">${b.chapters.map((c, i) => `<li><button type="button" data-ch="${i}" ${i === idx ? 'aria-current="true"' : ""}>${esc(c.t)}</button></li>`).join("")}</ol>
        ${/veil/.test(b.chapters.map(chapterHTML).join("")) ? `<button class="btn unseal" type="button">✶ 이 책의 봉인 모두 풀기</button>` : ""}
        <div class="pager"><span>Liber · ${b.latin.toLowerCase()}</span><span></span></div>
      </section>
      <section class="page right${fresh ? "" : " turn"}">
        <p class="ch-head">CAPITULUM ${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][idx]} · ${esc(ch.t)}</p>
        <div class="md">${chapterHTML(ch)}</div>
        <div class="pager">${idx > 0 ? `<button type="button" data-ch="${idx - 1}">‹ 앞 장</button>` : "<span></span>"}<span>${idx + 1} / ${b.chapters.length}</span>${idx < b.chapters.length - 1 ? `<button type="button" data-ch="${idx + 1}">다음 장 ›</button>` : "<span></span>"}</div>
      </section></div>`, (el) => {
      el.querySelector(".reader").addEventListener("click", (e) => {
        const c = e.target.closest("[data-ch]");
        if (c) openBook(id, +c.dataset.ch);
        if (e.target.closest(".unseal")) {
          if (b.sealed && !opened.has("book:" + id)) return ask("스포일러 주의", "세계의 가장 깊은 비밀이 적혀 있어요.", () => { remember("book:" + id); $$(".veil", el).forEach((v) => v.classList.add("open")); });
          $$(".veil", el).forEach((v) => v.classList.add("open"));
        }
      });
    });
  };
  if (b.sealed && fresh && !opened.has("book:" + id)) return ask("봉인된 책", "이 책은 세계의 비밀을 담고 있어요. 펼친 뒤에도 내용은 흐리게 가려 두었으니, 원할 때 하나씩 봉인을 풀어 읽으세요.", doOpen);
  doOpen();
}

// 인물 명부
const ORDER = ["aurora", "somnium", "flumen", "hortus", "fornax", "tonans", "profundum", "concordia", "other", "ancient", "hidden"];
const ORDER_NAME = { concordia: "콘코르디아 & 각 지역", other: "기관 · 원형종", ancient: "고대종", hidden: "멀린 & 모르간 · 스포일러" };
function openRoster() {
  const groups = {};
  for (const c of Object.values(CHARS)) (groups[frameKey(c)] ||= []).push(c);
  const sec = ORDER.filter((k) => groups[k]).map((k) => {
    const label = ORDER_NAME[k] || GROUP_LABEL[k];
    return `<h3>${esc(label)}</h3><div class="cards">${groups[k].map((c) => {
      const veiled = (c.hidden && !opened.has("npc:" + c.name)) || (c.imgSpoiler && !opened.has("img:" + c.name));
      return `<button type="button" data-npc="${esc(c.name)}" aria-label="${esc(c.hidden && veiled ? "스포일러 인물" : c.name)}">${card(c.hidden && veiled ? { ...c, name: "???" } : c, c.region ? RC[c.region].color : "#c8a050", { veil: veiled })}</button>`;
    }).join("")}</div>`;
  }).join("");
  layerBack = null;
  openLayer(`<div class="roster" role="dialog" aria-modal="true" aria-label="인물 명부"><button class="close" type="button" aria-label="닫기">✕</button>
    <p class="rlatin">LIBER PERSONARUM</p><h2>인물 명부</h2>${sec}</div>`, (el) => {
    el.querySelector(".roster").addEventListener("click", (e) => { const b = e.target.closest("[data-npc]"); if (b) openNPC(b.dataset.npc, openRoster); });
  });
}

// 첫 진입
fit(false);
if (location.hash === "#library") { enter(); setTimeout(showLibrary, 1800); }
