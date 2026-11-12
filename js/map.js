// 아발론 전도: 손으로 그린 듯한 세계 지도 SVG를 만들고, 이동·확대·대륙 강조·대륙 진입을 처리한다.
import { rng, f1, smoothClosed, smoothOpen, coast, shrink, wobbleLine, pointInPoly, bbox, esc, stainURL } from "./util.js";
import { GLYPH } from "./glyphs.js";

export const W = 3000, H = 2000;
const INK = "#2c2015", PAPER = "#ecdfbf", SEA = "#e4d4ae";

// ── 대륙 모양 ──
// lobes: 반도(+)·만(-). 붙어 있는 대륙은 서로 겹치도록 반도를 뻗는다.
export const GEO = {
  saturnus: { cx: 600, cy: 470, rx: 250, ry: 220, rot: 0.3, seed: 18, rough: 0.16, lobes: [{ at: 2.3, amp: 0.25, w: 0.25 }, { at: -0.4, amp: -0.18, w: 0.18 }] },
  jupiter: { cx: 1440, cy: 560, rx: 390, ry: 200, rot: -0.06, seed: 31, rough: 0.12, lobes: [{ at: 1.62, amp: 0.42, w: 0.22 }, { at: -1.5, amp: 0.12, w: 0.3 }, { at: 0.2, amp: 0.12, w: 0.25 }] },
  martialis: { cx: 2140, cy: 470, rx: 330, ry: 255, rot: 0.25, seed: 47, rough: 0.2, lobes: [{ at: 3.2, amp: 0.2, w: 0.25 }, { at: 0.7, amp: 0.24, w: 0.18 }, { at: -0.9, amp: -0.15, w: 0.15 }] },
  concordia: { cx: 1500, cy: 1010, rx: 215, ry: 170, rot: 0.1, seed: 5, rough: 0.1, lobes: [{ at: 2.5, amp: -0.2, w: 0.16 }, { at: 0.3, amp: 0.12, w: 0.2 }] },
  mercurius: { cx: 660, cy: 1060, rx: 300, ry: 250, rot: -0.2, seed: 63, rough: 0.22, lobes: [{ at: 0.1, amp: 0.25, w: 0.15 }, { at: 1.8, amp: -0.25, w: 0.14 }, { at: -2.2, amp: 0.18, w: 0.2 }] },
  arcadia: { cx: 2480, cy: 1180, rx: 235, ry: 330, rot: 0.22, seed: 72, rough: 0.14, lobes: [{ at: 3.0, amp: 0.15, w: 0.2 }, { at: -1.2, amp: 0.15, w: 0.2 }] },
  lunatica: { cx: 1170, cy: 1560, rx: 400, ry: 280, rot: 0.08, seed: 89, rough: 0.15, lobes: [{ at: 0.05, amp: 0.2, w: 0.3 }, { at: -1.9, amp: 0.15, w: 0.22 }, { at: 2.4, amp: -0.12, w: 0.2 }] },
  venustas: { cx: 1930, cy: 1530, rx: 370, ry: 240, rot: -0.12, seed: 97, rough: 0.13, lobes: [{ at: 3.12, amp: 0.26, w: 0.3 }, { at: 0.4, amp: 0.15, w: 0.2 }, { at: -0.9, amp: 0.1, w: 0.2 }] },
};
// 바다 위의 작은 섬들 (지역 소속, 지역 강조 시 함께 떠오름)
const ISLETS = {
  mercurius: [{ cx: 330, cy: 1300, rx: 70, ry: 48, seed: 3 }, { cx: 980, cy: 1270, rx: 52, ry: 36, seed: 4 }, { cx: 420, cy: 770, rx: 46, ry: 34, seed: 11 }, { cx: 1000, cy: 880, rx: 36, ry: 26, seed: 12 }],
  arcadia: [{ cx: 2240, cy: 880, rx: 40, ry: 28, seed: 21 }, { cx: 2770, cy: 1520, rx: 56, ry: 40, seed: 22 }],
  saturnus: [{ cx: 280, cy: 320, rx: 50, ry: 38, seed: 31 }],
  lunatica: [{ cx: 700, cy: 1760, rx: 60, ry: 40, seed: 41 }],
  martialis: [{ cx: 2600, cy: 300, rx: 44, ry: 30, seed: 51 }],
};

// 지도 위 기관 위치
export const POS = {
  plaza: [1500, 1010], inn: [1405, 950], workshop: [1585, 935], "tabularium-branch": [1590, 1085], limen: [1330, 1110], vigilia: [1660, 1010],
  aurora: [2560, 1000], spring: [2420, 1170], nest: [2490, 1360], "ash-altar": [2650, 1170],
  somnium: [1060, 1480], lantern: [1380, 1420], mortar: [1150, 1640], "shadow-palace": [880, 1580], avallach: [960, 1730], conventus: [1550, 1560],
  flumen: [640, 1010], cursus: [500, 1120], mercator: [780, 1150], pier: [860, 990], "bell-tower": [330, 1300], abyss: [620, 1250], "glass-tower": [980, 1270],
  hortus: [1950, 1490], "herb-shop": [2160, 1440], greenhouse: [2240, 1600], "golden-garden": [1820, 1660],
  fornax: [2040, 520], arena: [1900, 640], "spear-hill": [2240, 640], crater: [2260, 380],
  tonans: [1400, 520], concilium: [1240, 600], tabularium: [1660, 455], ordo: [1660, 610], "storm-watch": [1150, 420], "garuda-tower": [1400, 385],
  profundum: [560, 470], "closed-door": [690, 560], "deep-bottom": [470, 330],
};

const regionPts = {};
for (const [id, g] of Object.entries(GEO)) regionPts[id] = coast({ ...g, n: 120 });

const isletPts = (id) => (ISLETS[id] || []).map((s) => coast({ ...s, rough: 0.25, n: 40 }));

// 대륙 안쪽 임의 점
function scatter(id, count, seed, margin = 0.86) {
  const g = GEO[id], pts = regionPts[id], inner = shrink(pts, margin, g.cx, g.cy);
  const R = rng(seed), out = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 40) {
    const p = [g.cx + (R() - 0.5) * g.rx * 2.4, g.cy + (R() - 0.5) * g.ry * 2.4];
    if (pointInPoly(p, inner)) out.push(p);
  }
  return out;
}
const nearSite = (p, id, d = 70) => Object.entries(POS).some(([k, q]) => Math.hypot(p[0] - q[0], p[1] - q[1]) < d);

// ── 손그림 기호 ──
const mountain = (x, y, s = 1, seed = 1) => {
  const R = rng(seed);
  const h = (34 + R() * 20) * s, w = (26 + R() * 12) * s;
  const peak = x + (R() - 0.5) * 6 * s;
  let o = `<path d="M${f1(x - w)},${f1(y)} L${f1(peak)},${f1(y - h)} L${f1(x + w)},${f1(y)}" fill="${PAPER}" stroke="${INK}" stroke-width="${f1(2 * s + 0.4)}" stroke-linejoin="round"/>`;
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    o += `<path d="M${f1(peak + (x + w - peak) * t)},${f1(y - h + h * t)} l${f1(-6 * s)},${f1(8 * s)}" stroke="${INK}" stroke-width="${f1(0.9 * s)}"/>`;
  }
  if (R() < 0.6) o += `<path d="M${f1(peak - 6 * s)},${f1(y - h + 12 * s)} L${f1(peak)},${f1(y - h)} L${f1(peak + 5 * s)},${f1(y - h + 10 * s)}" fill="#fbf6e8" stroke="${INK}" stroke-width="${f1(0.8 * s)}"/>`;
  return o;
};
const pine = (x, y, s = 1, c = "#6f7d55") => `<path d="M${f1(x)},${f1(y - 22 * s)} l${f1(-8 * s)},${f1(13 * s)} h${f1(4 * s)} l${f1(-6 * s)},${f1(9 * s)} h${f1(20 * s)} l${f1(-6 * s)},${f1(-9 * s)} h${f1(4 * s)}z" fill="${c}" stroke="${INK}" stroke-width="${f1(1.1 * s)}" stroke-linejoin="round"/><path d="M${f1(x)},${f1(y)} v${f1(-4 * s)}" stroke="${INK}" stroke-width="${f1(1.2 * s)}"/>`;
const bush = (x, y, s = 1, c = "#93a065") => `<path d="M${f1(x - 9 * s)},${f1(y)} c${f1(-4 * s)},${f1(-12 * s)} ${f1(8 * s)},${f1(-18 * s)} ${f1(10 * s)},${f1(-10 * s)} c${f1(4 * s)},${f1(-8 * s)} ${f1(14 * s)},${f1(-2 * s)} ${f1(9 * s)},${f1(10 * s)}z" fill="${c}" stroke="${INK}" stroke-width="${f1(1.1 * s)}"/>`;
const flower = (x, y, c) => `<g transform="translate(${f1(x)},${f1(y)})">${[0, 72, 144, 216, 288].map((r) => `<ellipse rx="2.6" ry="4.6" cy="-4" transform="rotate(${r})" fill="${c}" stroke="${INK}" stroke-width=".6"/>`).join("")}<circle r="1.8" fill="#e8c84a"/></g>`;
const fog = (x, y, w, seed) => {
  const R = rng(seed);
  let d = `M${f1(x)},${f1(y)}`;
  for (let i = 0; i < 4; i++) d += ` q${f1(w / 8)},${f1(-8 - R() * 6)} ${f1(w / 4)},0`;
  return `<path d="${d}" fill="none" stroke="#fbf8ef" stroke-width="7" stroke-linecap="round" opacity=".8"/><path d="${d}" fill="none" stroke="${INK}" stroke-width=".8" stroke-dasharray="2 6" opacity=".6"/>`;
};
const town = (x, y, seed, s = 1) => {
  const R = rng(seed);
  let o = "";
  for (let i = 0; i < 4; i++) {
    const bx = x + (i - 1.5) * 9 * s, h = (8 + R() * 8) * s;
    o += `<path d="M${f1(bx - 4 * s)},${f1(y)} v${f1(-h)} l${f1(4 * s)},${f1(-5 * s)} l${f1(4 * s)},${f1(5 * s)} v${f1(h)}z" fill="${PAPER}" stroke="${INK}" stroke-width="${f1(1 * s)}"/>`;
  }
  return o;
};
function river(points, seed, w = 3) {
  const R = rng(seed);
  const pts = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i], [x2, y2] = points[i + 1];
    for (let k = 0; k < 4; k++) {
      const t = k / 4;
      pts.push([x1 + (x2 - x1) * t + (R() - 0.5) * 22, y1 + (y2 - y1) * t + (R() - 0.5) * 22]);
    }
  }
  pts.push(points[points.length - 1]);
  const d = smoothOpen(pts);
  return `<path d="${d}" fill="none" stroke="#7fa7b5" stroke-width="${w + 3}" stroke-linecap="round" opacity=".55"/><path d="${d}" fill="none" stroke="${INK}" stroke-width="${f1(w * 0.55)}" stroke-linecap="round"/>`;
}
const wall = (pts, seed) => {
  const d = smoothClosed(pts);
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="5"/><path d="${d}" fill="none" stroke="${PAPER}" stroke-width="2.4" stroke-dasharray="7 5"/>`;
};

// ── 지역별 지형 ──
function terrain(id) {
  const g = GEO[id], pts = regionPts[id];
  let o = "";
  // 등고선
  const ccx = g.cx + g.rx * 0.08, ccy = g.cy - g.ry * 0.05;
  [0.82, 0.62, 0.42].forEach((k, i) => {
    o += `<path d="${smoothClosed(shrink(pts, k, ccx, ccy, 0.08, i + g.seed))}" fill="none" stroke="${INK}" stroke-width="${1.1 - i * 0.2}" stroke-dasharray="${i === 0 ? "1 0" : "5 4"}" opacity="${0.45 - i * 0.08}"/>`;
  });
  const S = (n, seed, m) => scatter(id, n, seed, m).filter((p) => !nearSite(p, id, 64));
  switch (id) {
    case "concordia": {
      // 일곱 갈래 길
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 - 1.6;
        o += `<path d="${wobbleLine(g.cx, g.cy, g.cx + Math.cos(a) * g.rx * 0.95, g.cy + Math.sin(a) * g.ry * 0.95, i + 9, 6, 5)}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="7 5"/>`;
      }
      for (const [x, y] of S(10, 4, 0.8)) o += town(x, y, x + y, 0.9);
      for (const [x, y] of S(8, 5, 0.9)) o += bush(x, y, 0.8);
      o += river([[g.cx + 40, g.cy - 150], [g.cx + 20, g.cy - 60], [g.cx - 60, g.cy + 40], [g.cx - 170, g.cy + 120]], 3, 3);
      break;
    }
    case "jupiter": {
      o += wall(shrink(pts, 0.9, g.cx, g.cy, 0.02, 3), 1) + wall(shrink(pts, 0.62, g.cx - 40, g.cy - 10, 0.02, 4), 2) + wall(shrink(pts, 0.34, g.cx - 40, g.cy - 20, 0.02, 5), 3);
      for (const [x, y] of shrink(pts, 0.9, g.cx, g.cy).filter((_, i) => i % 10 === 0)) o += `<path d="M${f1(x - 6)},${f1(y + 4)} v-16 h12 v16z" fill="${PAPER}" stroke="${INK}" stroke-width="1.4"/><path d="M${f1(x - 8)},${f1(y - 12)} l8,-9 l8,9z" fill="#8b6cc4" stroke="${INK}" stroke-width="1.2"/>`;
      for (const [x, y] of S(8, 7, 0.95)) o += mountain(x, y, 0.6, x);
      for (let i = 0; i < 6; i++) o += `<path d="M${f1(g.cx - 300 + i * 120)},${f1(g.cy - 160)} q20,-14 40,0 q16,-10 30,2" fill="none" stroke="${INK}" stroke-width="1.2" opacity=".6"/>`;
      o += river([[g.cx + 260, g.cy - 100], [g.cx + 180, g.cy + 40], [g.cx + 80, g.cy + 190]], 6, 3);
      break;
    }
    case "martialis": {
      const ridge = S(26, 11, 0.85).sort((a, b) => a[1] - b[1]);
      for (const [x, y] of ridge) o += mountain(x, y, 0.9 + (x % 7) / 14, x * 3 + y);
      o += river([[g.cx + 120, g.cy - 90], [g.cx + 40, g.cy + 40], [g.cx - 80, g.cy + 160], [g.cx - 120, g.cy + 260]], 12, 3).replaceAll("#7fa7b5", "#d9714f");
      for (const [x, y] of S(6, 13, 0.9)) o += `<path d="M${f1(x)},${f1(y)} q-4,-10 2,-16 q4,-6 0,-12" fill="none" stroke="#7a6d66" stroke-width="2"/>`;
      break;
    }
    case "arcadia": {
      // 절벽 빗금
      pts.forEach(([x, y], i) => {
        if (i % 2) return;
        const dx = x - g.cx, dy = y - g.cy, L = Math.hypot(dx, dy);
        o += `<path d="M${f1(x - (dx / L) * 4)},${f1(y - (dy / L) * 4)} l${f1((-dx / L) * 18)},${f1((-dy / L) * 18)}" stroke="${INK}" stroke-width="1.1"/>`;
      });
      for (const [x, y] of S(8, 17, 0.8)) o += mountain(x, y, 0.55, x).replaceAll(PAPER, "#fbf6e8");
      for (const [x, y] of S(12, 18, 0.8)) o += bush(x, y, 0.7, "#c9c27a");
      o += river([[g.cx - 20, g.cy - 80], [g.cx - 120, g.cy + 20], [g.cx - 200, g.cy + 40]], 19, 2.6);
      break;
    }
    case "lunatica": {
      for (const [x, y] of S(90, 23, 0.92)) o += pine(x, y, 0.9 + ((x * y) % 5) / 10, "#5b6a7e");
      for (const [x, y] of S(7, 24, 0.8)) o += fog(x - 50, y, 110, x);
      for (const [x, y] of S(30, 25, 0.9)) o += `<circle cx="${f1(x)}" cy="${f1(y)}" r="2" fill="#f2d27a" stroke="${INK}" stroke-width=".5"/>`;
      o += river([[g.cx + 60, g.cy - 200], [g.cx - 40, g.cy - 40], [g.cx - 220, g.cy + 80], [g.cx - 340, g.cy + 230]], 26, 3);
      break;
    }
    case "mercurius": {
      // 운하 격자
      const R = rng(29);
      for (let i = -3; i <= 3; i++) {
        const y = g.cy + i * 60;
        o += `<path d="${wobbleLine(g.cx - g.rx * 0.95, y + R() * 10, g.cx + g.rx * 0.95, y - R() * 10, i + 30, 4, 8)}" fill="none" stroke="#7fa7b5" stroke-width="7" opacity=".7"/>`;
      }
      for (let i = -3; i <= 3; i++) {
        const x = g.cx + i * 80;
        o += `<path d="${wobbleLine(x, g.cy - g.ry * 0.95, x + 30, g.cy + g.ry * 0.95, i + 40, 4, 8)}" fill="none" stroke="#7fa7b5" stroke-width="5" opacity=".6"/>`;
      }
      o = `<g clip-path="url(#clip-mercurius)">${o}</g>`;
      for (const [x, y] of S(16, 31, 0.85)) o += town(x, y, x, 0.8);
      for (const [x, y] of S(10, 32, 0.85)) o += `<path d="M${f1(x - 8)},${f1(y)} q8,-8 16,0" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
      break;
    }
    case "venustas": {
      const C = ["#e39ab8", "#f2c96b", "#d97b6c", "#fbf6e8", "#c88ad8"];
      for (const [x, y] of S(140, 33, 0.93)) o += flower(x, y, C[Math.floor(x + y) % 5]);
      for (const [x, y] of S(10, 34, 0.85)) o += bush(x, y, 1, "#8fa968");
      // 방사형 정원 구획
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        o += `<path d="M${f1(g.cx + Math.cos(a) * 40)},${f1(g.cy + Math.sin(a) * 28)} L${f1(g.cx + Math.cos(a) * 150)},${f1(g.cy + Math.sin(a) * 100)}" stroke="${INK}" stroke-width=".9" stroke-dasharray="3 3" opacity=".7"/>`;
      }
      o += river([[g.cx + 260, g.cy - 160], [g.cx + 120, g.cy - 40], [g.cx + 60, g.cy + 120], [g.cx + 120, g.cy + 240]], 35, 3);
      break;
    }
    case "saturnus": {
      o += `<ellipse cx="${g.cx - 70}" cy="${g.cy - 110}" rx="90" ry="44" fill="#1c1820" stroke="${INK}" stroke-width="3"/>`;
      for (let i = 1; i < 4; i++) o += `<ellipse cx="${g.cx - 70}" cy="${g.cy - 110 + i * 3}" rx="${90 - i * 20}" ry="${44 - i * 10}" fill="none" stroke="#6a5a4a" stroke-width="1.2"/>`;
      for (const [x, y] of S(12, 41, 0.9)) o += mountain(x, y, 0.55, x).replaceAll(PAPER, "#d6c7a6");
      for (const [x, y] of S(14, 42, 0.9)) o += `<path d="M${f1(x)},${f1(y)} l6,-8 l4,5 l8,-12" fill="none" stroke="${INK}" stroke-width="1.1"/>`;
      for (const [x, y] of S(5, 43, 0.8)) o += `<path d="M${f1(x - 10)},${f1(y)} v-12 M${f1(x)},${f1(y)} v-16 M${f1(x + 10)},${f1(y)} v-9 M${f1(x - 14)},${f1(y)} h28" stroke="${INK}" stroke-width="1.6"/>`;
      break;
    }
  }
  return o;
}

// ── 바다와 장식 ──
function compass(x, y, r, big = true) {
  let o = `<g transform="translate(${x},${y})">`;
  if (big) {
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      o += `<path d="M0,0 L${f1(Math.cos(a) * 3000)},${f1(Math.sin(a) * 3000)}" stroke="${INK}" stroke-width="${i % 4 ? 0.5 : 0.9}" opacity=".35"/>`;
    }
  }
  o += `<circle r="${r}" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/><circle r="${r * 0.86}" fill="none" stroke="${INK}" stroke-width="1"/>`;
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    o += `<path d="M${f1(Math.cos(a) * r * 0.86)},${f1(Math.sin(a) * r * 0.86)} L${f1(Math.cos(a) * r * (i % 8 ? 0.93 : 1))},${f1(Math.sin(a) * r * (i % 8 ? 0.93 : 1))}" stroke="${INK}" stroke-width="1"/>`;
  }
  const pt = (a, L, w, fill) => `<path d="M0,0 L${f1(Math.cos(a - w) * L * 0.3)},${f1(Math.sin(a - w) * L * 0.3)} L${f1(Math.cos(a) * L)},${f1(Math.sin(a) * L)} L${f1(Math.cos(a + w) * L * 0.3)},${f1(Math.sin(a + w) * L * 0.3)}z" fill="${fill}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`;
  for (let i = 0; i < 8; i++) o += pt((i / 8) * Math.PI * 2 + Math.PI / 8, r * 0.62, 0.35, i % 2 ? "#a4372f" : PAPER);
  for (let i = 0; i < 4; i++) o += pt((i / 4) * Math.PI * 2 - Math.PI / 2, r * 0.84, 0.3, i === 0 ? "#c8a050" : PAPER) + `<path d="M0,0 L${f1(Math.cos((i / 4) * Math.PI * 2 - Math.PI / 2) * r * 0.84)},${f1(Math.sin((i / 4) * Math.PI * 2 - Math.PI / 2) * r * 0.84)}" stroke="${INK}" stroke-width="1"/>`;
  o += `<circle r="${r * 0.08}" fill="#c8a050" stroke="${INK}" stroke-width="1.2"/>`;
  if (big) ["N", "E", "S", "W"].forEach((t, i) => {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    o += `<text x="${f1(Math.cos(a) * r * 1.18)}" y="${f1(Math.sin(a) * r * 1.18 + 12)}" text-anchor="middle" font-family="Cinzel Decorative, serif" font-size="${r * 0.26}" fill="${INK}">${t}</text>`;
  });
  return o + `</g>`;
}
const ship = (x, y, s = 1, flip = 1) => `<g transform="translate(${x},${y}) scale(${s * flip},${s})"><path d="M-40,0 q40,16 80,0 l-6,-10 h-68z" fill="#8e6a44" stroke="${INK}" stroke-width="2"/><path d="M-4,-10 v-60 M20,-10 v-44" stroke="${INK}" stroke-width="2"/><path d="M-4,-66 q20,14 0,46 q-20,-14 0,-46z" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/><path d="M20,-52 q14,12 0,36 q-14,-10 0,-36z" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/><path d="M-4,-70 l14,4 l-14,4" fill="#a4372f" stroke="${INK}" stroke-width="1"/><path d="M-50,6 q8,-5 16,0 t16,0 M30,6 q8,-5 16,0 t16,0" fill="none" stroke="${INK}" stroke-width="1.2"/></g>`;
const serpent = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-90,0 q10,-40 30,0 M-40,0 q14,-54 40,0 M20,0 q12,-44 34,0" fill="#6f9a8a" stroke="${INK}" stroke-width="2.2"/><path d="M54,0 q14,-46 30,-50 q16,-2 18,10 q-6,2 -10,8 q-10,-4 -14,6 q-6,14 -8,26z" fill="#6f9a8a" stroke="${INK}" stroke-width="2.2"/><circle cx="92" cy="-42" r="2.4" fill="${INK}"/><path d="M-100,4 q10,-6 20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0" fill="none" stroke="${INK}" stroke-width="1.4"/>${[-80, -60, -30, -10, 30, 44].map((q) => `<path d="M${q},-14 l4,-8 l4,8" fill="none" stroke="${INK}" stroke-width="1"/>`).join("")}</g>`;
const whale = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-50,0 q4,-34 50,-34 q40,0 50,24 q14,-14 26,-10 q-10,8 -8,18 q10,6 6,14 q-12,-6 -24,-6 q-30,20 -100,-6z" fill="#8a9bb0" stroke="${INK}" stroke-width="2"/><circle cx="-26" cy="-14" r="2.2" fill="${INK}"/><path d="M-6,-36 q-6,-16 -14,-18 M-6,-36 q2,-18 10,-20" fill="none" stroke="${INK}" stroke-width="1.4"/><path d="M-60,6 q10,-6 20,0 t20,0 t20,0 t20,0 t20,0 t20,0" fill="none" stroke="${INK}" stroke-width="1.2"/></g>`;

function cartouche() {
  const x = 2590, y = 1830;
  return `<g transform="translate(${x},${y}) scale(.78)">
    <path d="M-300,-120 h600 q20,0 20,20 v200 q0,20 -20,20 h-600 q-20,0 -20,-20 v-200 q0,-20 20,-20z" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>
    <path d="M-286,-106 h572 v192 h-572z" fill="none" stroke="${INK}" stroke-width="1"/>
    <path d="M-330,-60 q-30,40 0,80 q-14,-40 0,-80z M330,-60 q30,40 0,80 q14,-40 0,-80z" fill="#a4372f" stroke="${INK}" stroke-width="1.6"/>
    <path d="M-120,-120 q120,-60 240,0" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
    <text x="0" y="-130" text-anchor="middle" font-family="serif" font-size="30" fill="#c8a050" stroke="${INK}" stroke-width=".6">✶</text>
    <text x="0" y="-36" text-anchor="middle" font-family="Cinzel Decorative, serif" font-weight="700" font-size="64" letter-spacing="10" fill="${INK}">AVALON</text>
    <text x="0" y="18" text-anchor="middle" font-family="Diphylleia, serif" font-size="34" letter-spacing="8" fill="${INK}">경계 너머의 세계 · 아발론 전도</text>
    <path d="M-200,40 h400" stroke="${INK}" stroke-width="1"/>
    <text x="0" y="74" text-anchor="middle" font-family="IM Fell English, serif" font-style="italic" font-size="24" fill="#5a4630">Tabula orbis Avalonis · anno sancto CCCCXII</text>
  </g>`;
}
function scaleBar() {
  let o = `<g transform="translate(140,1860)"><text x="0" y="-18" font-family="IM Fell English SC, serif" font-size="22" fill="${INK}">Leucae · 리유</text>`;
  for (let i = 0; i < 6; i++) o += `<rect x="${i * 50}" y="0" width="50" height="10" fill="${i % 2 ? PAPER : INK}" stroke="${INK}" stroke-width="1.4"/>`;
  for (let i = 0; i <= 6; i++) o += `<text x="${i * 50}" y="32" text-anchor="middle" font-family="IM Fell English, serif" font-size="16" fill="${INK}">${i * 10}</text>`;
  return o + `</g>`;
}
function border() {
  let o = [0,1,2,3,4,5].map((i) => `<rect x="${44 + i * 9}" y="${44 + i * 9}" width="${W - 88 - i * 18}" height="${H - 88 - i * 18}" fill="none" stroke="#7a5228" stroke-width="${20 - i * 3}" opacity=".06"/>`).join("") + `<rect x="18" y="18" width="${W - 36}" height="${H - 36}" fill="none" stroke="${INK}" stroke-width="6"/><rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
  // 위경도 눈금 띠
  for (let x = 40, i = 0; x < W - 40; x += 50, i++) o += `<rect x="${x}" y="28" width="50" height="12" fill="${i % 2 ? PAPER : INK}"/><rect x="${x}" y="${H - 40}" width="50" height="12" fill="${i % 2 ? INK : PAPER}"/>`;
  for (let y = 40, i = 0; y < H - 40; y += 50, i++) o += `<rect x="28" y="${y}" width="12" height="50" fill="${i % 2 ? PAPER : INK}"/><rect x="${W - 40}" y="${y}" width="12" height="50" fill="${i % 2 ? INK : PAPER}"/>`;
  o += `<rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="${INK}" stroke-width="1.2"/>`;
  // 모서리 장식
  const corner = (x, y, r) => `<g transform="translate(${x},${y}) rotate(${r})"><circle r="26" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><path d="M0,-18 L5,0 L0,18 L-5,0Z M-18,0 L0,5 L18,0 L0,-5Z" fill="#c8a050" stroke="${INK}" stroke-width="1"/></g>`;
  o += corner(34, 34, 0) + corner(W - 34, 34, 0) + corner(34, H - 34, 0) + corner(W - 34, H - 34, 0);
  return o;
}
function graticule() {
  let o = "";
  for (let i = 1; i < 8; i++) {
    const y = (H / 8) * i;
    o += `<path d="M40,${y} Q${W / 2},${y + (i - 4) * 22} ${W - 40},${y}" fill="none" stroke="${INK}" stroke-width=".8" opacity=".35"/>`;
    o += `<text x="56" y="${y - 6}" font-family="IM Fell English, serif" font-size="18" fill="${INK}" opacity=".7">${Math.abs(60 - i * 15)}°${i < 4 ? "N" : i > 4 ? "S" : ""}</text>`;
  }
  for (let i = 1; i < 12; i++) {
    const x = (W / 12) * i;
    o += `<path d="M${x},40 Q${x + (i - 6) * 30},${H / 2} ${x},${H - 40}" fill="none" stroke="${INK}" stroke-width=".8" opacity=".35"/>`;
    o += `<text x="${x + 6}" y="66" font-family="IM Fell English, serif" font-size="18" fill="${INK}" opacity=".7">${i * 30}°</text>`;
  }
  return o;
}
function seaWaves() {
  const R = rng(404);
  let o = "";
  for (let i = 0; i < 160; i++) {
    const x = 80 + R() * (W - 160), y = 80 + R() * (H - 160);
    if (Object.values(regionPts).some((p) => pointInPoly([x, y], shrink(p, 1.12, ...centerOf(p))))) continue;
    o += `<path d="M${f1(x)},${f1(y)} q6,-6 12,0 q6,-6 12,0" fill="none" stroke="${INK}" stroke-width="1" opacity=".55"/>`;
  }
  return o;
}
const centerOf = (p) => { const b = bbox(p); return [b.x + b.w / 2, b.y + b.h / 2]; };

// ── SVG 조립 ──
export function buildMap(REGIONS) {
  const allLand = Object.entries(regionPts);
  let defs = `<defs>`;
  defs += `<pattern id="paperTex" width="600" height="400" patternUnits="userSpaceOnUse"><image href="${stainURL(600, 400, 9)}" width="600" height="400"/></pattern>`;
  for (const [id, p] of allLand) defs += `<clipPath id="clip-${id}"><path d="${smoothClosed(p)}"/></clipPath>`;
  defs += `</defs>`;

  let sea = `<rect width="${W}" height="${H}" fill="${SEA}"/><rect width="${W}" height="${H}" fill="url(#paperTex)"/>`;
  sea += graticule() + compass(330, 1640, 120, true) + compass(2760, 240, 70, true);
  // 해안 물결선
  for (const [id, p] of allLand) {
    const c = [GEO[id].cx, GEO[id].cy];
    [1.05, 1.1, 1.17, 1.26].forEach((k, i) => (sea += `<path d="${smoothClosed(shrink(p, k, ...c, 0.01, i))}" fill="none" stroke="${INK}" stroke-width="${1.1 - i * 0.2}" ${i ? `stroke-dasharray="${3 + i * 3} ${4 + i * 2}"` : ""} opacity="${0.7 - i * 0.12}"/>`));
    for (const ip of isletPts(id)) {
      const ic = centerOf(ip);
      [1.15, 1.3].forEach((k, i) => (sea += `<path d="${smoothClosed(shrink(ip, k, ...ic))}" fill="none" stroke="${INK}" stroke-width=".8" ${i ? 'stroke-dasharray="4 5"' : ""} opacity=".6"/>`));
    }
  }
  sea += seaWaves();
  sea += ship(1000, 300, 1) + ship(2150, 1000, 0.8, -1) + ship(1300, 1880, 0.7) + serpent(1700, 1880, 1.1) + whale(2820, 900, 1) + serpent(180, 1000, 0.8);
  sea += `<text x="1500" y="1240" text-anchor="middle" font-family="IM Fell English SC, serif" font-size="30" letter-spacing="14" fill="${INK}" opacity=".7">MARE CONCORDIAE</text>`;
  sea += `<text x="1020" y="120" text-anchor="middle" font-family="IM Fell English, serif" font-style="italic" font-size="34" letter-spacing="6" fill="${INK}" opacity=".7">Oceanus Septentrionalis</text>`;
  sea += `<text x="2790" y="1880" text-anchor="end" font-family="Diphylleia, serif" font-size="28" fill="${INK}" opacity=".7">경계의 바다 ― 이 너머는 그리지 않았다</text>`;
  sea += scaleBar() + cartouche();

  // 대륙
  let land = "";
  for (const r of REGIONS) {
    const id = r.id, p = regionPts[id], d = smoothClosed(p), g = GEO[id];
    const islets = isletPts(id).map((ip) => smoothClosed(ip));
    let body = `<path class="land-fill" d="${d}" fill="${PAPER}"/>`;
    body += `<path d="${d}" fill="${r.color}" opacity="${id === "saturnus" ? 0.28 : 0.16}"/>`;
    body += `<path d="${d}" fill="url(#paperTex)"/>`;
    for (const ip of islets) body += `<path d="${ip}" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/><path d="${ip}" fill="${r.color}" opacity=".18"/>`;
    body += terrain(id);
    body += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round"/>`;
    body += `<path d="${smoothClosed(shrink(p, 0.975, g.cx, g.cy))}" fill="none" stroke="${INK}" stroke-width=".9" opacity=".7"/>`;
    land += `<g class="region" id="reg-${id}" data-id="${id}">${body}</g>`;
  }
  // 지역 이름 (대륙보다 위, 강조 시 함께 움직이도록 지역별로 묶는다)
  let labels = "";
  const LBL = { saturnus: [600, 700], jupiter: [1440, 760], martialis: [2180, 760], concordia: [1500, 1190], mercurius: [660, 1350], arcadia: [2470, 1540], lunatica: [1140, 1850], venustas: [1960, 1790] };
  for (const r of REGIONS) {
    const [x, y] = LBL[r.id];
    labels += `<g class="rlabel" id="lbl-${r.id}" transform="translate(${x},${y})">
      <path d="M-170,-34 h340 l-18,22 l18,22 h-340 l18,-22z" fill="${PAPER}" stroke="${INK}" stroke-width="2.2"/>
      <path d="M-150,-26 h300 M-150,2 h300" stroke="${INK}" stroke-width=".6" opacity=".5"/>
      <text y="-1" text-anchor="middle" font-family="Diphylleia, serif" font-size="30" fill="${INK}">${esc(r.name)}</text>
      <text y="42" text-anchor="middle" font-family="IM Fell English SC, serif" font-size="22" letter-spacing="8" fill="${INK}"><tspan fill="${r.color}" stroke="${INK}" stroke-width=".4" font-family="serif">${r.sym}</tspan> ${r.latin}</text>
    </g>`;
  }
  return { defs, sea, land, labels, frame: border() };
}

// 지역별 기관 표식(작은 그림 + 이름 띠)
export function buildSites(sites, REGIONS) {
  const col = Object.fromEntries(REGIONS.map((r) => [r.id, r.color]));
  const by = {};
  for (const s of sites) (by[s.region] ||= []).push(s);
  let o = "";
  for (const [rid, list] of Object.entries(by)) {
    o += `<g class="sites" id="sites-${rid}" data-region="${rid}">`;
    for (const s of list) {
      const [x, y] = POS[s.id] || [GEO[rid].cx, GEO[rid].cy];
      const k = rid === "concordia" ? 0.42 : 0.55;
      const label = s.mapName || s.name;
      const spoil = s.kind === "hidden";
      o += `<g class="site${spoil ? " spoiler" : ""}" data-site="${s.id}" transform="translate(${x},${y})" tabindex="-1" role="button" aria-label="${esc(label)}">
        <ellipse class="site-hit" cx="0" cy="${-45 * k}" rx="${62 * k}" ry="${80 * k}" fill="transparent"/>
        <g class="glyph" style="--k:${k}"><g transform="scale(${k})">${(GLYPH[s.icon] || GLYPH.plaza)(col[rid])}</g></g>
        <g class="site-label" transform="translate(0,${18})">
          <path d="M${-label.length * 8 - 18},0 h${label.length * 16 + 36} l-8,11 l8,11 h${-label.length * 16 - 36} l8,-11z" fill="#f4e9cd" stroke="${INK}" stroke-width="1.6"/>
          <text y="16" text-anchor="middle" font-family="Gowun Batang, serif" font-weight="700" font-size="15" fill="${INK}">${esc(label)}</text>
        </g>
      </g>`;
    }
    o += `</g>`;
  }
  return o;
}

export { regionPts, smoothClosed };
