// 아발론 연대기 책 문양. 48×48, 색은 currentColor를 따른다(책등·표지에서 색만 바꿔 쓴다).
const S = `fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"`;
const F = `fill="currentColor"`;
const star = (cx, cy, r, k = 0.3) => `M${cx},${cy - r} L${cx + r * k},${cy - r * k} L${cx + r},${cy} L${cx + r * k},${cy + r * k} L${cx},${cy + r} L${cx - r * k},${cy + r * k} L${cx - r},${cy} L${cx - r * k},${cy - r * k}Z`;

const PATHS = {
  // 아발론: 나침반 별
  avalon: `<circle cx="24" cy="24" r="15" ${S}/><path d="${star(24, 24, 21, 0.18)}" ${F}/><path d="M24,13 L27,21 L35,24 L27,27 L24,35 L21,27 L13,24 L21,21Z" fill="none" stroke="currentColor" stroke-width="1.2" transform="rotate(45 24 24)"/><circle cx="24" cy="24" r="2.6" fill="var(--em-bg, #fff)"/>`,
  // 성력 연대기: 모래시계
  chronicle: `<path d="M13,7 H35 M13,41 H35" ${S}/><path d="M16,8 C16,18 22,20 22,24 C22,28 16,30 16,40 M32,8 C32,18 26,20 26,24 C26,28 32,30 32,40" ${S}/><path d="M18.5,14 H29.5 C28,18 25,20 24,22 C23,20 20,18 18.5,14Z" ${F}/><path d="M24,27 L24,33 M18,39 C19,35 22,33.5 24,33.5 C26,33.5 29,35 30,39Z" ${F} stroke="currentColor" stroke-width="1"/>`,
  // 마법의 원리: 마법진
  magic: `<circle cx="24" cy="24" r="18" ${S}/><circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 3"/><path d="M24,10 L36.1,31 L11.9,31Z M24,38 L11.9,17 L36.1,17Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="24" cy="24" r="3" ${F}/>`,
  // 일곱 속성: 해와 일곱 행성
  attrs: `<circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="24" cy="24" r="6" ${F}/>${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<path d="M${24 + Math.cos(a) * 8},${24 + Math.sin(a) * 8} L${24 + Math.cos(a) * 11},${24 + Math.sin(a) * 11}" ${S} stroke-width="1.6"/>`; }).join("")}${Array.from({ length: 7 }, (_, i) => { const a = (i / 7) * Math.PI * 2 - Math.PI / 2; return `<circle cx="${(24 + Math.cos(a) * 17).toFixed(1)}" cy="${(24 + Math.sin(a) * 17).toFixed(1)}" r="2.4" ${F}/>`; }).join("")}`,
  // 원형종 도감: 원형종의 눈
  beings: `<path d="M5,24 C12,13 36,13 43,24 C36,35 12,35 5,24Z" ${S}/><circle cx="24" cy="24" r="7.5" ${F}/><path d="M24,17.5 C21.5,21 21.5,27 24,30.5 C26.5,27 26.5,21 24,17.5Z" fill="var(--em-bg, #fff)"/><path d="M14,12 L12,7 M24,10 V5 M34,12 L36,7 M14,36 L12,41 M34,36 L36,41" ${S} stroke-width="1.6"/>`,
  // 사역마와 계약: 맞물린 두 고리
  pact: `<circle cx="18" cy="26" r="10.5" ${S}/><circle cx="30" cy="26" r="10.5" ${S}/><path d="${star(24, 9, 5, 0.32)}" ${F}/>`,
  // 학파와 기관: 깃발 꽂힌 탑
  orders: `<path d="M15,42 V18 H33 V42Z" ${S}/><path d="M13,18 V12 H17 V15 H21 V12 H27 V15 H31 V12 H35 V18" ${S}/><path d="M24,12 V3 M24,4 L31,6.5 L24,9" ${S}/><path d="M21,42 V33 A3,3 0 0 1 27,33 V42" ${F}/><path d="M20,25 V22 M28,25 V22" ${S}/>`,
  // 인연 순례: 등불 달린 지팡이
  pilgrim: `<path d="M17,44 L30,8" ${S}/><path d="M30,8 C33,6 37,8 36,12" ${S}/><path d="M36,12 V16" ${S} stroke-width="1.4"/><path d="M32,16 H40 L39,26 H33Z" ${F}/><path d="M33,26 L36,29 L39,26" ${S} stroke-width="1.4"/><path d="M8,40 Q14,36 20,38 M26,40 Q32,36 40,39" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 3"/>`,
  // 칠성제: 일곱 별
  septentrio: `<path d="M6,30 L13,26 L20,27 L25,22 L33,25 L36,15 L44,12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="2 2.5"/>${[[6, 30], [13, 26], [20, 27], [25, 22], [33, 25], [36, 15], [44, 12]].map(([x, y], i) => `<path d="${star(x, y, i % 3 === 0 ? 5 : 3.6)}" ${F}/>`).join("")}`,
  // 표류자: 봉인된 편지
  drifter: `<rect x="6" y="12" width="36" height="25" rx="2" ${S}/><path d="M6,13 L24,27 L42,13" ${S}/><circle cx="24" cy="27" r="5.5" ${F}/><path d="M6,37 L19,24 M42,37 L29,24" ${S} stroke-width="1.4"/>`,
  // 위험과 금역: 가시덤불 고리
  perils: `<circle cx="24" cy="24" r="14" ${S}/>${Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2, b = a + 0.2; return `<path d="M${24 + Math.cos(a) * 14},${24 + Math.sin(a) * 14} L${24 + Math.cos(b) * 21},${24 + Math.sin(b) * 21} L${24 + Math.cos(a + 0.32) * 14},${24 + Math.sin(a + 0.32) * 14}Z" ${F}/>`; }).join("")}<path d="M24,17 V26" ${S} stroke-width="3"/><circle cx="24" cy="31" r="1.9" ${F}/>`,
  // 열두 달의 축제: 종이 등불
  festivals: `<path d="M24,4 V9 M19,9 H29" ${S}/><path d="M17,12 C12,18 12,30 17,36 H31 C36,30 36,18 31,12Z" ${F}/><path d="M24,12 V36 M17,12 C21,18 21,30 17,36 M31,12 C27,18 27,30 31,36" fill="none" stroke="var(--em-bg, #fff)" stroke-width="1.3"/><path d="M19,12 H29 M19,36 H29" ${S}/><path d="M24,36 V42 M21,44 L24,42 L27,44" ${S} stroke-width="1.6"/>`,
  // 최초의 계약자: 사과
  morgan: `<path d="M24,15 C18,10 8,13 9,24 C10,35 17,42 24,39 C31,42 38,35 39,24 C40,13 30,10 24,15Z" ${F}/><path d="M24,15 C24,10 25,7 28,4" ${S}/><path d="M26,9 C30,4 37,5 38,8 C34,12 29,12 26,9Z" ${F}/><path d="M15,22 C15,19 17,17 19,17" fill="none" stroke="var(--em-bg, #fff)" stroke-width="2" stroke-linecap="round"/>`,
  // 세계의 비밀: 열쇠 구멍
  secret: `<circle cx="24" cy="24" r="18" ${S}/><circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="1.5 3"/><circle cx="24" cy="20" r="5" ${F}/><path d="M21.5,22 L19.5,33 H28.5 L26.5,22Z" ${F}/>`,
  // 인물 명부: 깃펜
  roster: `<path d="M38,5 C26,8 16,18 13,32 L16,33 C22,22 30,14 38,5Z" ${F}/><path d="M38,5 C34,14 27,24 16,33" fill="none" stroke="var(--em-bg, #fff)" stroke-width="1.2"/><path d="M13,32 L9,42" ${S}/><path d="M6,43 H22" ${S} stroke-width="1.6"/>`,
};

export function emblem(id, size = 24) {
  return `<svg class="emblem" viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true">${PATHS[id] || PATHS.avalon}</svg>`;
}
