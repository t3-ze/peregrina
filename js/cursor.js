// 마우스 포인터: 금빛 별이 달린 마법봉 + 움직일 때 흩날리는 별가루, 누르면 터지는 작은 별들.
// 터치 기기(정밀 포인터 아님)와 '동작 줄이기' 설정에서는 효과를 끈다.

// 별 끝(왼쪽 위)이 클릭 지점. 32×32
const wand = (glow) => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  ${glow ? `<circle cx="7" cy="7" r="6.5" fill="#ead48f" opacity=".45"/>` : ""}
  <path d="M10.5,10.5 L28,28" stroke="#2c2015" stroke-width="4.2" stroke-linecap="round"/>
  <path d="M10.5,10.5 L28,28" stroke="#6b4a2e" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M24,24 L28,28" stroke="#c8a050" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M7,1 L8.6,5.4 L13,7 L8.6,8.6 L7,13 L5.4,8.6 L1,7 L5.4,5.4Z" fill="${glow ? "#fff6d6" : "#ead48f"}" stroke="#2c2015" stroke-width="1" stroke-linejoin="round"/>
  ${glow ? `<path d="M15,2 l.8,1.8 l1.8,.8 l-1.8,.8 l-.8,1.8 l-.8,-1.8 l-1.8,-.8 l1.8,-.8Z M3,15 l.6,1.4 l1.4,.6 l-1.4,.6 l-.6,1.4 l-.6,-1.4 l-1.4,-.6 l1.4,-.6Z" fill="#fff6d6"/>` : ""}
</svg>`;
const uri = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}") 7 7`;
const root = document.documentElement;
root.style.setProperty("--cur", `${uri(wand(false))}, auto`);
root.style.setProperty("--cur-hover", `${uri(wand(true))}, pointer`);

const fine = matchMedia("(pointer: fine)").matches;
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (fine && !calm) {
  const layer = document.createElement("div");
  layer.id = "stardust";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);
  const COLORS = ["#ead48f", "#f6f0dc", "#c8a050", "#fff6d6"];
  let lastT = 0, lastX = 0, lastY = 0;
  const spawn = (x, y, dx, dy, s, life) => {
    if (layer.childElementCount > 46) return;
    const i = document.createElement("i");
    i.style.cssText = `left:${x}px;top:${y}px;--dx:${dx}px;--dy:${dy}px;--s:${s};--r:${Math.round(Math.random() * 180 - 90)}deg;background:${COLORS[(Math.random() * COLORS.length) | 0]};animation-duration:${life}ms`;
    i.addEventListener("animationend", () => i.remove(), { once: true });
    layer.appendChild(i);
  };
  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const now = performance.now();
    const moved = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    if (now - lastT < 32 || moved < 7) return;
    lastT = now; lastX = e.clientX; lastY = e.clientY;
    // 별 끝 근처에서 조금 아래로 흘러내리며 사라진다
    spawn(e.clientX + (Math.random() * 8 - 4), e.clientY + (Math.random() * 8 - 4), Math.random() * 16 - 8, 14 + Math.random() * 22, 0.35 + Math.random() * 0.55, 650 + Math.random() * 450);
  }, { passive: true });
  addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse") return;
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2 + Math.random() * 0.4, d = 18 + Math.random() * 26;
      spawn(e.clientX, e.clientY, Math.cos(a) * d, Math.sin(a) * d, 0.45 + Math.random() * 0.6, 520 + Math.random() * 260);
    }
  }, { passive: true });
}
