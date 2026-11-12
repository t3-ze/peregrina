// 지도 위 기관 그림. 원점(0,0)이 땅에 닿는 밑변 가운데, 위쪽이 음수. 높이 약 120.
// 모든 그림은 종이색으로 속을 채운 뒤 잉크 선을 두르고, 지역색(a)은 지붕·깃발 같은 작은 면에만 쓴다.
const K = "#2c2015"; // 잉크
const P = "#f4e9cd"; // 종이
const P2 = "#e3d1a6"; // 그늘진 종이
const st = (w = 2) => `stroke="${K}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// 공통 바탕: 손으로 그은 땅과 빗금 그림자
const ground = (w = 56) =>
  `<path d="M${-w},0 C${-w * 0.5},-3 ${w * 0.4},3 ${w},0" fill="none" ${st(2.4)}/>` +
  Array.from({ length: Math.floor(w / 7) }, (_, i) => {
    const x = -w + 10 + i * 14;
    return `<path d="M${x},4 l-7,7" ${st(1)} fill="none"/>`;
  }).join("");
const win = (x, y, w = 6, h = 11) => `<path d="M${x - w / 2},${y + h} v${-h + w / 2} a${w / 2},${w / 2} 0 0 1 ${w},0 v${h - w / 2} z" fill="${K}"/>`;
const flag = (x, y, a, h = 22, dir = 1) => `<path d="M${x},${y} v${-h}" ${st(1.6)}/><path d="M${x},${y - h} q${9 * dir},-2 ${17 * dir},3 q${-6 * dir},4 0,8 q${-8 * dir},-4 ${-17 * dir},-3 z" fill="${a}" ${st(1.2)}/>`;
const bricks = (x, y, w, h, s = 9) => {
  let o = "";
  for (let r = 0; r * s < h; r++) for (let c = 0; c * 16 < w; c++) if ((r + c) % 3 === 0) o += `<path d="M${x + c * 16 + (r % 2) * 8},${y + r * s} h9" ${st(0.8)}/>`;
  return o;
};
const star = (x, y, r, fill) => `<path d="M${x},${y - r} L${x + r * 0.28},${y - r * 0.28} L${x + r},${y} L${x + r * 0.28},${y + r * 0.28} L${x},${y + r} L${x - r * 0.28},${y + r * 0.28} L${x - r},${y} L${x - r * 0.28},${y - r * 0.28}Z" fill="${fill}" ${st(1)}/>`;
const tree = (x, y, s = 1, a = "#7c8f5a") => `<path d="M${x},${y} v${-10 * s}" ${st(1.4)}/><path d="M${x},${y - 34 * s} c${-12 * s},${8 * s} ${-14 * s},${18 * s} ${-10 * s},${24 * s} c${6 * s},${2 * s} ${14 * s},${2 * s} ${20 * s},0 c${4 * s},${-6 * s} ${2 * s},${-16 * s} ${-10 * s},${-24 * s}z" fill="${a}" ${st(1.4)}/>`;
const waves = (y, w = 60) => `<path d="M${-w},${y} q7,-6 14,0 t14,0 t14,0 t14,0 t14,0 t14,0 t14,0 t14,0" fill="none" ${st(1.4)}/>`;

export const GLYPH = {
  plaza: (a) => ground(62) +
    `<ellipse cx="0" cy="-6" rx="46" ry="10" fill="${P2}" ${st(1.6)}/>` +
    `<path d="M-14,-6 v-16 h28 v16" fill="${P}" ${st(1.8)}/><ellipse cx="0" cy="-22" rx="14" ry="4" fill="#9cc3cf" ${st(1.4)}/>` +
    `<path d="M0,-26 v-10 M-5,-34 q5,-10 10,0" fill="none" ${st(1.4)}/>` +
    `<path d="M30,-4 v-58 h12 v58" fill="${P}" ${st(2)}/><path d="M28,-62 l8,-14 l8,14z" fill="${a}" ${st(1.6)}/><circle cx="36" cy="-48" r="4.5" fill="${P}" ${st(1.2)}/><path d="M36,-48 l2,-3" ${st(1)}/>` +
    `<path d="M-44,-4 q2,-14 12,-16 q8,2 10,16z" fill="#b9ad97" ${st(1.8)}/><path d="M-33,-20 l4,-14" ${st(1.4)}/>` +
    `<path d="M-60,-30 Q0,-44 60,-30" fill="none" ${st(1)} stroke-dasharray="2 4"/>` +
    ["#d9a43a", "#8c93d6", "#4f9cc4", "#d67fa4", "#c8573c", "#8b6cc4", "#a8875a"].map((c, i) => `<path d="M${-54 + i * 18},${-33 - Math.sin((i / 6) * Math.PI) * 8} l5,9 l5,-9z" fill="${c}" ${st(0.8)}/>`).join(""),
  inn: (a) => ground(50) +
    `<path d="M-40,0 v-44 h80 v44z" fill="${P}" ${st(2.2)}/>` + bricks(-38, -42, 76, 40) +
    `<path d="M-48,-42 L0,-80 L48,-42z" fill="${a}" ${st(2.2)}/><path d="M-20,-60 h40" ${st(1)}/>` +
    `<path d="M22,-66 v-22 h9 v14" fill="${P}" ${st(1.8)}/><path d="M26,-92 q4,-6 0,-12 q-4,-6 2,-12" fill="none" ${st(1)}/>` +
    win(-24, -36) + win(24, -36) + `<path d="M-8,0 v-20 a8,8 0 0 1 16,0 v20" fill="${K}"/>` +
    `<path d="M40,-30 h16 M52,-30 v10" ${st(1.6)}/><path d="M44,-20 h14 v10 h-14z" fill="${P}" ${st(1.4)}/><text x="51" y="-12" font-size="7" text-anchor="middle" fill="${K}">VII</text>`,
  workshop: (a) => ground(46) +
    `<path d="M-36,0 v-40 l18,-14 l18,14 l18,-14 l18,14 v40z" fill="${P}" ${st(2.2)}/>` +
    `<path d="M-36,-40 l18,-14 l18,14 l18,-14 l18,14" fill="none" stroke="${a}" stroke-width="6"/>` +
    `<path d="M20,-50 v-24 h10 v20" fill="${P}" ${st(1.8)}/>` +
    `<path d="M25,-78 l-6,-8 l9,-2 l-3,-9 l8,6 l4,-8 l1,10 l9,0 l-7,6" fill="#e3b23c" ${st(1.2)}/>` +
    `<circle cx="-14" cy="-22" r="8" fill="${P2}" ${st(1.6)}/><path d="M-14,-30 v16 M-22,-22 h16 M-19.6,-27.6 l11.2,11.2 M-19.6,-16.4 l11.2,-11.2" ${st(1.2)}/>` +
    `<path d="M6,0 v-22 h14 v22" fill="${K}"/>`,
  archive: (a) => ground(56) +
    `<path d="M-46,0 v-8 h92 v8z" fill="${P2}" ${st(1.8)}/>` +
    [-36, -18, 0, 18, 36].map((x) => `<path d="M${x - 4},-8 v-40 h8 v40" fill="${P}" ${st(1.6)}/>`).join("") +
    `<path d="M-50,-48 h100 v-8 h-100z" fill="${P}" ${st(2)}/><path d="M-52,-56 L0,-82 L52,-56z" fill="${a}" ${st(2.2)}/>` +
    `<circle cx="0" cy="-66" r="6" fill="${P}" ${st(1.4)}/><path d="M-3,-66 h6 M0,-69 v6" ${st(1)}/>` +
    `<path d="M-30,-22 h12 v14 h-12z M18,-22 h12 v14 h-12z" fill="${P2}" ${st(1)}/>`,
  "tower-sun": (a) => ground(52) +
    `<path d="M-48,0 v-26 h96 v26" fill="${P}" ${st(2)}/>` + [-36, -20, 20, 36].map((x) => win(x, -20, 7, 12)).join("") +
    `<path d="M-14,-26 L-10,-150 h20 L14,-26z" fill="${P}" ${st(2.4)}/>` +
    [-60, -90, -120].map((y) => win(0, y, 5, 12)).join("") +
    `<path d="M-12,-150 L0,-176 L12,-150z" fill="${a}" ${st(2)}/>` +
    `<circle cx="0" cy="-188" r="14" fill="#f0c95a" ${st(2)}/><circle cx="0" cy="-188" r="7" fill="none" ${st(1)}/>` +
    Array.from({ length: 12 }, (_, i) => { const t = (i / 12) * 6.283; return `<path d="M${Math.cos(t) * 18},${-188 + Math.sin(t) * 18} L${Math.cos(t) * (i % 2 ? 24 : 30)},${-188 + Math.sin(t) * (i % 2 ? 24 : 30)}" ${st(1.6)}/>`; }).join(""),
  spring: (a) => ground(52) +
    `<ellipse cx="-8" cy="-8" rx="38" ry="11" fill="#a9d0d6" ${st(2)}/><path d="M-32,-8 q8,-4 16,0 q8,4 16,0 q8,-4 16,0" fill="none" ${st(1)}/>` +
    `<path d="M-16,-12 q-2,-18 8,-30" fill="none" ${st(1)} stroke-dasharray="3 3"/>` +
    `<path d="M26,-4 h22 l-3,-8 h-16z" fill="${P2}" ${st(1.8)}/><path d="M28,-12 q9,-22 18,0" fill="${a}" ${st(1.8)}/>` +
    `<path d="M33,-30 q-4,-8 2,-14 q6,-6 0,-14 M41,-30 q4,-8 -2,-14" fill="none" ${st(1.2)}/>`,
  nest: (a) => ground(64) +
    `<path d="M-60,0 L-44,-46 L-24,-30 L-6,-78 L16,-40 L32,-58 L58,0z" fill="${P}" ${st(2.4)}/>` +
    `<path d="M-6,-78 l-6,22 l8,10 l-6,20 M32,-58 l-4,18 l6,14" fill="none" ${st(1.2)}/>` +
    `<path d="M-30,-6 q30,-18 60,0" fill="${P2}" ${st(2)}/>` +
    Array.from({ length: 7 }, (_, i) => `<path d="M${-24 + i * 8},-8 q4,-6 8,0" fill="${a}" ${st(1)}/>`).join("") +
    `<path d="M-6,-78 q14,-18 30,-8 q-10,2 -12,10" fill="${a}" ${st(1.6)}/>`,
  altar: (a) => ground(48) +
    `<path d="M-40,0 L-24,-34 L40,-8 L44,0z" fill="${P}" ${st(2.2)}/><path d="M-24,-34 L-12,-40 L50,-12 L40,-8" fill="${P2}" ${st(2)}/>` +
    `<path d="M-10,-40 h26 v-8 h-26z" fill="${P}" ${st(1.8)}/><path d="M-6,-48 q4,-14 8,-8 q4,-12 8,8z" fill="#e8823a" ${st(1.4)}/>` +
    `<path d="M-2,-66 c-14,-8 -18,10 -2,6 c-8,8 6,14 6,0 c8,8 16,-4 4,-6 c14,-8 0,-18 -8,0z" fill="${a}" ${st(1.2)}/>`,
  "tower-moon": (a) => ground(56) +
    `<path d="M-50,0 v-52 h100 v52z" fill="${P}" ${st(2.2)}/><path d="M-58,-50 L-30,-90 L30,-90 L58,-50z" fill="#3c4a7a" ${st(2.2)}/>` +
    `<path d="M-20,-90 v-14 h10 v14 M14,-90 v-10 h8 v10" fill="${P}" ${st(1.6)}/>` +
    [-34, -12, 12, 34].map((x) => `<path d="M${x - 5},-38 h10 v14 h-10z" fill="#f0d27a" ${st(1.4)}/>`).join("") +
    `<path d="M-6,0 v-18 h12 v18" fill="${K}"/>` +
    `<path d="M50,-60 l10,-10 l12,-8 l12,-10 l12,-14" fill="none" ${st(1.4)} stroke-dasharray="5 3"/>` +
    `<path d="M-8,-130 a18,18 0 1 0 22,-22 a14,14 0 1 1 -22,22z" fill="#ece4c4" ${st(1.8)}/>` + star(30, -128, 5, P) + star(-30, -112, 4, P),
  lantern: (a) => ground(40) +
    `<path d="M-6,0 v-80" ${st(3)}/><path d="M-6,-80 h22 v8" fill="none" ${st(2)}/>` +
    `<path d="M8,-72 h16 l-2,22 h-12z" fill="#f2c96b" ${st(1.8)}/><path d="M8,-72 l8,-6 l8,6" fill="${K}"/>` +
    `<path d="M16,-50 v6" ${st(1.2)}/>` + tree(-34, 0, 0.8, "#5e6f86") + tree(34, 0, 0.9, "#5e6f86") +
    `<path d="M-50,-30 q20,-8 40,0 q20,8 50,-4" fill="none" stroke="#fff" stroke-width="5" opacity=".7"/>`,
  mortar: (a) => ground(44) +
    `<path d="M-6,-150 h12 L26,-6 h-52z" fill="#f4efd6" opacity=".55"/>` +
    `<path d="M-24,0 q0,-26 24,-26 q24,0 24,26z" fill="${P}" ${st(2.2)}/><ellipse cx="0" cy="-26" rx="24" ry="6" fill="${P2}" ${st(1.6)}/>` +
    `<path d="M8,-30 l20,-40" ${st(5)}/><path d="M8,-30 l20,-40" stroke="${P}" stroke-width="2"/>` +
    `<circle cx="0" cy="-150" r="16" fill="#efe6c7" ${st(1.8)}/>` +
    [[-36, -10], [34, -12], [-28, -20]].map(([x, y]) => `<path d="M${x},${y} q-4,-8 0,-12 q4,4 0,12z M${x},${y} q4,-8 8,-6" fill="${a}" ${st(1)}/>`).join(""),
  palace: (a) => ground(62) +
    `<path d="M-56,0 v-40 h112 v40z" fill="#56607f" ${st(2.2)}/>` +
    [-44, -16, 16, 44].map((x) => `<path d="M${x - 8},-40 v-30 l8,-26 l8,26 v30" fill="#56607f" ${st(1.8)}/>` + win(x, -62, 5, 10)).join("") +
    `<path d="M-14,-40 v-50 l14,-40 l14,40 v50" fill="#45506e" ${st(2)}/>` +
    `<path d="M-6,0 v-22 a6,6 0 0 1 12,0 v22" fill="${K}"/>` +
    `<path d="M-70,-20 q30,-12 60,-2 q40,10 80,-6" fill="none" stroke="#eef" stroke-width="7" opacity=".55"/>` + star(0, -140, 6, P),
  apple: (a) => ground(56) +
    [-34, 0, 34].map((x, i) => `<path d="M${x},0 v-26" ${st(2.4)}/><path d="M${x},-28 c-22,0 -24,-30 -6,-36 c4,-14 22,-14 26,0 c18,6 14,36 -8,36z" fill="#8aa267" ${st(1.8)}/>` +
      [[-8, -44], [6, -50], [2, -34], [10, -40]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${dy - i * 2}" r="3.2" fill="#c8403a" ${st(0.8)}/>`).join("")).join("") +
    `<path d="M-60,-14 q30,-14 60,-4 q30,10 60,-4" fill="none" stroke="#fff" stroke-width="7" opacity=".6"/>`,
  "tower-water": (a) => waves(4, 64) +
    `<path d="M-60,-4 q60,22 120,0 l-8,-16 h-104z" fill="#8e6a44" ${st(2.2)}/>` +
    `<path d="M-44,-20 v-28 h40 v28 M4,-20 v-36 h40 v36" fill="${P}" ${st(2)}/>` +
    `<path d="M-48,-48 l22,-16 l22,16z M0,-56 l22,-18 l22,18z" fill="${a}" ${st(1.8)}/>` +
    [-34, -14, 14, 34].map((x) => win(x, -40, 6, 10)).join("") +
    `<path d="M-24,-64 v-70" ${st(3)}/><path d="M-24,-130 h20 v14 h-20z" fill="${P}" ${st(1.6)}/>` + flag(-24, -134, a, 14) +
    `<path d="M-24,-110 q22,6 36,22 M-24,-90 q30,6 40,26" fill="none" ${st(1)}/>`,
  post: (a) => ground(52) +
    `<path d="M-44,0 v-50 h88 v50z" fill="${P}" ${st(2.2)}/>` + bricks(-42, -48, 84, 46) +
    `<path d="M-50,-50 h100 l-10,-16 h-80z" fill="${a}" ${st(2)}/>` +
    `<path d="M-10,-66 v-22 h20 v22" fill="${P}" ${st(1.8)}/><circle cx="0" cy="-78" r="6" fill="${P}" ${st(1.2)}/>` +
    `<path d="M-30,-34 h22 v14 h-22z" fill="${P}" ${st(1.6)}/><path d="M-30,-34 l11,8 l11,-8" fill="none" ${st(1.2)}/>` +
    `<path d="M6,0 v-24 h20 v24" fill="${K}"/>` +
    `<path d="M40,-80 q8,-8 14,0 q-6,2 -6,6 q-4,-4 -8,-6z M56,-96 q6,-6 12,0 q-5,2 -5,5 q-3,-3 -7,-5z" fill="${P}" ${st(1)}/>`,
  market: (a) => waves(6, 64) +
    `<path d="M-60,-6 q60,-60 120,0" fill="none" ${st(4)}/><path d="M-60,-6 q60,-60 120,0" fill="none" stroke="${P}" stroke-width="1.6"/>` +
    [-40, -14, 14, 40].map((x, i) => `<path d="M${x - 11},${-18 - (i === 1 || i === 2 ? 14 : 0)} v-14 h22 v14" fill="${P}" ${st(1.6)}/><path d="M${x - 14},${-32 - (i === 1 || i === 2 ? 14 : 0)} l14,-10 l14,10z" fill="${i % 2 ? a : "#c98b4a"}" ${st(1.4)}/>`).join(""),
  gondola: (a) => waves(6, 60) +
    `<path d="M-52,-6 q52,16 100,-4 q6,-12 10,-20 q-6,10 -16,14 q-40,10 -94,0z" fill="#2b2a38" ${st(1.8)}/>` +
    `<path d="M20,-16 l14,-40" ${st(2.4)}/><path d="M-36,-14 h18 v-14 h-18z" fill="${a}" ${st(1.4)}/>` +
    `<path d="M-60,-30 v-20 M-60,-50 h-6 M60,-24 v-26" ${st(2)}/>` + flag(56, -50, a, 10),
  belltower: (a) => waves(4, 60) + waves(14, 50) +
    `<path d="M-18,-2 v-50 h36 v50" fill="${P}" ${st(2.2)}/><path d="M-22,-52 L0,-84 L22,-52z" fill="${a}" ${st(2)}/>` +
    `<path d="M-8,-36 a8,8 0 0 1 16,0 v8 h-16z" fill="${K}"/><path d="M-6,-30 q6,-10 12,0 l2,6 h-16z" fill="#d7b25a" ${st(1)}/>` +
    `<path d="M-60,-2 h120" stroke="#6aa3c2" stroke-width="3" opacity=".5"/>` + `<path d="M0,-84 v-10" ${st(1.4)}/>` +
    `<path d="M24,-14 q10,-18 24,-10 q-4,10 -18,8" fill="#6f9a8a" ${st(1.4)}/>`,
  abyss: (a) => waves(-30, 58) + waves(-14, 64) +
    `<path d="M-50,0 a50,18 0 1 0 100,0 a50,18 0 1 0 -100,0z" fill="#21304a" ${st(2.2)}/>` +
    `<path d="M-32,0 a32,11 0 1 0 64,0 a32,11 0 1 0 -64,0z M-16,0 a16,5 0 1 0 32,0 a16,5 0 1 0 -32,0z" fill="none" stroke="#9cc3cf" stroke-width="1.4"/>` +
    `<path d="M30,-6 q20,-30 6,-50 q16,10 12,30 q-2,14 -18,20z" fill="${a}" ${st(1.6)}/>`,
  glass: (a) => ground(40) +
    `<path d="M-16,0 L-10,-140 L0,-170 L10,-140 L16,0z" fill="#d6ecef" fill-opacity=".75" ${st(2)}/>` +
    `<path d="M-14,-40 L14,-40 M-13,-80 L13,-80 M-11,-120 L11,-120 M0,-170 V0" ${st(0.9)}/>` +
    `<path d="M-30,-60 l10,-6 l2,8z M24,-100 l10,-4 l0,8z M-26,-130 l9,-3 l1,7z M28,-150 l10,-6 l1,8z" fill="${P}" ${st(1)}/>` +
    `<text x="0" y="-182" font-size="22" text-anchor="middle" font-family="Cinzel Decorative, serif" fill="${K}">?</text>`,
  dome: (a) => ground(62) +
    `<path d="M-56,0 v-24 h112 v24z" fill="${P}" ${st(2)}/>` +
    `<path d="M-48,-24 a48,48 0 0 1 96,0z" fill="#cfe5d9" fill-opacity=".85" ${st(2.4)}/>` +
    `<path d="M-48,-24 Q0,-58 48,-24 M-34,-56 Q0,-40 34,-56 M0,-72 V-24 M-24,-66 Q-20,-44 -26,-24 M24,-66 Q20,-44 26,-24" fill="none" ${st(1)}/>` +
    `<path d="M0,-50 v-40" ${st(2.4)}/>` + `<path d="M0,-88 c-18,-4 -26,-22 -8,-26 c2,-14 18,-12 18,0 c16,2 14,24 -10,26z" fill="#6f8f4f" ${st(1.6)}/>` +
    [-44, -28, 28, 44].map((x) => `<path d="M${x},-6 q-3,-8 0,-10 q3,2 0,10z" fill="${a}" ${st(0.8)}/>`).join(""),
  herb: (a) => ground(42) +
    `<path d="M-30,0 v-34 h50 v34z" fill="${P}" ${st(2)}/><path d="M-36,-34 q20,-30 62,-6 v6z" fill="#7e9a5b" ${st(2)}/>` +
    `<path d="M-20,-28 h14 v12 h-14z" fill="${P2}" ${st(1.2)}/><path d="M2,0 v-18 h12 v18" fill="${K}"/>` +
    `<path d="M24,-10 q4,-8 10,-8 q4,4 4,8z" fill="${K}"/><path d="M36,-18 l3,-5 l2,5" fill="${K}"/>` +
    [-26, -16, -6, 4, 14].map((x) => `<path d="M${x},-34 v8 m-2,0 l2,4 l2,-4" ${st(1)} fill="none"/>`).join(""),
  greenhouse: (a) => ground(52) +
    `<path d="M-44,0 v-36 l44,-30 l44,30 v36z" fill="#d3e4d6" fill-opacity=".6" ${st(2.2)}/>` +
    `<path d="M-44,-36 h88 M-22,0 v-51 M0,0 v-66 M22,0 v-51" ${st(1.2)}/>` +
    `<path d="M4,-58 l10,4 l-6,6z M-30,-30 l8,-2 l-2,8z" fill="${P}" ${st(1)}/>` +
    `<path d="M-46,0 q-4,-30 12,-40 q-2,18 8,26 M46,0 q8,-26 -6,-46 q-6,22 -14,30" fill="none" stroke="#5f7d45" stroke-width="3"/>` +
    `<path d="M-6,-10 q6,-14 12,0 q-6,4 -12,0z" fill="${a}" ${st(1)}/>`,
  tree: (a) => ground(52) +
    `<path d="M-6,0 q4,-30 -2,-50 h12 q-6,20 -2,50z" fill="#8a6440" ${st(2)}/>` +
    `<path d="M0,-44 c-50,6 -56,-44 -22,-56 c4,-30 46,-30 48,0 c34,12 26,58 -26,56z" fill="#a7b46a" ${st(2.2)}/>` +
    [[-24, -70], [-6, -86], [14, -76], [26, -58], [-14, -54], [6, -62], [-30, -86]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#e7b83a" ${st(1)}/>`).join(""),
  forge: (a) => {
    let o = `<path d="M-64,0 L-40,-20 L-14,-40 L14,-60 L40,-80 L64,-96" fill="none" ${st(2.4)}/>`;
    [[-50, -6], [-26, -26], [0, -46], [26, -66], [50, -84]].forEach(([x, y], i) => {
      o += `<path d="M${x - 12},${y} v-18 h24 v18z" fill="${P}" ${st(1.8)}/><path d="M${x - 14},${y - 18} l14,-10 l14,10z" fill="${a}" ${st(1.4)}/>` +
        `<path d="M${x + 6},${y - 22} v-14 h6 v10" fill="#a8533a" ${st(1.4)}/><path d="M${x + 9},${y - 40} q-4,-8 2,-14 q6,-8 0,-16" fill="none" stroke="#7a6d66" stroke-width="2"/>` + win(x - 4, y - 12, 5, 8);
    });
    return o;
  },
  arena: (a) => ground(56) +
    `<path d="M-50,0 v-34 a50,14 0 0 1 100,0 v34z" fill="${P}" ${st(2.2)}/><path d="M-50,-34 a50,14 0 0 0 100,0" fill="none" ${st(1.6)}/>` +
    [-40, -24, -8, 8, 24, 40].map((x) => `<path d="M${x - 4},-4 v-14 a4,4 0 0 1 8,0 v14" fill="${K}"/>`).join("") +
    flag(-46, -44, a, 18) + flag(46, -44, a, 18, -1),
  spears: (a) => ground(56) +
    `<path d="M-56,0 q56,-40 112,0" fill="${P2}" ${st(2)}/>` +
    [[-38, 6], [-24, -4], [-10, 4], [4, -6], [18, 3], [32, -3], [44, 6]].map(([x, t]) => `<path d="M${x},${-12} l${t * 0.4},-64" ${st(1.8)}/><path d="M${x + t * 0.4},-76 l-4,8 l4,10 l4,-10z" fill="${P}" ${st(1.2)}/>`).join("") +
    `<path d="M-4,-16 q4,-6 8,0" ${st(1.4)} fill="${P}"/>` + `<path d="M-60,-50 q20,-10 40,-4 q16,4 30,-2" fill="none" ${st(1)} stroke-dasharray="4 4"/>`,
  volcano: (a) => ground(64) +
    `<path d="M-64,0 L-18,-80 h36 L64,0z" fill="#9b6b54" ${st(2.4)}/>` +
    `<path d="M-18,-80 q18,10 36,0" fill="#e8823a" ${st(1.8)}/>` +
    `<path d="M-6,-78 q-4,20 -14,34 M8,-78 q4,24 14,40" fill="none" stroke="#e8823a" stroke-width="3.5"/>` +
    `<path d="M-40,-30 l6,-4 M-30,-48 l8,-3 M26,-30 l8,-4 M34,-14 l8,-2" ${st(1)}/>` +
    `<path d="M0,-84 q-16,-22 0,-36 q20,-14 6,-34 M-12,-100 q-14,-8 -6,-22" fill="none" stroke="#7a6d66" stroke-width="3"/>` +
    `<path d="M-2,-104 q-6,-14 4,-20 q-2,10 6,12 q4,-8 0,-14 q12,10 2,24z" fill="#f2a443" ${st(1.2)}/>`,
  keep: (a) => ground(56) +
    `<path d="M-44,0 v-60 h88 v60z" fill="#b8b5ae" ${st(2.2)}/>` + bricks(-42, -58, 84, 56, 10) +
    [-44, 44].map((x) => `<path d="M${x - 9},0 v-80 h18 v80z" fill="#b8b5ae" ${st(2)}/><path d="M${x - 11},-80 L${x},-104 L${x + 11},-80z" fill="${a}" ${st(1.8)}/><path d="M${x},-104 v-10" ${st(1.4)}/>`).join("") +
    `<path d="M-12,-60 v-50 h24 v50" fill="#c8c4bb" ${st(2)}/><path d="M-14,-110 h28 l-4,-8 h-20z" fill="${a}" ${st(1.6)}/>` +
    `<path d="M0,-118 v-14 l-6,8 l8,0 l-6,10" fill="none" stroke="#e8c84a" stroke-width="2.4"/>` +
    `<path d="M-8,0 v-20 a8,8 0 0 1 16,0 v20" fill="${K}"/>` + win(0, -96, 6, 12),
  council: (a) => ground(62) +
    `<path d="M-56,0 v-10 h112 v10z" fill="${P2}" ${st(1.8)}/>` +
    [-44, -26, -8, 8, 26, 44].map((x) => `<path d="M${x - 3},-10 v-36 h6 v36" fill="${P}" ${st(1.4)}/>`).join("") +
    `<path d="M-56,-46 h112 v-8 h-112z" fill="${P}" ${st(2)}/>` +
    `<path d="M-36,-54 a36,30 0 0 1 72,0z" fill="${a}" ${st(2.2)}/><path d="M0,-84 v-14" ${st(1.6)}/>` + star(0, -102, 6, "#e8c84a") +
    `<path d="M-36,-54 Q0,-70 36,-54" fill="none" ${st(1)}/>`,
  barracks: (a) => ground(56) +
    `<path d="M-48,0 v-46 h96 v46z" fill="#c5bfb2" ${st(2.2)}/>` +
    Array.from({ length: 7 }, (_, i) => `<path d="M${-48 + i * 16},-46 v-8 h8 v8" fill="#c5bfb2" ${st(1.6)}/>`).join("") +
    `<path d="M-10,0 v-26 a10,10 0 0 1 20,0 v26" fill="${K}"/>` + flag(-30, -54, a, 24) + flag(30, -54, a, 24, -1) +
    `<path d="M-30,-30 l8,-8 M-22,-30 l-8,-8 M22,-30 l8,-8 M30,-30 l-8,-8" ${st(1.6)}/>`,
  watchtower: (a) => ground(44) +
    `<path d="M-16,0 L-12,-86 h24 L16,0z" fill="#b8b5ae" ${st(2.2)}/>` +
    `<path d="M-12,-86 v-8 h6 v8 M-2,-86 v-6 h5 v6 M8,-86 v-10 h4" fill="#b8b5ae" ${st(1.4)}/>` +
    `<path d="M2,-40 l10,10 l-4,14 l12,4" fill="none" ${st(1.2)}/>` +
    `<path d="M-40,-118 c-6,-14 12,-22 18,-12 c6,-14 28,-10 26,4 c14,0 14,18 0,18 h-40 c-12,0 -14,-12 -4,-10z" fill="#7d7a8c" ${st(1.8)}/>` +
    `<path d="M-6,-100 l-6,12 h8 l-6,14" fill="none" stroke="#e8c84a" stroke-width="2.6"/>`,
  spire: (a) => ground(48) +
    `<path d="M-30,0 L-10,-150 h20 L30,0z" fill="#b8b5ae" ${st(2.4)}/>` +
    `<path d="M-24,-40 h48 M-19,-80 h38 M-14,-120 h28" ${st(1.2)}/>` + win(0, -60, 6, 12) + win(0, -100, 5, 10) +
    `<path d="M-14,-150 h28 l-14,-24z" fill="${a}" ${st(1.8)}/>` +
    `<path d="M0,-176 c-30,-6 -44,-24 -50,-34 c14,6 26,8 34,4 c-8,-8 -12,-18 -12,-26 c10,12 20,20 28,22 c8,-2 18,-10 28,-22 c0,8 -4,18 -12,26 c8,4 20,2 34,-4 c-6,10 -20,28 -50,34z" fill="#d9a43a" ${st(1.6)}/>`,
  library: (a) => ground(56) +
    `<path d="M-30,0 v-24 h60 v24" fill="#9a9086" ${st(2.2)}/>` +
    `<path d="M-10,0 v-16 a10,10 0 0 1 20,0 v16" fill="${K}"/>` +
    `<path d="M-38,-24 h76 l-8,-10 h-60z" fill="${a}" ${st(2)}/>` +
    `<path d="M22,-34 q6,-14 16,-12 l-2,6 q8,0 6,8 h-20z" fill="#857b72" ${st(1.4)}/><path d="M26,-46 l-6,-6 M34,-48 l4,-8" ${st(1.2)}/>` +
    `<path d="M-46,4 h92 v60 h-92z" fill="#2a2430" opacity=".9"/>` +
    [14, 28, 42, 56].map((y) => `<ellipse cx="0" cy="${y}" rx="${30 - y * 0.25}" ry="4" fill="none" stroke="#d7b25a" stroke-width="1.4"/>`).join(""),
  door: (a) => ground(44) +
    `<path d="M-34,0 v-56 a34,30 0 0 1 68,0 v56z" fill="#9a9086" ${st(2.4)}/>` +
    `<path d="M-24,0 v-52 a24,22 0 0 1 48,0 v52z" fill="#5a4e46" ${st(1.8)}/><path d="M0,-74 V0" ${st(1.6)}/>` +
    `<circle cx="0" cy="-40" r="7" fill="${a}" ${st(1.4)}/><path d="M-3,-40 h6" ${st(1)}/>` +
    `<path d="M-42,-10 q-10,-30 6,-50 M42,-10 q10,-30 -6,-50" fill="none" ${st(1.2)} stroke-dasharray="3 3"/>`,
  shaft: (a) => ground(62) +
    `<ellipse cx="0" cy="-4" rx="52" ry="16" fill="#1c1820" ${st(2.6)}/>` +
    `<ellipse cx="0" cy="-2" rx="34" ry="10" fill="none" stroke="#6a5a4a" stroke-width="1.4"/><ellipse cx="0" cy="0" rx="18" ry="5" fill="none" stroke="#6a5a4a" stroke-width="1.2"/>` +
    `<path d="M-52,-4 l-8,-20 l14,4 l6,-14 l10,12 M52,-4 l8,-18 l-12,2 l-6,-12 l-10,12" fill="none" ${st(1.8)}/>` +
    `<path d="M-30,30 q-6,20 4,40 M26,28 q10,18 0,46" fill="none" ${st(1)} stroke-dasharray="4 4"/>`,
  eye: (a) => ground(52) +
    `<path d="M-36,0 v-30 h46 v30z" fill="${P}" ${st(2)}/><path d="M-42,-30 l28,-20 l30,20z" fill="${a}" ${st(2)}/>` +
    `<path d="M-20,-20 h12 v10 h-12z" fill="${P2}" ${st(1.2)}/><path d="M0,0 v-16 h10 v16" fill="${K}"/>` +
    `<path d="M32,0 q4,-30 0,-46" ${st(3)}/><path d="M32,-40 c-30,4 -36,-34 -10,-40 c6,-22 36,-20 36,2 c20,8 12,40 -26,38z" fill="#7d9662" ${st(2)}/>` +
    `<path d="M-50,0 q-2,-8 4,-10 q4,0 6,10" fill="${P}" ${st(1.2)}/>`,
  rift: (a) => waves(6, 64) +
    `<path d="M-14,0 L-9,-110 h18 L14,0z" fill="${P}" ${st(2.2)}/>` +
    `<path d="M-12,-30 h24 M-11,-60 h22 M-10,-88 h20" stroke="${a}" stroke-width="6"/>` +
    `<path d="M-12,-110 h24 v-16 h-24z" fill="#f2d27a" ${st(1.8)}/><path d="M-14,-126 L0,-140 L14,-126z" fill="${K}"/>` +
    `<path d="M14,-118 L60,-132 L60,-104z M-14,-118 L-60,-132 L-60,-104z" fill="#f2d27a" opacity=".45"/>` +
    `<path d="M-62,-6 h40 v-8 h-40z" fill="#8e6a44" ${st(1.6)}/>`,
  cauldron: (a) => ground(44) +
    `<path d="M-30,-34 q0,30 30,32 q30,-2 30,-32z" fill="#2b2833" ${st(2.2)}/><ellipse cx="0" cy="-34" rx="30" ry="6" fill="${a}" ${st(1.8)}/>` +
    `<path d="M-24,0 l-6,6 M24,0 l6,6" ${st(2)}/>` +
    `<circle cx="-8" cy="-46" r="4" fill="${P}" ${st(1)}/><circle cx="6" cy="-54" r="6" fill="${P}" ${st(1)}/><circle cx="-2" cy="-68" r="3" fill="${P}" ${st(1)}/>` +
    `<path d="M-46,-40 l92,0 M-40,-62 l80,0" ${st(1)} stroke-dasharray="2 5"/>` +
    `<path d="M-52,0 v-56 M52,0 v-56 M-58,-56 h12 M46,-56 h12" ${st(2)}/>`,
  sword: (a) => ground(40) +
    `<path d="M-30,0 q2,-24 26,-30 q28,2 32,30z" fill="#a9a094" ${st(2.2)}/>` +
    `<path d="M-2,-30 v-64 l4,-8 l4,8 v64" fill="${P}" ${st(1.8)}/><path d="M-12,-94 h28" ${st(3)}/><path d="M2,-94 v-14" ${st(4)}/>` +
    `<circle cx="2" cy="-112" r="4" fill="${a}" ${st(1.2)}/>`,
};

// 지도 표식: 그림 + 이름 띠
export function siteMarker(icon, color) {
  const g = GLYPH[icon] || GLYPH.plaza;
  return g(color);
}
