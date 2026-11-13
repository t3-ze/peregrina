// 인물 프로필 카드: 세로로 긴 프레임, 초상이 창을 가득 채우고, 아래에서 올라오는 검은 음영 위에 정보를 적는다.
// 프레임 장식은 모두 닫힌 도형(속을 채우고 얇은 외곽선)이며 좌우 대칭으로 거울 복제한다.
import { esc } from "./util.js";

const CW = 360, CH = 600, MX = 180;
const mirror = (m) => m + `<g transform="translate(${CW},0) scale(-1,1)">${m}</g>`;
const grow = (d, sx, sy) => `<path d="${d}" transform="translate(${MX},300) scale(${sx},${sy}) translate(${-MX},-300)"`;

// 창 모양
const WIN = {
  lancet: "M40,566 V200 Q40,70 180,36 Q320,70 320,200 V566Z",
  moonArch: "M40,566 V184 A140,140 0 0 1 320,184 V566Z",
  scallop: "M40,566 V92 q35,-28 70,0 q35,-28 70,0 q35,-28 70,0 q35,-28 70,0 V566Z",
  ovalTop: "M40,566 V200 C40,92 110,40 180,40 C250,40 320,92 320,200 V566Z",
  chamfer: "M70,40 H290 L320,70 V536 L290,566 H70 L40,536 V70Z",
  crenel: "M40,566 V74 H96 V52 H136 V74 H224 V52 H264 V74 H320 V566Z",
  keystone: "M40,566 V176 A140,136 0 0 1 320,176 V566Z",
  notched: "M60,40 H300 A20,20 0 0 0 320,60 V546 A20,20 0 0 0 300,566 H60 A20,20 0 0 0 40,546 V60 A20,20 0 0 0 60,40Z",
  ogee: "M40,566 V210 C40,130 116,118 148,78 Q172,50 180,30 Q188,50 212,78 C244,118 320,130 320,210 V566Z",
  tall: "M48,566 V214 Q48,96 180,30 Q312,96 312,214 V566Z",
  cartouche: "M40,546 V84 Q40,52 76,52 Q120,52 140,34 Q180,10 220,34 Q240,52 284,52 Q320,52 320,84 V546 Q320,566 300,566 H60 Q40,566 40,546Z",
};

const star4 = (x, y, r, f, s, w = 1) => `<path d="M${x},${y - r} Q${x + r * 0.18},${y - r * 0.18} ${x + r},${y} Q${x + r * 0.18},${y + r * 0.18} ${x},${y + r} Q${x - r * 0.18},${y + r * 0.18} ${x - r},${y} Q${x - r * 0.18},${y - r * 0.18} ${x},${y - r}Z" fill="${f}" stroke="${s}" stroke-width="${w}"/>`;
const leaf = (x, y, a, f, s, L = 16) => `<ellipse cx="${x}" cy="${y}" rx="${L / 2.6}" ry="${L / 2}" transform="rotate(${a} ${x} ${y})" fill="${f}" stroke="${s}" stroke-width="1"/>`;

// 프레임 정의: win(창), base(테 색), line(외곽선), acc(장식), deco(왼쪽 반쪽 장식, 거울 복제), crest(가운데 꼭대기), foot(가운데 아래)
const F = {
  aurora: {
    latin: "AURORA", win: "lancet", base: "#f3ecdc", line: "#5a4520", acc: "#d6a63a",
    back: (c) => Array.from({ length: 13 }, (_, i) => { const a = (-90 + (i - 6) * 13) * Math.PI / 180, L = i % 2 ? 66 : 92; return `<path d="M${MX + Math.cos(a - 0.05) * 30},${40 + Math.sin(a - 0.05) * 30} L${MX + Math.cos(a) * L},${40 + Math.sin(a) * L} L${MX + Math.cos(a + 0.05) * 30},${40 + Math.sin(a + 0.05) * 30}Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1"/>`; }).join(""),
    deco: (c) => `<circle cx="22" cy="310" r="15" fill="${c.base}" stroke="${c.line}" stroke-width="1.2"/><circle cx="22" cy="310" r="8" fill="${c.acc}" stroke="${c.line}" stroke-width="1"/>` +
      `<path d="M14,120 L22,96 L30,120 L22,150Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1"/><path d="M14,480 L22,456 L30,480 L22,510Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1"/>` +
      `<path d="M30,578 C60,560 120,560 150,580 L150,592 L30,592Z" fill="${c.base}" stroke="${c.line}" stroke-width="1.2"/>`,
    crest: (c) => `<circle cx="${MX}" cy="30" r="22" fill="${c.acc}" stroke="${c.line}" stroke-width="1.4"/><circle cx="${MX}" cy="30" r="12" fill="${c.base}" stroke="${c.line}" stroke-width="1"/>`,
  },
  somnium: {
    latin: "SOMNIUM", win: "moonArch", base: "#27305a", line: "#0f1430", acc: "#c9cde8",
    deco: (c) => star4(22, 140, 9, c.acc, c.line) + star4(24, 250, 6, c.acc, c.line) + star4(20, 360, 10, c.acc, c.line) + star4(24, 470, 6, c.acc, c.line) +
      `<path d="M26,578 q20,-24 46,-10 q16,-20 40,-6 q24,-8 34,10 q4,10 -6,18 H30 q-10,-4 -4,-12Z" fill="#3a4478" stroke="${c.acc}" stroke-width="1"/>`,
    crest: (c) => `<path d="M156,22 A30,30 0 1 0 204,52 A24,24 0 1 1 156,22Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.4"/>` + star4(MX + 2, 22, 7, "#f6f0dc", c.line),
  },
  flumen: {
    latin: "FLUMEN", win: "scallop", base: "#2f6f80", line: "#123642", acc: "#a9d6dc",
    deco: (c) => [120, 200, 280, 360, 440, 520].map((y) => `<circle cx="22" cy="${y}" r="8" fill="${c.acc}" stroke="${c.line}" stroke-width="1"/><circle cx="22" cy="${y}" r="3.2" fill="${c.base}" stroke="${c.line}" stroke-width=".8"/>`).join("") +
      `<path d="M20,590 q16,-26 36,-8 q18,-24 40,-6 q22,-22 44,-4 q16,-14 40,2 V594 H20Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/>`,
    crest: (c) => `<path d="M${MX},4 C${MX + 18},26 ${MX + 20},44 ${MX},50 C${MX - 20},44 ${MX - 18},26 ${MX},4Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.4"/><path d="M${MX - 40},40 q20,-18 40,0 q20,-18 40,0 q-20,14 -40,4 q-20,10 -40,-4Z" fill="${c.base}" stroke="${c.acc}" stroke-width="1.2"/>`,
  },
  hortus: {
    latin: "HORTUS", win: "ovalTop", base: "#e9d8cc", line: "#5a2e3c", acc: "#b5577a",
    deco: (c) => Array.from({ length: 13 }, (_, i) => leaf(20 + (i % 2) * 6, 140 + i * 32, i % 2 ? 30 : -30, "#6f8f4f", c.line, 20)).join("") +
      `<path d="M24,128 V566" fill="none" stroke="#4a6a3a" stroke-width="2"/>` +
      [[28, 96], [26, 572]].map(([x, y]) => `<g>${[0, 72, 144, 216, 288].map((r) => `<ellipse cx="${x}" cy="${y - 9}" rx="6" ry="10" transform="rotate(${r} ${x} ${y})" fill="${c.acc}" stroke="${c.line}" stroke-width="1"/>`).join("")}<circle cx="${x}" cy="${y}" r="5" fill="#f2c96b" stroke="${c.line}" stroke-width="1"/></g>`).join(""),
    crest: (c) => leaf(MX - 22, 26, -60, "#6f8f4f", c.line, 26) + leaf(MX + 22, 26, 60, "#6f8f4f", c.line, 26) + [0, 60, 120, 180, 240, 300].map((r) => `<ellipse cx="${MX}" cy="14" rx="7" ry="12" transform="rotate(${r} ${MX} 26)" fill="${c.acc}" stroke="${c.line}" stroke-width="1"/>`).join("") + `<circle cx="${MX}" cy="26" r="6" fill="#f2c96b" stroke="${c.line}" stroke-width="1"/>`,
  },
  fornax: {
    latin: "FORNAX", win: "chamfer", base: "#3b3434", line: "#140f0f", acc: "#d9714f",
    deco: (c) => [70, 130, 190, 250, 310, 370, 430, 490, 550].map((y) => `<circle cx="22" cy="${y}" r="5" fill="#8a8078" stroke="${c.line}" stroke-width="1"/>`).join("") +
      `<path d="M8,8 H76 L40,44 V76 L8,76Z" fill="#8f3a2a" stroke="${c.line}" stroke-width="1.2"/><path d="M8,592 H76 L40,556 V524 L8,524Z" fill="#8f3a2a" stroke="${c.line}" stroke-width="1.2"/>`,
    crest: (c) => `<path d="M${MX - 30},48 h60 l-8,-12 h-44Z" fill="#8a8078" stroke="${c.line}" stroke-width="1.2"/><path d="M${MX},34 C${MX - 22},18 ${MX - 6},6 ${MX - 4},-2 C${MX + 6},10 ${MX + 18},8 ${MX + 12},-4 C${MX + 30},14 ${MX + 20},30 ${MX},34Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/>`,
  },
  tonans: {
    latin: "TONANS", win: "crenel", base: "#4d3d7a", line: "#1a1233", acc: "#e8c84a",
    deco: (c) => `<path d="M26,150 L14,210 L26,210 L16,270 L34,196 L22,196 L32,150Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/>` +
      `<path d="M26,380 L14,440 L26,440 L16,500 L34,426 L22,426 L32,380Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/>` +
      `<path d="M4,594 V540 H40 V594Z M4,540 v-10 h8 v10 M16,540 v-10 h8 v10 M28,540 v-10 h8 v10" fill="#6a5a9a" stroke="${c.line}" stroke-width="1.2"/>`,
    crest: (c) => `<path d="M${MX - 26},8 H${MX + 26} V34 Q${MX + 26},56 ${MX},64 Q${MX - 26},56 ${MX - 26},34Z" fill="#6a5a9a" stroke="${c.line}" stroke-width="1.4"/><path d="M${MX + 4},14 L${MX - 8},38 H${MX + 2} L${MX - 6},58 L${MX + 12},30 H${MX + 2} L${MX + 10},14Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1"/>`,
  },
  profundum: {
    latin: "PROFUNDUM", win: "keystone", base: "#6b5233", line: "#2a1e10", acc: "#c4a476",
    deco: (c) => [150, 300, 450].map((y) => `<circle cx="22" cy="${y}" r="15" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/><circle cx="22" cy="${y}" r="10" fill="${c.base}" stroke="${c.line}" stroke-width="1"/><circle cx="24" cy="${y + 2}" r="5" fill="${c.acc}" stroke="${c.line}" stroke-width="1"/>`).join("") +
      `<path d="M0,556 H160 V600 H0Z" fill="#54402a" stroke="${c.line}" stroke-width="1.2"/><path d="M0,574 H160" stroke="${c.line}" stroke-width=".8"/>`,
    crest: (c) => `<path d="M${MX - 22},8 H${MX + 22} L${MX + 14},60 H${MX - 14}Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.4"/><circle cx="${MX}" cy="24" r="7" fill="${c.base}" stroke="${c.line}" stroke-width="1"/><path d="M${MX - 2},30 h4 v20 h5 v4 h-5 v3 h-4Z" fill="${c.base}" stroke="${c.line}" stroke-width=".8"/>`,
  },
  concordia: {
    latin: "CONCORDIA", win: "notched", base: "#ece0c4", line: "#3a2a1c", acc: null,
    deco: (c) => [130, 190, 250, 310, 370, 430, 490].map((y, i) => `<path d="M22,${y - 12} L30,${y} L22,${y + 12} L14,${y}Z" fill="${["#d9a43a", "#8c93d6", "#4f9cc4", "#d67fa4", "#c8573c", "#8b6cc4", "#a8875a"][i]}" stroke="${c.line}" stroke-width="1"/>`).join("") +
      `<path d="M6,6 H64 Q50,20 50,40 Q30,40 20,54 Q6,40 6,6Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/><path d="M6,594 H64 Q50,580 50,560 Q30,560 20,546 Q6,560 6,594Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/>`,
    crest: (c) => `<circle cx="${MX}" cy="32" r="24" fill="${c.base}" stroke="${c.line}" stroke-width="1.4"/>` + star4(MX, 32, 22, c.acc, c.line, 1.2) + `<path d="M${MX},14 L${MX + 6},32 L${MX},50 L${MX - 6},32Z" fill="${c.base}" stroke="${c.line}" stroke-width=".8"/>`,
  },
  ancient: {
    latin: "ANTIQUI", win: "ogee", base: "#2b2622", line: "#0d0a08", acc: null,
    deco: (c) => Array.from({ length: 14 }, (_, i) => `<path d="M12,${110 + i * 32} q12,-16 24,0 q-12,10 -24,0Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1"/>`).join("") +
      `<path d="M24,598 L8,570 L22,576 L24,556 L34,578 L46,566 L40,598Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/>`,
    crest: (c) => `<path d="M${MX - 10},42 C${MX - 30},30 ${MX - 54},14 ${MX - 60},-2 C${MX - 40},8 ${MX - 26},16 ${MX - 6},22Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/><path d="M${MX + 10},42 C${MX + 30},30 ${MX + 54},14 ${MX + 60},-2 C${MX + 40},8 ${MX + 26},16 ${MX + 6},22Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/><circle cx="${MX}" cy="30" r="10" fill="#e8c84a" stroke="${c.line}" stroke-width="1.2"/><ellipse cx="${MX}" cy="30" rx="2.4" ry="7" fill="${c.line}"/>`,
  },
  hidden: {
    latin: "ARCANUM", win: "tall", base: "#22403a", line: "#0b1a17", acc: "#d6b25a",
    deco: (c) => [[130, "#7fb7c4"], [190, "#c84a3a"], [250, "#e3c66a"], [310, "#7fb7c4"], [370, "#8a6ab0"], [430, "#c84a3a"], [490, "#e3c66a"], [550, "#7fb7c4"]].map(([y, f]) => `<path d="M14,${y - 26} H34 V${y + 26} H14Z" fill="${f}" stroke="${c.acc}" stroke-width="1.4"/>`).join("") +
      `<path d="M30,120 C10,140 10,170 30,186" fill="none" stroke="${c.acc}" stroke-width="2"/>` + leaf(18, 106, -40, "#6f8f4f", c.line, 18) + `<circle cx="30" cy="96" r="8" fill="#c8403a" stroke="${c.line}" stroke-width="1"/>`,
    crest: (c) => `<circle cx="${MX}" cy="26" r="16" fill="#c8403a" stroke="${c.line}" stroke-width="1.4"/>` + leaf(MX + 12, 8, 50, "#6f8f4f", c.line, 18) + star4(MX, 26, 9, c.acc, c.line),
  },
  other: {
    latin: "AVALON", win: "cartouche", base: "#e6d3a6", line: "#4a3519", acc: "#a8823e",
    deco: (c) => `<path d="M10,40 C10,14 40,6 56,20 C40,18 28,26 30,40 C32,54 48,52 46,40 C58,52 44,72 26,66 C14,62 10,52 10,40Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/>` +
      `<path d="M10,560 C10,586 40,594 56,580 C40,582 28,574 30,560 C32,546 48,548 46,560 C58,548 44,528 26,534 C14,538 10,548 10,560Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/>` +
      `<path d="M22,280 C8,290 8,310 22,320 C16,310 16,290 22,280Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/>`,
    crest: (c) => `<path d="M${MX},6 C${MX + 10},20 ${MX + 26},22 ${MX + 34},16 C${MX + 30},32 ${MX + 14},40 ${MX},48 C${MX - 14},40 ${MX - 30},32 ${MX - 34},16 C${MX - 26},22 ${MX - 10},20 ${MX},6Z" fill="${c.acc}" stroke="${c.line}" stroke-width="1.2"/>`,
  },
};

export const GROUP_LABEL = {
  aurora: "여명탑 · 아우로라", somnium: "몽월원 · 솜니움", flumen: "유수당 · 플루멘", hortus: "만화정 · 호르투스", fornax: "단철관 · 포르낙스", tonans: "뇌벽원 · 토난스", profundum: "심연서고 · 프로푼둠",
  regional: "콘코르디아 & 각 지역", ancient: "고대종", hidden: "???", major: "원형종", other: "기관",
};

export function frameKey(c) {
  if (F[c.group]) return c.group;
  if (c.group === "regional") return "concordia";
  if (c.group === "hidden") return "hidden";
  return "other";
}

let n = 0;
// card(char, regionColor, {veil}) → SVG 문자열
export function card(c, rc = "#c8a050", { veil = false, showTrue = false, hideName = false } = {}) {
  const key = frameKey(c);
  const f = F[key];
  const col = { base: f.base, line: f.line, acc: f.acc || rc };
  if (key === "concordia") col.base = "#ece0c4";
  const id = "cf" + ++n;
  const win = WIN[f.win];
  const img = showTrue && c.imgTrue ? c.imgTrue : c.img;
  const nameSize = c.name.length > 5 ? 30 : 38;
  let s = `<svg class="pcard" viewBox="-8 -8 ${CW + 16} ${CH + 16}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(c.name)}">
  <defs>
    <clipPath id="${id}w"><path d="${win}"/></clipPath>
    <linearGradient id="${id}g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#07060a" stop-opacity=".94"/><stop offset=".34" stop-color="#07060a" stop-opacity=".6"/><stop offset=".62" stop-color="#07060a" stop-opacity="0"/></linearGradient>
    <filter id="${id}b"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>`;
  if (f.back) s += f.back(col);
  s += `${grow(win, 1.13, 1.055)} fill="${col.base}" stroke="${col.line}" stroke-width="1.6"/>`;
  s += `${grow(win, 1.065, 1.028)} fill="none" stroke="${col.acc}" stroke-width="1.2"/>`;
  s += mirror(f.deco(col));
  s += `<g clip-path="url(#${id}w)"><rect x="0" y="0" width="${CW}" height="${CH}" fill="#1a1620"/>`;
  if (img) s += `<image href="${img}" x="40" y="20" width="280" height="560" preserveAspectRatio="xMidYMin slice" ${veil ? `filter="url(#${id}b)"` : ""}/>`;
  s += `<rect x="0" y="0" width="${CW}" height="${CH}" fill="url(#${id}g)"/></g>`;
  s += `<path d="${win}" fill="none" stroke="${col.line}" stroke-width="2"/><path d="${win}" fill="none" stroke="${col.acc}" stroke-width=".8" transform="translate(${MX},300) scale(.985,.992) translate(${-MX},-300)"/>`;
  s += f.crest(col);
  // 정보
  const sub = c.subtitle || "";
  const tag = f.latin + ((c.group === "ancient" || key === "concordia") && c.regionLatin && c.regionLatin !== f.latin ? " · " + esc(c.regionLatin) : "");
  const ny = 470 + nameSize + 4;
  s += `<g class="pinfo" text-anchor="middle">
    <text x="${MX}" y="470" font-family="IM Fell English SC, serif" font-size="13" letter-spacing="5" fill="${col.acc}">${hideName ? "ARCANUM" : tag}</text>
    <text x="${MX}" y="${ny}" font-family="KookminUniversitySunggokSerif, serif" font-size="${nameSize}" fill="#f6f0dc">${esc(hideName ? "???" : c.name)}</text>
    <path d="M${MX - 64},${ny + 13} h56 M${MX + 8},${ny + 13} h56" stroke="${col.acc}" stroke-width="1.2"/><path d="M${MX},${ny + 8} l5,5 l-5,5 l-5,-5Z" fill="${col.acc}"/>
    <foreignObject x="58" y="${ny + 22}" width="244" height="${566 - ny - 26}"><div xmlns="http://www.w3.org/1999/xhtml" class="psub">${esc(sub)}</div></foreignObject>
  </g></svg>`;
  return s;
}
