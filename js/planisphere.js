// 배경의 거대한 플라니스피어(성좌 원반). 일곱 속성의 행성이 궤도 위에 그려져 있다.
import { rng, f1 } from "./util.js";

const PLANETS = [
  { sym: "☉", name: "SOL", c: "#e3b04b", r: 300 },
  { sym: "☽", name: "LUNA", c: "#aab0e6", r: 360 },
  { sym: "☿", name: "MERCURIUS", c: "#6fb2d6", r: 420 },
  { sym: "♀", name: "VENUS", c: "#e39ab8", r: 480 },
  { sym: "♂", name: "MARS", c: "#d9714f", r: 540 },
  { sym: "♃", name: "IUPPITER", c: "#a58ad8", r: 600 },
  { sym: "♄", name: "SATURNUS", c: "#c4a476", r: 660 },
];
const MONTHS = ["IANVARIVS", "FEBRVARIVS", "MARTIVS", "APRILIS", "MAIVS", "IVNIVS", "IVLIVS", "AVGVSTVS", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const G = "#c8a050";

export function planisphere() {
  const R = rng(77);
  const C = 900;
  let s = `<svg viewBox="0 0 1800 1800" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g transform="translate(${C},${C})" fill="none" stroke="${G}">`;
  // 바깥 테두리와 눈금 (천천히 돈다)
  s += "@@LAYER@@";
  s += `<g class="ps-outer">`;
  s += `<circle r="880" stroke-width="3"/><circle r="866" stroke-width="1"/><circle r="812" stroke-width="1.5"/><circle r="760" stroke-width="2.5"/>`;
  for (let i = 0; i < 360; i++) {
    const a = (i / 360) * Math.PI * 2, L = i % 10 === 0 ? 30 : i % 5 === 0 ? 18 : 9;
    s += `<path d="M${f1(Math.cos(a) * 866)},${f1(Math.sin(a) * 866)} L${f1(Math.cos(a) * (866 - L))},${f1(Math.sin(a) * (866 - L))}" stroke-width="${i % 10 ? 0.8 : 1.6}"/>`;
  }
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    s += `<path d="M${f1(Math.cos(a) * 812)},${f1(Math.sin(a) * 812)} L${f1(Math.cos(a) * 760)},${f1(Math.sin(a) * 760)}" stroke-width="2"/>`;
    const m = (i + 0.5) / 12 * 360;
    s += `<text transform="rotate(${m + 90}) translate(0,-778)" text-anchor="middle" font-family="Cinzel, serif" font-size="22" letter-spacing="6" fill="${G}" stroke="none">${MONTHS[i]}</text>`;
  }
  // 바깥의 작은 별 장식
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + 0.13;
    s += `<g transform="translate(${f1(Math.cos(a) * 838)},${f1(Math.sin(a) * 838)}) rotate(${(a * 180) / Math.PI})"><path d="M0,-7 L2,0 L0,7 L-2,0Z M-7,0 L0,2 L7,0 L0,-2Z" fill="${G}" stroke="none"/></g>`;
  }
  s += `</g>`;

  // 행성 궤도 (반대로 돈다)
  s += "@@LAYER@@";
  s += `<g class="ps-orbits">`;
  PLANETS.forEach((p, i) => {
    s += `<circle r="${p.r}" stroke-width="${i % 2 ? 0.8 : 1.4}" ${i % 2 ? 'stroke-dasharray="2 9"' : ""}/>`;
    const a = (i / 7) * Math.PI * 2 - 1.1 + i * 0.4;
    const x = f1(Math.cos(a) * p.r), y = f1(Math.sin(a) * p.r);
    s += `<g transform="translate(${x},${y})"><circle r="26" fill="#121733" stroke="${p.c}" stroke-width="2"/><circle r="34" stroke="${p.c}" stroke-width="0.8" stroke-dasharray="3 5"/>` +
      `<text y="10" text-anchor="middle" font-size="30" fill="${p.c}" stroke="none" font-family="serif">${p.sym}</text>` +
      `<text y="58" text-anchor="middle" font-family="Cinzel, serif" font-size="14" letter-spacing="4" fill="${p.c}" stroke="none">${p.name}</text></g>`;
  });
  s += `</g>`;

  // 안쪽 레테(별자리 판)
  s += "@@LAYER@@";
  s += `<g class="ps-rete">`;
  s += `<circle r="250" stroke-width="2"/><circle r="236" stroke-width="0.8"/>`;
  s += `<ellipse cx="60" cy="-40" rx="520" ry="500" stroke-width="1.6" stroke-dasharray="14 6 2 6"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    s += `<path d="M0,0 Q${f1(Math.cos(a + 0.3) * 140)},${f1(Math.sin(a + 0.3) * 140)} ${f1(Math.cos(a) * 236)},${f1(Math.sin(a) * 236)}" stroke-width="1.4"/>`;
  }
  // 별자리
  for (let k = 0; k < 9; k++) {
    const a0 = R() * 6.283, r0 = 280 + R() * 420;
    let px = Math.cos(a0) * r0, py = Math.sin(a0) * r0, d = `M${f1(px)},${f1(py)}`;
    const stars = [[px, py]];
    for (let j = 0; j < 3 + Math.floor(R() * 3); j++) {
      px += (R() - 0.5) * 120;
      py += (R() - 0.5) * 120;
      d += ` L${f1(px)},${f1(py)}`;
      stars.push([px, py]);
    }
    s += `<path d="${d}" stroke-width="0.9" opacity=".7"/>`;
    for (const [x, y] of stars) s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(2 + R() * 3)}" fill="#f6f0dc" stroke="none"/>`;
  }
  // 가운데 해
  s += `<circle r="60" fill="#121733" stroke-width="2"/>`;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2, L = i % 2 ? 92 : 120;
    s += `<path d="M${f1(Math.cos(a - 0.08) * 62)},${f1(Math.sin(a - 0.08) * 62)} L${f1(Math.cos(a) * L)},${f1(Math.sin(a) * L)} L${f1(Math.cos(a + 0.08) * 62)},${f1(Math.sin(a + 0.08) * 62)}" fill="${i % 2 ? "#121733" : G}" stroke-width="1.2"/>`;
  }
  s += `<circle r="34" stroke-width="1.2"/><text y="14" text-anchor="middle" font-size="40" fill="${G}" stroke="none" font-family="serif">✶</text>`;
  s += `</g>`;

  // 흩뿌린 별 (반짝임)
  s += "@@LAYER@@";
  s += `<g class="ps-stars" stroke="none">`;
  for (let i = 0; i < 140; i++) {
    const a = R() * 6.283, r = 120 + R() * 760;
    s += `<circle cx="${f1(Math.cos(a) * r)}" cy="${f1(Math.sin(a) * r)}" r="${f1(0.8 + R() * 2)}" fill="#f6f0dc"/>`;
  }
  s += `</g>`;
  // 층마다 따로 SVG로 나눠, 회전은 CSS로 합성 레이어에서만 돌린다(다시 그리지 않음)
  const [head, ...layers] = s.split("@@LAYER@@");
  return layers.map((L) => head + L + `</g></svg>`);
}
