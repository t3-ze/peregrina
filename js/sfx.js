// 클릭음: 누를 수 있는 요소를 누를 때 assets/sfx/click.mp3를 그대로 재생한다.
// 빠르게 여러 번 눌러도 겹쳐 들리도록 작은 묶음(pool)을 돌려 쓴다.
const SRC = "assets/sfx/click.mp3";
const VOLUME = 0.5;
const pool = Array.from({ length: 4 }, () => { const a = new Audio(SRC); a.preload = "auto"; a.volume = VOLUME; return a; });
let next = 0;

export function playClick() {
  const a = pool[next];
  next = (next + 1) % pool.length;
  try { a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => {}); } catch {}
}

const CLICKABLE = 'a, button, [role="button"], .hit, .site, .letter, .book.glow, .npc-pin, .veil:not(.open), .toc button, .cards button';
document.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  if (e.target.closest && e.target.closest(CLICKABLE)) playClick();
}, true);
