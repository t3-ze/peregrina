import { REGIONS, SITES, WANDERING, CHARS, LORE } from "./data.js";
import { BIOS } from "./bios.js";
import { BOOKS } from "./books.js";
import { buildMap, buildSites, GEO, POS, W, H, regionPts } from "./map.js";
import { planisphere } from "./planisphere.js";
import { drawSection, SEC } from "./sections.js";
import { card, GROUP_LABEL, frameKey } from "./frames.js";
import { noiseURL, esc, smoothClosed, bbox, rng } from "./util.js";
import { emblem } from "./emblems.js";
import "./cursor.js";
import "./sfx.js";
import * as bgm from "./bgm.js";

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
// 숨겨진 인물이 사는 장소: 인물 이야기는 장소 설명에서 빼고 그 인물의 프로필(js/bios.js의 more)로 옮긴다
const SITE_FIELDS = {
  "glass-tower": [
    { k: "위치", v: "정해진 자리가 없다. 길 잃은 편지가 모이는 곳(분실 우편 보관소의 뒷문, 운하가 끝나는 물가, 아무도 쓰지 않는 우체통 옆)에 밤에만 나타난다." },
    { k: "출입", v: "'보낸이 없는 편지'를 지닌 자에게만 보이고, 그 편지가 문을 연다. 다른 이에게는 달빛이 비친 물웅덩이로만 보인다." },
    { k: "내부", v: "끝없이 위로 이어지는 나선 계단. 공중에 수천 통의 편지가 새처럼 떠다니고, 벽마다 창이 나 있어 아발론 곳곳의 풍경이 비친다. 꼭대기에는 누군가의 서재가 있다." },
    { k: "규칙", v: "탑 안에서는 시간이 흐르지 않는다. 오래 머물다 나오면 바깥에서는 몇 시간이 지나 있다. 탑 안에서 쓴 편지는 받는 이의 이름만 적으면 어디든 닿는다." },
  ],
  avallach: [
    { k: "위치", v: "지도에 없다. 사과꽃 향이 나는 안개 속을 걸으면 길이 열린다고 한다. 루나티카 안개 숲 깊은 곳에서 이 향을 맡았다는 이야기가 가끔 돈다." },
    { k: "풍경", v: "사계절 꽃과 열매가 함께 달리는 사과나무 숲. 한가운데에 거울처럼 고요한 호수와, 그 옆에 덩굴로 뒤덮인 작은 오두막이 있다." },
    { k: "규칙", v: "허락 없이 사과를 따면 길이 닫혀 숲 밖으로 내쫓긴다." },
    { k: "호수", v: "물에 비친 얼굴은 가끔 그 사람이 가장 그리워하는 이의 얼굴로 바뀐다." },
    { k: "손님", v: "다친 원형종, 갈 곳 없는 표류자가 가끔 머문다. 이곳에서 지낸 기억은 숲을 나서면 꿈처럼 흐려진다." },
  ],
};
for (const [id, f] of Object.entries(SITE_FIELDS)) SITE[id].fields = f.map((x) => ({ ...x, spoiler: false }));
// 지역 설명의 '주요 장소' 목록: 로어북에서 첫 항목과 NPC 조우 항목이 같은 곳을 가리켜 중복되고, 줄바꿈이 빠진 곳이 있었다. 정리해서 덮어쓴다.
const REGION_PLACES = {
  arcadia: "동쪽 끝 절벽의 재의 제단: 불사조 NPC '헬리아' 조우 가능\n치유의 샘(용생구자 공복이 관리)\n성소의 향로(산예가 머무는 곳)\n아우로라의 새벽 기도실",
  lunatica: "숲 한가운데의 달빛 절구터: 달토끼 NPC '소월' 조우 가능\n숲 입구의 등불 초소(노엘이 지킨다)\n매일 모양이 바뀌는 오솔길\n월식의 밤에만 하나로 고정되는 길",
  mercurius: "운하 바깥의 잠긴 종탑: 이무기 NPC '청류' 조우 가능\n대운하 시장 다리\n뒷골목 골동품 가게\n쿠르수스 분실 우편 보관소",
  venustas: "변두리의 버려진 온실: 페리 NPC '나르기스' 조우 가능\n학생들이 한 구획씩 가꾸는 학파 정원\n원장실 한가운데의 월계수\n변두리의 약초 가게\n황금 사과의 정원 입구",
  martialis: "투기장 너머 창의 언덕: 발키리 NPC '힐드' 조우 가능\n대장간 거리\n산맥 아래 마을의 투기장\n산맥 정상의 화구",
  jupiter: "바깥 성벽 끝의 폭풍 망루: 기린 NPC '휘린' 조우 가능\n내성의 의회당\n성벽길 역마차 출발지\n가루다의 탑",
  saturnus: "금서고 계단 끝의 닫힌 문: 스핑크스 NPC '네페르' 조우 가능\n가고일이 지키는 서고 입구\n마정석 광산\n금서고로 내려가는 계단",
};
for (const r of REGIONS) {
  const v = REGION_PLACES[r.id];
  if (!v) continue;
  const f = r.fields.find((x) => x.k === "주요 장소");
  if (f) f.v = v;
}
for (const c of Object.values(CHARS)) c.regionLatin = c.region ? RC[c.region].latin : "";
const WHERE = {};
for (const s of ALL_SITES) for (const n of new Set(s.npcs)) (WHERE[n] ||= []).push(s.id);

// 초상을 가려야 하는 인물 (숨겨진 인물·정체가 드러나는 초상)
const veiledImg = (n) => { const c = CHARS[n]; return !!c && (c.hidden || c.imgSpoiler) && !opened.has("img:" + n); };
// 스포일러 열람 기억 (세션 동안)
const opened = new Set();
try { JSON.parse(sessionStorage.getItem("peregrina-open") || "[]").forEach((k) => opened.add(k)); } catch {}
const remember = (k) => { opened.add(k); try { sessionStorage.setItem("peregrina-open", JSON.stringify([...opened])); } catch {} };

document.documentElement.style.setProperty("--noise", `url(${noiseURL()})`);
$("#noise").style.backgroundImage = `url(${noiseURL()})`;

// ───────── 여는 화면: 봉인된 편지 ─────────
// 편지 봉투 (600×380): 안쪽 면 / 앞 주머니 / 덮개(앞·뒤) / 밀랍 봉인
const ENV_BACK = `<svg viewBox="0 0 600 380" preserveAspectRatio="none"><rect width="600" height="380" rx="8" fill="#d6c196"/><rect x="10" y="10" width="580" height="360" rx="4" fill="#ccb587"/></svg>`;
const ENV_FRONT = `<svg viewBox="0 0 600 380" preserveAspectRatio="none">
  <path d="M0,0 L300,206 L600,0 V372 Q600,380 592,380 H8 Q0,380 0,372Z" fill="#efe2c3"/>
  <path d="M0,0 L300,206 L600,0" fill="none" stroke="#c9b285" stroke-width="2"/>
  <path d="M0,380 L300,196 L600,380" fill="none" stroke="#dccb9f" stroke-width="2"/>
  <g transform="translate(92,300)" opacity=".75"><circle r="40" fill="none" stroke="#a4372f" stroke-width="2" stroke-dasharray="5 4"/><circle r="31" fill="none" stroke="#a4372f" stroke-width="1"/>
    <text y="-6" text-anchor="middle" font-family="IM Fell English SC, serif" font-size="13" letter-spacing="2" fill="#a4372f">AVALON</text><text y="12" text-anchor="middle" font-family="IM Fell English, serif" font-size="11" fill="#a4372f">CCCCXII</text>
    <path d="M44,-10 q20,-8 40,0 t40,0 t40,0 M44,0 q20,-8 40,0 t40,0 t40,0 M44,10 q20,-8 40,0 t40,0 t40,0" fill="none" stroke="#a4372f" stroke-width="1.2"/></g>
  <text x="330" y="318" text-anchor="middle" font-family="KookminUniversitySunggokSerif, serif" font-size="26" fill="#3a2a1c">경계 너머의 당신에게</text>
  <path d="M220,330 h220" stroke="#3a2a1c" stroke-width="1" opacity=".4"/>
  <g transform="translate(520,262)"><rect x="-34" y="-42" width="68" height="84" fill="#f6efdc" stroke="#c9b285" stroke-width="2" stroke-dasharray="3 3"/><rect x="-26" y="-34" width="52" height="68" fill="#24305e"/>
    <circle cx="0" cy="-2" r="13" fill="#e3b04b"/><ellipse cx="0" cy="-2" rx="22" ry="6" fill="none" stroke="#ead48f" stroke-width="1.6"/><circle cx="-14" cy="-22" r="1.6" fill="#f6f0dc"/><circle cx="16" cy="20" r="1.4" fill="#f6f0dc"/></g>
</svg>`;
const FLAP_FRONT = `<svg viewBox="0 0 600 215" preserveAspectRatio="none"><path d="M0,0 H600 L318,206 Q300,218 282,206Z" fill="#e8d6ad"/><path d="M14,6 H586" stroke="#d6c196" stroke-width="2"/></svg>`;
const FLAP_BACK = `<svg viewBox="0 0 600 215" preserveAspectRatio="none"><defs><pattern id="opLining" width="36" height="36" patternUnits="userSpaceOnUse"><rect width="36" height="36" fill="#24305e"/><path d="M18,9 l2,6 l6,2 l-6,2 l-2,6 l-2,-6 l-6,-2 l6,-2z" fill="#c8a050"/></pattern></defs><path d="M0,215 H600 L318,9 Q300,-3 282,9Z" fill="url(#opLining)"/></svg>`;
const SEAL_HALF = (side) => `<svg viewBox="0 0 120 120"><defs><clipPath id="opSeal${side}"><rect x="${side === "l" ? 0 : 60}" y="0" width="60" height="120"/></clipPath></defs><g clip-path="url(#opSeal${side})">
  <path d="M60,8 C72,6 78,14 88,14 C100,16 104,28 108,38 C116,48 112,60 114,70 C112,84 104,90 98,100 C88,110 76,108 66,114 C54,114 46,108 36,106 C24,100 18,90 12,80 C8,68 10,58 8,48 C12,34 20,26 30,18 C40,12 50,10 60,8Z" fill="#a4372f"/>
  <circle cx="60" cy="60" r="34" fill="#8f2c25"/><circle cx="60" cy="60" r="30" fill="none" stroke="#c9564b" stroke-width="2"/>
  <path d="M60,34 L66,54 L86,60 L66,66 L60,86 L54,66 L34,60 L54,54Z" fill="#c9564b"/><circle cx="60" cy="60" r="4" fill="#8f2c25"/></g>
  ${side === "l" ? `<path d="M60,6 L56,30 L63,48 L55,70 L62,92 L58,116" fill="none" stroke="#5e1c18" stroke-width="2.4"/>` : ""}</svg>`;
$(".op-env-back").innerHTML = ENV_BACK;
$(".op-env-front").innerHTML = ENV_FRONT;
$(".op-flap").innerHTML = `<div class="face front">${FLAP_FRONT}</div><div class="face back">${FLAP_BACK}</div>`;
$(".op-seal").innerHTML = `<span class="half l">${SEAL_HALF("l")}</span><span class="half r">${SEAL_HALF("r")}</span>`;
$(".op-moon").innerHTML = `<svg viewBox="0 0 120 120"><path d="M74,10 A52,52 0 1 0 110,82 A42,42 0 1 1 74,10Z" fill="#efe6c7"/><circle cx="46" cy="70" r="5" fill="#ddd2ac"/><circle cx="62" cy="92" r="3.5" fill="#ddd2ac"/></svg>`;
// 밤하늘 별과 별똥별
{
  const R = rng(1225);
  let h = "";
  for (let i = 0; i < 140; i++) {
    const big = R() < 0.12;
    h += `<i class="${big ? "st big" : "st"}" style="left:${(R() * 100).toFixed(2)}%;top:${(R() * 100).toFixed(2)}%;animation-delay:${(R() * 5).toFixed(2)}s;animation-duration:${(3 + R() * 4).toFixed(2)}s"></i>`;
  }
  for (let i = 0; i < 3; i++) h += `<i class="shoot" style="top:${8 + i * 14}%;left:${20 + i * 25}%;animation-delay:${2 + i * 3.4}s"></i>`;
  $(".op-sky").innerHTML = h;
}

let entered = false, opStage = 0;
const opTimers = [];
function sparkBurst() {
  const box = $(".op-sparks");
  const R = rng(Date.now() & 0xffff);
  let h = "";
  for (let i = 0; i < 46; i++) {
    const a = R() * Math.PI * 2, d = 160 + R() * 420;
    h += `<i style="--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--s:${(0.5 + R() * 1.1).toFixed(2)};--r:${Math.round(R() * 360)}deg;animation-delay:${(R() * 0.25).toFixed(2)}s"></i>`;
  }
  box.innerHTML = h;
}
function flyAway() {
  if (opStage >= 3) return;
  opStage = 3;
  opTimers.forEach(clearTimeout);
  const op = $("#opening");
  op.classList.add("open", "read", "fly");
  sparkBurst();
  setTimeout(() => { op.classList.add("gone"); $("#world").classList.add("on", "intro"); fit(false); }, 900);
  setTimeout(() => { op.remove(); $("#world").classList.remove("intro"); }, 2500);
}
function enter() {
  if (entered) return;
  entered = true;
  opStage = 1;
  const op = $("#opening");
  bgm.start();
  op.classList.add("open");                                                    // 봉인이 갈라지고 덮개가 열리며 편지가 올라온다
  opTimers.push(setTimeout(() => { opStage = 2; op.classList.add("read"); }, 2200)); // 봉투가 내려가고 편지가 펼쳐진다
  opTimers.push(setTimeout(flyAway, 5600));                                        // 편지가 별빛으로 흩어진다
}
$(".op-seal").addEventListener("click", (e) => { e.stopPropagation(); enter(); });
$("#opening").addEventListener("click", () => { if (!entered) enter(); else if (opStage === 2) flyAway(); });
document.addEventListener("keydown", (e) => { if (e.key !== "Enter" && e.key !== " ") return; if (!entered) enter(); else if (opStage === 2) flyAway(); });

// ───────── 배경 음악 버튼 ─────────
{
  const btn = $("#bgmBtn");
  bgm.onChange((s) => { btn.classList.toggle("on", s.playing); btn.setAttribute("aria-label", s.playing ? "배경 음악 끄기" : "배경 음악 켜기"); btn.title = s.playing ? "배경 음악 끄기" : "배경 음악 켜기"; });
  btn.addEventListener("click", (e) => { e.stopPropagation(); bgm.toggle(); });
}

// ───────── 세계 지도 ─────────
// 밤하늘: 흩뿌린 별(일부만 반짝임) + 가끔 떨어지는 별똥별. 플라니스피어 뒤에 깐다.
const nightSky = (() => {
  const R = rng(4040);
  let h = "";
  for (let i = 0; i < 220; i++) {
    const t = R(), size = t < 0.7 ? 1 : t < 0.93 ? 2 : 3;
    const tw = R() < 0.35 ? ` tw" style="animation-delay:${(R() * 6).toFixed(2)}s;animation-duration:${(3 + R() * 4).toFixed(2)}s;` : `" style="opacity:${(0.35 + R() * 0.6).toFixed(2)};`;
    h += `<i class="ns s${size}${tw}left:${(R() * 100).toFixed(2)}%;top:${(R() * 100).toFixed(2)}%"></i>`;
  }
  // 별똥별: 길이·굵기·머리 크기·각도·속도·주기를 제각각
  for (let i = 0; i < 9; i++) {
    const big = R() < 0.25;
    const len = big ? 220 + R() * 160 : 70 + R() * 140, th = big ? 2 + R() * 1.4 : 0.8 + R() * 1.2;
    const head = th * (2.2 + R() * 1.4), ang = -(18 + R() * 22), dist = 280 + R() * 420;
    h += `<i class="meteor" style="--len:${len.toFixed(0)}px;--th:${th.toFixed(1)}px;--hd:${head.toFixed(1)}px;--a:${ang.toFixed(1)}deg;--d:${dist.toFixed(0)}px;left:${(25 + R() * 75).toFixed(1)}%;top:${(R() * 55).toFixed(1)}%;animation-delay:${(1 + i * 2.3 + R() * 2).toFixed(2)}s;animation-duration:${(14 + R() * 10).toFixed(1)}s"></i>`;
  }
  return `<div class="night">${h}</div>`;
})();
$("#sky").innerHTML = nightSky + `<div class="sky-in">${planisphere().map((svg, i) => `<div class="ps-layer ps-l${i}">${svg}</div>`).join("")}</div>`;
const map = $("#map");
const fx = $("#mapfx");
const parts = buildMap(REGIONS);
const letterX = 2770, letterY = 590;
map.innerHTML = parts.defs +
  `<g id="sea">${parts.sea}</g><g id="land">${parts.land}</g><g id="labels">${parts.labels}</g>` +
  `<g id="letter" class="letter" transform="translate(${letterX},${letterY})" role="button" tabindex="0" aria-label="위치 불명의 서신"><g>
     <path d="M-70,-46 h140 v92 h-140z" fill="#f4e9cd" stroke="#2c2015" stroke-width="2.4" transform="rotate(-8)"/>
     <path d="M-70,-46 l70,52 l70,-52" fill="none" stroke="#2c2015" stroke-width="1.8" transform="rotate(-8)"/>
     <circle cx="0" cy="8" r="20" fill="#a4372f" stroke="#2c2015" stroke-width="2"/><path d="M0,-6 v26 M-8,2 h16" stroke="#f4e9cd" stroke-width="2.4"/>
     <path d="M-6,-60 l12,0 l-6,20z" fill="#888" stroke="#2c2015" stroke-width="1.4"/>
     <text y="76" text-anchor="middle" font-family="KookminUniversitySunggokSerif, serif" font-size="22" fill="#2c2015">위치 불명의 서신</text></g></g>` +
  `<g id="frame">${parts.frame}</g>`;
// 강조·표식·판정은 별도 SVG(자기 합성 레이어)에 둬서, 움직여도 지도 전체를 다시 그리지 않게 한다
fx.innerHTML = `<rect id="dim" width="${W}" height="${H}" fill="#0d0912" opacity="0"/>` +
  `<g id="lift"></g><g id="hits"></g><g id="sitesLayer">${buildSites(ALL_SITES.filter((s) => s.region), REGIONS)}</g>`;
fx.prepend($("#letter"));
// 대륙 판정 영역
$("#hits").innerHTML = REGIONS.map((r) => `<path class="hit" data-id="${r.id}" d="${smoothClosed(regionPts[r.id])}" tabindex="0" role="button" aria-label="${esc(r.name)}"/>`).join("");

// ── 이동·확대 ──
const stage = $("#stage"), sheet = $("#sheet");
const view = { x: 0, y: 0, s: 0.4 };
function apply(anim) {
  sheet.classList.toggle("anim", !!anim);
  sheet.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.s})`;
  const sky = $("#sky .sky-in");
  if (sky) sky.style.transform = `translate3d(${(view.x - innerWidth / 2) * 0.04}px, ${(view.y - innerHeight / 2) * 0.04}px, 0)`;
}
// 메인 지도는 확대·이동 없이 화면 가운데에 꽉 차게 둔다. 대륙을 누를 때만 그 대륙을 당겨 보여 준다.
function fit(anim = true) {
  const s = Math.min((innerWidth * 0.94) / W, (innerHeight * 0.9) / H);
  view.s = s;
  view.x = (innerWidth - W * s) / 2;
  view.y = (innerHeight - H * s) / 2 + 10;
  apply(anim);
}
const pointers = { size: 0 };
addEventListener("resize", () => { focused ? focusRegion(focused, false) : fit(false); });

// ── 툴팁 ──
const tip = $("#tip");
function showTip(html, e) { tip.innerHTML = html; tip.hidden = false; moveTip(e); }
function moveTip(e) { if (tip.hidden) return; const x = Math.min(e.clientX + 18, innerWidth - 280), y = Math.min(e.clientY + 18, innerHeight - 90); tip.style.left = x + "px"; tip.style.top = y + "px"; }
function hideTip() { tip.hidden = true; }
stage.addEventListener("pointermove", moveTip);

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
  bgm.setAmbient(id); // 그 대륙의 앰비언트를 서서히 켠다
  hot = id;
  hideTip();
  fx.classList.add("focus");
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
  bgm.setAmbient(null); // 전도에서는 앰비언트를 서서히 끈다
  fx.classList.remove("focus");
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
    <p class="rp-latin">LOCA</p><h3 class="rp-sec">주요 기관과 장소</h3>
    <ul class="site-list">${sites.map((s) => `<li><button type="button" data-site="${s.id}"><span>${esc(siteName(s))}</span><span class="kind">${KIND[s.kind] || ""}</span></button></li>`).join("")}</ul>`;
  p.scrollTop = 0;
}
$("#regionPanel").addEventListener("click", (e) => { const b = e.target.closest("[data-site]"); if (b) openSite(b.dataset.site); veilClick(e); });
const siteName = (s) => (s.kind === "hidden" && !opened.has("site:" + s.id) ? (s.id === "glass-tower" ? "??? (스포일러)" : s.name + " (스포일러)") : s.realName || s.mapName || s.name);

function fieldHTML(f) {
  const lines = f.v.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  const body = lines.length > 1 ? `<ul>${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : esc(lines[0] || "");
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
  const plan = drawSection(s, CHARS, color, veiledImg);
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
      <dl class="fields">${fields.map(fieldHTML).join("")}${floors ? `${fieldHTML({ k: "층별 구성", v: floors.v })}` : ""}</dl>
      <hr class="rule">
      <p class="si-kicker">PERSONAE · 이곳의 인물</p>
      <div class="npc-row">${npcs.map((n) => chip(n)).join("")}</div>
    </div></div>`, (el) => {
    el.querySelector(".site-plan").addEventListener("click", (e) => { const p = e.target.closest(".npc-pin"); if (p) openNPC(p.dataset.npc, () => openSite(id)); });
    el.querySelector(".site-plan").addEventListener("keydown", (e) => { const p = e.target.closest(".npc-pin"); if (p && e.key === "Enter") openNPC(p.dataset.npc, () => openSite(id)); });
    el.querySelector(".npc-row").addEventListener("click", (e) => { const p = e.target.closest("[data-npc]"); if (p) openNPC(p.dataset.npc, () => openSite(id)); });
  });
}
function chip(n) {
  const c = CHARS[n];
  const veiled = veiledImg(n);
  const nameHidden = c && c.hidden;
  return `<button class="npc-chip${veiled ? " veiled" : ""}" type="button" data-npc="${esc(n)}">${c?.img ? `<img src="${c.img}" alt="" loading="lazy">` : ""}<span>${esc(nameHidden ? "???" : n)}</span></button>`;
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
  layerBack = back || null;
  openLayer(`<div class="sheet npc-sheet" role="dialog" aria-modal="true" aria-label="${esc(name)}">
    <button class="close" type="button" aria-label="${back ? "돌아가기" : "닫기"}">${back ? "↩" : "✕"}</button>
    <div class="npc-photo${imgVeil ? " veiled" : ""}">${c.img ? `<img src="${c.img}" alt="${esc(name)}의 초상">` : ""}</div>
    <div class="npc-page">
      <p class="si-kicker">${esc(GROUP_LABEL[c.group] || "")}${c.region ? " · " + RC[c.region].latin : ""}</p>
      <h2 class="np-name">${esc(name)}</h2>
      <p class="np-sub">${esc(c.subtitle)}</p>
      <div class="np-tools">
        ${c.imgTrue && !imgVeil ? `<button class="btn small toggle-true" type="button">본모습 보기</button>` : ""}
        ${imgVeil ? `<button class="btn small danger reveal-img" type="button">⚠ 초상 봉인 풀기</button>` : ""}
      </div>
      <hr class="rule">
      <p class="np-bio">${esc(bio.text)}</p>
      ${fam ? `<dl class="fields"><dt>${fam.k === "종족" ? "종족" : "사역마"}</dt><dd>${esc(fam.v.split("\n")[0])}</dd></dl>` : ""}
      ${(bio.more || []).filter((m) => !m.spoiler).map((m) => `<dl class="fields"><dt>${esc(m.k)}</dt><dd>${esc(m.v)}</dd></dl>`).join("")}
      ${(bio.more || []).filter((m) => m.spoiler).map((m) => `<div class="secret-note"><span class="label">SECRETUM · ${esc(m.k)}</span>${veil(`<p class="np-bio plain">${esc(m.v)}</p>`, "div")}</div>`).join("")}
      ${bio.secret ? `<div class="secret-note"><span class="label">SECRETUM · 숨겨진 이야기</span>${veil(`<p class="np-bio">${esc(bio.secret)}</p>`, "div")}</div>` : ""}
      ${where ? `<div class="np-where"><p class="si-kicker">LOCA · 만날 수 있는 곳</p>${where}</div>` : ""}
    </div></div>`, (el) => {
    let tf = false;
    el.querySelector(".toggle-true")?.addEventListener("click", (e) => { tf = !tf; el.querySelector(".npc-photo img").src = tf ? c.imgTrue : c.img; e.target.textContent = tf ? "인간형 보기" : "본모습 보기"; });
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
        html += `<button class="book glow" type="button" data-book="${t.b.id}" style="width:48px;height:${h}px" aria-label="${esc(t.b.title)} 펼치기"><span class="em">${emblem(t.b.id, 22)}</span><span class="sp"><span class="tt">${esc(t.b.title)}</span><span class="lt">${t.b.latin}</span></span>${[0, 1, 2].map((m) => `<i class="mote" style="left:${8 + m * 14}px;top:${20 + m * 30}%;animation-delay:${m * 1.6}s"></i>`).join("")}</button>`;
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
// 화면 전환: 책장을 넘기듯 세계 지도 한 장이 책등(왼쪽)을 축으로 넘어간다.
// 지도 → 연대기: 지도가 왼쪽으로 넘어가며 뒤의 책장이 드러난다 / 연대기 → 지도: 지도가 왼쪽에서 넘어와 덮는다
let turning = false;
const calmMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
function pageTurn(cls, done) {
  const w = $("#world");
  if (calmMotion) { done(); return; }
  turning = true;
  w.classList.add(cls);
  w.addEventListener("animationend", function end(e) {
    if (e.target !== w) return;
    w.removeEventListener("animationend", end);
    done();
    w.classList.remove(cls);
    turning = false;
  });
}
function showLibrary(instant) {
  if (turning || !$("#library").hidden) return;
  closeLayer();
  if (focused) leaveRegion();
  buildShelf();
  $("#library").hidden = false;
  $("#shelf").scrollLeft = 0;
  history.replaceState(null, "", "#library");
  if (instant !== true) pageTurn("turn-away", () => {});
}
function showWorld() {
  if (turning || $("#library").hidden) return;
  closeLayer();
  history.replaceState(null, "", "#");
  pageTurn("turn-back", () => { $("#library").hidden = true; });
}
$("#bookmark").addEventListener("click", (e) => { e.preventDefault(); showLibrary(); });
$("#libBack").addEventListener("click", () => showWorld());
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
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
function rightPage(b, idx) {
  const ch = b.chapters[idx];
  return `<div class="page-body"><p class="ch-head">CAPITULUM ${ROMAN[idx]} · ${esc(ch.t)}</p><div class="md">${chapterHTML(ch)}</div></div>
    <div class="pager">${idx > 0 ? `<button type="button" data-ch="${idx - 1}">‹ 앞 장</button>` : "<span></span>"}<span>${idx + 1} / ${b.chapters.length}</span>${idx < b.chapters.length - 1 ? `<button type="button" data-ch="${idx + 1}">다음 장 ›</button>` : "<span></span>"}</div>`;
}
function openBook(id, idx = 0, fresh = false) {
  const b = BOOKS.find((x) => x.id === id);
  let cur = idx, busy = false;
  const doOpen = () => {
    openLayer(`<div class="reader" role="dialog" aria-modal="true" aria-label="${esc(b.title)}">
      <div class="cover" style="background:${b.color}"></div>
      ${fresh ? `<div class="flap" style="background:${b.color}"><span>${esc(b.title)}</span></div>` : ""}
      <section class="page left">
        <button class="close" type="button" aria-label="책 덮기">✕</button>
        <div class="page-body">
          <div class="bk-emblem" style="background:${b.color};--em-bg:${b.color}">${emblem(b.id, 52)}</div>
          <h2 class="bk-title">${esc(b.title)}</h2><p class="bk-latin">${b.latin}</p>
          <hr class="rule">
          <ol class="toc">${b.chapters.map((c, i) => `<li><button type="button" data-ch="${i}" ${i === idx ? 'aria-current="true"' : ""}>${esc(c.t)}</button></li>`).join("")}</ol>
          ${/veil/.test(b.chapters.map(chapterHTML).join("")) ? `<button class="btn unseal" type="button">이 책의 봉인 모두 풀기</button>` : ""}
        </div>
        <div class="pager"><span>Liber · ${b.latin.toLowerCase()}</span><span></span></div>
      </section>
      <section class="page right">${rightPage(b, idx)}</section></div>`, (el) => {
      const reader = el.querySelector(".reader");
      const right = reader.querySelector(".page.right");
      // 종이 한 장이 책등을 축으로 넘어간다. 다음 장: 오른쪽 → 왼쪽 / 앞 장: 왼쪽 → 오른쪽
      const turn = (to) => {
        if (busy || to === cur) return;
        busy = true;
        const next = to > cur;
        const leaf = document.createElement("section");
        leaf.className = "page right leaf " + (next ? "leaf-next" : "leaf-prev");
        leaf.style.cssText = `left:${right.offsetLeft}px;top:${right.offsetTop}px;width:${right.offsetWidth}px;height:${right.offsetHeight}px`;
        if (next) { leaf.innerHTML = right.innerHTML; leaf.querySelector(".page-body").scrollTop = right.querySelector(".page-body").scrollTop; right.innerHTML = rightPage(b, to); }
        else leaf.innerHTML = rightPage(b, to);
        reader.appendChild(leaf);
        leaf.addEventListener("animationend", () => { if (!next) right.innerHTML = rightPage(b, to); leaf.remove(); busy = false; }, { once: true });
        cur = to;
        $$(".toc [data-ch]", reader).forEach((x) => x.toggleAttribute("aria-current", +x.dataset.ch === to));
        $$(".toc [aria-current]", reader).forEach((x) => x.setAttribute("aria-current", "true"));
      };
      reader.addEventListener("click", (e) => {
        const c = e.target.closest("[data-ch]");
        if (c) turn(+c.dataset.ch);
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
const INST_NAME = { 의회: "의회 · 콘킬리움", 기록원: "기록원 · 타불라리움", 기사단: "기사단 · 오르도 풀구리스", 감찰국: "감찰국 · 비질리아", 우편국: "우편국 · 쿠르수스", "상인 연합": "메르카토르 조합", 관측소: "관측소 · 리멘", "마녀 회합": "마녀 회합 · 콘벤투스", 비밀결사: "비밀결사 · 칼리부르누스" };
function rosterGroups() {
  const all = Object.values(CHARS);
  const by = (f) => all.filter(f);
  const schools = ["aurora", "somnium", "flumen", "hortus", "fornax", "tonans", "profundum"];
  return [
    { h: "일곱 학파", subs: schools.map((k) => ({ t: GROUP_LABEL[k], list: by((c) => c.group === k) })) },
    { h: "콘코르디아 & 각 지역", subs: [{ t: "", list: by((c) => c.group === "regional") }] },
    { h: "아발론의 기관", subs: Object.keys(INST_NAME).map((a) => ({ t: INST_NAME[a], list: by((c) => c.group === "other" && c.aff === a) })) },
    { h: "원형종", subs: [{ t: "각 지역의 고위 원형종", list: by((c) => c.group === "major") }] },
    { h: "고대종", subs: [{ t: "일곱 고대종", list: by((c) => c.group === "ancient" && c.aff !== "용생구자") }, { t: "용생구자 아홉 형제", list: by((c) => c.aff === "용생구자") }] },
    { h: "???", subs: [{ t: "", list: by((c) => c.group === "hidden") }] },
  ];
}
function openRoster() {
  const cardBtn = (c) => {
    const hideName = c.hidden;
    return `<button type="button" data-npc="${esc(c.name)}" aria-label="${esc(hideName ? "스포일러 인물" : c.name)}">${card(c, c.region ? RC[c.region].color : "#c8a050", { veil: veiledImg(c.name), hideName })}</button>`;
  };
  const sec = rosterGroups().map((g) => `<h3>${esc(g.h)}</h3>` + g.subs.filter((x) => x.list.length).map((x) => `${x.t ? `<h4>${esc(x.t)}</h4>` : ""}<div class="cards">${x.list.map(cardBtn).join("")}</div>`).join("")).join("");
  layerBack = null;
  openLayer(`<div class="roster" role="dialog" aria-modal="true" aria-label="인물 명부"><button class="close" type="button" aria-label="닫기">✕</button>
    <p class="rlatin">LIBER PERSONARUM</p><h2>인물 명부</h2>${sec}</div>`, (el) => {
    el.querySelector(".roster").addEventListener("click", (e) => { const b = e.target.closest("[data-npc]"); if (b) openNPC(b.dataset.npc, openRoster); });
  });
}

// 첫 진입
fit(false);
if (location.hash === "#library") { enter(); setTimeout(() => showLibrary(true), 1800); }
