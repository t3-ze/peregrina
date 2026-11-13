// 배경 음악: 유튜브 영상들을 순서대로 이어서 틀고, 마지막 곡이 끝나면 처음으로 돌아간다.
// 브라우저는 사용자가 누르기 전 소리 재생을 막으므로, 처음 재생은 클릭(편지 봉인 등)에서 시작한다.
// 앰비언트: 대륙을 열었을 때만 그 대륙의 소리를 브금 위에 작게 겹쳐 튼다(페이드 인/아웃). 전도만 볼 때는 나오지 않는다.
export const TRACKS = ["NJHtgwlRjKU", "F_1G4yJ-F_o", "bNa5kUiiAHk", "7aVt4f7MP6Q", "12cFNTs1404", "QeNLdboGuKc"];
export const AMBIENT = {
  concordia: "o-b5nMCj5hI",
  arcadia: "GqntA0XsWg8",
  lunatica: "xNN7iTA57jM",
  mercurius: "IvjMgVS6kng",
  venustas: "UZ9uyQI3pF0",
  martialis: "dIdkB9h2s7M",
  jupiter: "mPZkdNFkNps",
  saturnus: "1uARxYfr8f4",
};
const VOLUME = 35;      // 브금
const AMB_VOLUME = 18;  // 앰비언트(브금보다 작게)
const FADE_IN = 2600, FADE_OUT = 1400;

let player = null, ready = false, wantPlay = false, idx = 0, muted = false;
const listeners = new Set();
const notify = () => listeners.forEach((f) => f(state()));
export const state = () => ({ playing: wantPlay && !muted, index: idx });
export const onChange = (f) => (listeners.add(f), f(state()));

try { muted = localStorage.getItem("peregrina-bgm") === "off"; } catch {}

// 유튜브 IFrame API 불러오기 (브금·앰비언트 플레이어 둘)
const host = document.createElement("div");
host.id = "bgm-host";
host.setAttribute("aria-hidden", "true");
host.innerHTML = `<div id="bgm-player"></div><div id="amb-player"></div>`;
document.body.appendChild(host);
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

const VARS = { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0, iv_load_policy: 3, modestbranding: 1 };
window.onYouTubeIframeAPIReady = () => {
  player = new YT.Player("bgm-player", {
    width: 200, height: 200, videoId: TRACKS[0], playerVars: VARS,
    events: {
      onReady: () => { ready = true; player.setVolume(VOLUME); if (wantPlay && !muted) player.playVideo(); },
      onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) next(); },
      onError: () => next(), // 재생이 막힌 영상은 건너뛴다
    },
  });
  amb = new YT.Player("amb-player", {
    width: 200, height: 200, playerVars: VARS,
    events: {
      onReady: () => { amb.setVolume(0); ambReady = true; applyAmbient(); },
      // 앰비언트는 끝나면 처음부터 다시(끊기지 않게)
      onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED) { amb.seekTo(0, true); amb.playVideo(); } },
      onError: () => { clearInterval(fadeTimer); vol = 0; try { amb.stopVideo(); } catch {} }, // 퍼가기가 막힌 영상은 조용히 넘긴다
    },
  });
};

function next() {
  idx = (idx + 1) % TRACKS.length;
  if (!ready) return;
  if (wantPlay && !muted) player.loadVideoById(TRACKS[idx]);
  else player.cueVideoById(TRACKS[idx]);
  notify();
}

// 사용자의 첫 클릭에서 부른다
export function start() {
  wantPlay = true;
  if (ready && !muted) player.playVideo();
  notify();
}
export function toggle() {
  // 버튼에 보이는 상태 기준: 꺼져 보이면 켜고, 켜져 보이면 끈다
  muted = state().playing;
  wantPlay = true;
  try { localStorage.setItem("peregrina-bgm", muted ? "off" : "on"); } catch {}
  if (ready) muted ? player.pauseVideo() : player.playVideo();
  applyAmbient();
  notify();
}

// ── 앰비언트 ──
let amb = null, ambReady = false, wantRegion = null, curRegion = null, vol = 0, fadeTimer = null, token = 0;
function fadeTo(target, ms, done) {
  clearInterval(fadeTimer);
  const from = vol, t0 = performance.now();
  fadeTimer = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / ms);
    vol = from + (target - from) * k;
    try { amb.setVolume(Math.round(vol)); } catch {}
    if (k >= 1) { clearInterval(fadeTimer); done && done(); }
  }, 50);
}
// 지금 들려야 할 소리로 맞춘다: 같은 대륙이면 그대로, 바뀌면 줄였다가 새 소리를 서서히 키운다
function applyAmbient() {
  if (!ambReady) return;
  const my = ++token;
  const target = muted || !wantPlay ? null : wantRegion;
  if (target === curRegion) {
    if (target) { amb.playVideo(); fadeTo(AMB_VOLUME, FADE_IN); }
    return;
  }
  const swap = () => {
    if (my !== token) return;
    curRegion = target;
    if (!target || !AMBIENT[target]) { amb.pauseVideo(); vol = 0; return; }
    vol = 0; amb.setVolume(0);
    amb.loadVideoById(AMBIENT[target]);
    fadeTo(AMB_VOLUME, FADE_IN);
  };
  if (curRegion && vol > 0.5) fadeTo(0, FADE_OUT, swap);
  else swap();
}
// 대륙을 열면 그 대륙 id, 전도로 돌아오면 null
export function setAmbient(regionId) {
  wantRegion = regionId || null;
  applyAmbient();
}

// 확인용: 재생 상태(1 재생 중, 2 일시정지, 5 대기 등)와 현재 곡
export const debug = () => ({
  ready, state: player && player.getPlayerState ? player.getPlayerState() : null, idx, video: player && player.getVideoData ? player.getVideoData().video_id : null,
  amb: { region: curRegion, vol: Math.round(vol), state: amb && amb.getPlayerState ? amb.getPlayerState() : null, video: amb && amb.getVideoData ? amb.getVideoData().video_id : null },
});
