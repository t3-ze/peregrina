// 공용 도구: 시드 난수, SVG 생성, 손그림 선
export const NS = "http://www.w3.org/2000/svg";

export function rng(seed) {
  let s = typeof seed === "string" ? [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) : seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const f1 = (n) => Math.round(n * 10) / 10;

// 점 배열 → 부드러운 닫힌 경로 (Catmull-Rom → Bezier)
export function smoothClosed(pts) {
  const n = pts.length;
  let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d + "Z";
}
export function smoothOpen(pts) {
  const n = pts.length;
  let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, n - 1)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d;
}

// 해안선: 극좌표 하모닉 + 잔떨림. lobes로 반도/만을 만든다.
export function coast({ cx, cy, rx, ry, seed, n = 90, rough = 0.12, lobes = [], rot = 0 }) {
  const R = rng(seed);
  const harm = Array.from({ length: 6 }, (_, i) => ({ k: i + 2, a: (R() * rough) / (1 + i * 0.45), p: R() * 6.283 }));
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    let r = 1;
    for (const h of harm) r += h.a * Math.sin(h.k * t + h.p);
    for (const l of lobes) {
      let d = Math.atan2(Math.sin(t - l.at), Math.cos(t - l.at));
      r += l.amp * Math.exp(-(d * d) / (2 * l.w * l.w));
    }
    r += (R() - 0.5) * rough * 0.35;
    const x = Math.cos(t) * rx * r, y = Math.sin(t) * ry * r;
    pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  return pts;
}
// 중심 쪽으로 줄인 등고선
export function shrink(pts, k, cx, cy, wob = 0, seed = 1) {
  const R = rng(seed);
  return pts.map(([x, y]) => {
    const j = 1 + (R() - 0.5) * wob;
    return [cx + (x - cx) * k * j, cy + (y - cy) * k * j];
  });
}
// 손떨림 선 (두 점 사이)
export function wobbleLine(x1, y1, x2, y2, seed, amp = 2, seg = 6) {
  const R = rng(seed);
  const pts = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const nx = -(y2 - y1), ny = x2 - x1, L = Math.hypot(nx, ny) || 1;
    const o = i === 0 || i === seg ? 0 : (R() - 0.5) * amp * 2;
    pts.push([x1 + (x2 - x1) * t + (nx / L) * o, y1 + (y2 - y1) * t + (ny / L) * o]);
  }
  return smoothOpen(pts);
}
export function pointInPoly([x, y], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
export function bbox(pts) {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const [x, y] of pts) (a = Math.min(a, x)), (b = Math.min(b, y)), (c = Math.max(c, x)), (d = Math.max(d, y));
  return { x: a, y: b, w: c - a, h: d - b };
}

// 문자열 템플릿 → SVG 요소
export function svgEl(markup) {
  const t = document.createElementNS(NS, "g");
  t.innerHTML = markup;
  return t;
}
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// 종이 결 노이즈 텍스처 (캔버스로 한 번 만들어 재사용)
let _noise;
export function noiseURL() {
  if (_noise) return _noise;
  const c = document.createElement("canvas");
  c.width = c.height = 220;
  const g = c.getContext("2d");
  const img = g.createImageData(220, 220);
  const R = rng(42);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = R();
    const k = v < 0.5 ? 0 : 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = k;
    img.data[i + 3] = Math.floor(R() * R() * 46);
  }
  g.putImageData(img, 0, 0);
  // 섬유 결
  g.globalAlpha = 0.07;
  for (let i = 0; i < 90; i++) {
    g.strokeStyle = R() < 0.5 ? "#000" : "#fff";
    g.lineWidth = R() * 0.8 + 0.2;
    g.beginPath();
    const x = R() * 220, y = R() * 220, a = R() * 6.28, l = 6 + R() * 22;
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a + 0.4) * l * 0.5, y + Math.sin(a + 0.4) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  _noise = c.toDataURL();
  return _noise;
}
// 얼룩진 종이 (지도용, 큰 크기)
export function stainURL(w = 600, h = 400, seed = 9) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  const R = rng(seed);
  for (let i = 0; i < 70; i++) {
    g.fillStyle = R() < 0.6 ? "rgba(120,86,40,0.035)" : "rgba(255,250,235,0.05)";
    g.beginPath();
    const x = R() * w, y = R() * h, r = 10 + R() * 70;
    for (let k = 0; k <= 14; k++) {
      const a = (k / 14) * 6.283, rr = r * (0.7 + R() * 0.5);
      k ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + rr, y);
    }
    g.fill();
  }
  return c.toDataURL();
}
