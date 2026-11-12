// 기관 단면도: 건물을 세로로 잘라 모든 층을 보여 준다. 층마다 가구와 장식, 머무는 인물의 표식을 둔다.
import { rng, f1, esc } from "./util.js";

const K = "#2c2015", P = "#f4e9cd", P2 = "#e6d6b0", WOOD = "#9a6e45", STONE = "#b9b2a4";

// ── 기관별 층 구성 (위층 → 아래층). g: 지면 아래로 내려가는 첫 층의 순번 ──
// it: 가구, who: 그 층에 머무는 인물, wing: 건물 옆 바깥 공간
export const SEC = {
  aurora: { shape: "tower", w: 380, roof: "sun", g: 7, floors: [
    { n: "7F", t: "새벽 기도실", it: ["candle", "altar", "win", "candle"] },
    { n: "6F", t: "원장실", it: ["win", "desk", "plant"], who: ["셀레스틴"] },
    { n: "5F", t: "교관 숙소 · 지도관실", it: ["desk", "clock", "bed"], who: ["가브리엘"] },
    { n: "4F", t: "견습생 숙소 · 북쪽 계단참", it: ["bunk", "bunk", "chest"], who: ["루시앙"] },
    { n: "3F", t: "도서실 · 성유물 보관소", it: ["shelf", "lectern", "shelf", "chest"] },
    { n: "2F", t: "강의실 (치유학 · 계시학)", it: ["lectern", "bench", "bench", "globe"] },
    { n: "1F", t: "정화의 회랑 · 치유 진료소", it: ["bed", "jars", "bed", "counter"] },
    { n: "B1", t: "정화 수조", it: ["tank", "chest", "tank"] } ] },
  somnium: { shape: "manor", w: 660, g: 4, floors: [
    { n: "夢", t: "꿈층 · 끝없는 도서관", it: ["shelf", "lantern", "shelf", "cloud", "shelf"], who: ["녹스"], dream: true },
    { n: "3F", t: "원장의 서재 · 학생 숙소", it: ["shelf", "desk", "bed", "bed"] },
    { n: "2F", t: "꿈 전언실 · 해몽실", it: ["bed", "bed", "candle", "bed"], who: ["이졸데"] },
    { n: "1F", t: "현관홀 · 월광 강의실 · 식당", it: ["door", "lectern", "table", "lantern"], who: ["카스"] } ] },
  flumen: { shape: "ship", w: 640, g: 3, floors: [
    { n: "塔", t: "돛대 종탑 · 수위 관측대", it: ["bell", "scope"], who: ["마테오"], narrow: 180 },
    { n: "UP", t: "강의실 · 해먹 선실", it: ["lectern", "hammock", "hammock", "bench"] },
    { n: "DK", t: "갑판층 · 도선 수로 · 기록 보관소", it: ["boat", "letters", "table", "laundry"], who: ["니나"] },
    { n: "HD", t: "선창 · 유리 바닥 물길 강의실", it: ["tank", "barrel", "crate", "tank"] } ],
    wing: { side: "right", t: "원장의 배", it: ["boat"], who: ["오르솔라"], water: true } },
  hortus: { shape: "dome", w: 640, g: 2, floors: [
    { n: "2F", t: "공중 회랑 · 사교실 · 축제 준비실", it: ["banner", "bench", "flowers", "win"], who: ["앙리"] },
    { n: "1F", t: "월계수 원장실 · 조향실 · 강의 온실", it: ["jars", "tree", "desk", "plant"], who: ["베아트리체"] },
    { n: "B1", t: "뿌리층 · 씨앗 보관고 · 약초 건조실", it: ["jars", "herbs", "crate", "herbs"] } ],
    wing: { side: "right", t: "바깥 정원 · 금지 울타리", it: ["flowers", "fence"], who: ["로즈마리"] } },
  fornax: { shape: "terrace", w: 360, g: 5, floors: [
    { n: "5", t: "관장의 대장간", it: ["forge", "anvil"], who: ["브란"] },
    { n: "4", t: "교관 대장간 · 강화술 연습장", it: ["anvil", "target"] },
    { n: "3", t: "공동 화로 광장 · 식당", it: ["fire", "table"] },
    { n: "2", t: "견습 작업장 · 다락 숙소", it: ["forge", "desk", "bed"], who: ["토비"] },
    { n: "1", t: "정문 · 투기장 터널 · 무기고", it: ["sword", "door"], who: ["레아"] } ] },
  tonans: { shape: "keep", w: 600, g: 5, floors: [
    { n: "5F", t: "결계 탑 꼭대기 · 원장실", it: ["win", "desk", "banner"], who: ["하인리히"], narrow: 260 },
    { n: "4F", t: "교관실 · 문서실", it: ["shelf", "desk", "shelf", "clock"] },
    { n: "3F", t: "학생회실 · 도서관 · 생도 숙소", it: ["desk", "shelf", "bunk", "bunk"], who: ["엘레오노르"] },
    { n: "2F", t: "강의실 (결계학 · 전술 · 행정법)", it: ["map", "lectern", "bench", "bench"] },
    { n: "1F", t: "안뜰 연병장 · 위병소 · 식당", it: ["target", "sword", "table", "banner"] },
    { n: "B1", t: "결계 연습장 · 징계실", it: ["target", "chest", "rune"] } ] },
  profundum: { shape: "shaft", w: 620, g: 1, floors: [
    { n: "GL", t: "입구 · 가고일 고티에 · 출입 명부", it: ["statue", "lectern"], narrow: 240 },
    { n: "B1-2", t: "열람실 · 강의실 · 연구자 숙소", it: ["shelf", "desk", "lamp", "shelf"] },
    { n: "B3-5", t: "고문서 서가 · 기록관실", it: ["shelf", "scroll", "shelf", "desk"], who: ["핀"] },
    { n: "B6", t: "봉인관", it: ["chest", "cage", "jars", "chest"], who: ["이리나"] },
    { n: "B7-8", t: "하층 서가 · 하루가 며칠인 곳", it: ["shelf", "clock", "shelf"] },
    { n: "B9", t: "대사서실", it: ["shelf", "desk", "globe", "shelf"], who: ["에제키엘"] },
    { n: "▽", t: "금서고 계단 · 닫힌 문", it: ["stairs", "bigdoor"], narrow: 300 } ] },

  concilium: { shape: "hall", w: 640, g: 3, floors: [
    { n: "2F", t: "사절 참관석", it: ["banner", "chair", "chair"], who: ["퍽"] },
    { n: "1F", t: "본회의장 · 의장석 · 의원석", it: ["bench", "throne", "bench"], who: ["아우구스투스", "세실리아"] },
    { n: "B1", t: "맹약문 보관실", it: ["scroll", "chest", "lamp"] } ] },
  tabularium: { shape: "hall", w: 600, g: 2, floors: [
    { n: "2F", t: "기록원장실", it: ["shelf", "desk", "clock"], who: ["아드리안 그레이"] },
    { n: "1F", t: "각인 감정실 · 계약 대장고", it: ["lectern", "shelf", "shelf", "lamp"], who: ["야나"] },
    { n: "B1", t: "봉인 서고", it: ["shelf", "chest", "shelf"] } ] },
  ordo: { shape: "keep", w: 560, g: 3, floors: [
    { n: "3F", t: "단장실", it: ["map", "desk", "banner"], who: ["레온하르트"], narrow: 300 },
    { n: "2F", t: "기사 숙소 · 무기고", it: ["bunk", "sword", "bunk"] },
    { n: "1F", t: "훈련장 · 순찰로 대기실", it: ["target", "sword", "bench"], who: ["미라"] } ],
    wing: { side: "right", t: "마구간", it: ["hay", "barrel"], who: ["고드윈"] } },
  cursus: { shape: "house", w: 560, g: 3, floors: [
    { n: "3F", t: "국장실", it: ["desk", "clock", "letters"], who: ["오토"] },
    { n: "2F", t: "분류실", it: ["letters", "mailbag", "letters"], who: ["피오"] },
    { n: "1F", t: "분실 우편 보관소", it: ["letters", "chest", "golem"], who: ["그레타"] } ],
    wing: { side: "right", t: "우편선 부두", it: ["boat"], water: true } },
  mercator: { shape: "house", w: 620, g: 3, floors: [
    { n: "3F", t: "조합장실", it: ["chest", "desk", "scales"], who: ["로렌초", "세실리아"] },
    { n: "2F", t: "뒷골목 골동품 가게", it: ["shelf", "mirror", "jars"], who: ["자스민"] },
    { n: "1F", t: "대운하 시장 다리 · 행운의 노점", it: ["counter", "crate", "barrel"], who: ["오닐"] } ] },
  "tabularium-branch": { shape: "house", w: 500, g: 2, floors: [
    { n: "2F", t: "서류 보관실 · 각인 감정실", it: ["shelf", "shelf", "lectern"] },
    { n: "1F", t: "등록 창구 · 대기실", it: ["flowers", "counter", "bench"], who: ["토마스"] } ] },
  inn: { shape: "house", w: 620, g: 4, floors: [
    { n: "AT", t: "다락 하숙방", it: ["bed", "chest", "cloudlet"], who: ["카이"], narrow: 300 },
    { n: "2F", t: "객실", it: ["bed", "bunk", "bed"], who: ["아샤", "테오"] },
    { n: "1F", t: "카운터 · 식당 · 공연 무대", it: ["counter", "table", "harp", "table"], who: ["마르타", "탈리에신"] },
    { n: "B1", t: "포도주 저장고", it: ["barrel", "barrel", "crate"] } ] },
  workshop: { shape: "house", w: 480, g: 2, floors: [
    { n: "2F", t: "창고 · 시제품 선반", it: ["crate", "shelf", "chest"] },
    { n: "1F", t: "작업대 · 진열장", it: ["shelf", "anvil", "desk"], who: ["빔"] } ],
    wing: { side: "right", t: "시험 마당", it: ["target", "spark"] } },
  limen: { shape: "tower", w: 300, roof: "lamp", g: 4, floors: [
    { n: "LT", t: "등불실", it: ["beacon"] },
    { n: "3F", t: "관측실 · 경계 연구실", it: ["scope", "globe"], who: ["오스왈드"] },
    { n: "2F", t: "표류자 숙소", it: ["bed", "table"], who: ["한서진"] },
    { n: "1F", t: "관측소장실 · 접수", it: ["desk", "jars"], who: ["이브"] } ] },
  vigilia: { shape: "house", w: 480, g: 2, floors: [
    { n: "2F", t: "쉼터 다락", it: ["bed", "crate", "bed"] },
    { n: "1F", t: "뒤틀린 사역마 쉼터", it: ["cage", "bowl", "plant"], who: ["엘린"] },
    { n: "??", t: "본부 (비공개)", it: [], who: ["야경", "시온"], redact: true } ],
    wing: { side: "right", t: "마당의 물푸레나무", it: ["ash"] } },
  caliburnus: { shape: "hall", w: 560, g: 3, fog: true, floors: [
    { n: "?", t: "가면의 회합실 (장소 불명)", it: ["candle", "table", "candle"], who: ["펜드라곤"] },
    { n: "?", t: "하프 소리가 나는 곳", it: ["harp", "bench"], who: ["탈리에신"] },
    { n: "?", t: "바위 곁", it: ["rock"], who: ["퍼시벌"] } ] },
  conventus: { shape: "outdoor", w: 680, g: 3, floors: [
    { n: "☾", t: "그믐밤 하늘", it: ["moon", "broom"] },
    { n: "市", t: "마녀 시장 · 이름 없는 교차로", it: ["tent", "jars", "tent"], who: ["빅스"] },
    { n: "火", t: "모닥불", it: ["cauldron", "fire"], who: ["모레이 할멈", "셀윈"] } ] },

  plaza: { shape: "outdoor", w: 700, g: 2, floors: [
    { n: "上", t: "해시계 탑 위", it: ["sundial", "bell"] },
    { n: "地", t: "분수대 · 검이 뽑힌 바위 · 순례길", it: ["fountain", "rock", "bench", "sign"], who: ["티슬", "퍼시벌", "테오"] } ],
    wing: { side: "right", t: "변두리 빈집 앞", it: ["door"], who: ["벨"] } },
  spring: { shape: "outdoor", w: 640, g: 2, floors: [
    { n: "上", t: "성소의 향로", it: ["censer", "candle"], who: ["산예"] },
    { n: "地", t: "순례자 쉼터", it: ["tent", "bench"], who: ["포뢰"] },
    { n: "泉", t: "치유의 샘 바닥", it: ["water"], who: ["공복"] } ] },
  nest: { shape: "cliff", w: 640, g: 9, floors: [
    { n: "壹", t: "망루 · 승냥이 바위", it: ["rock", "scope"], who: ["이문", "애자"] },
    { n: "貳", t: "성역의 문", it: ["bigdoor"], who: ["폐안"] },
    { n: "參", t: "맏이의 비석", it: ["stele"], who: ["비희", "용생구자"] },
    { n: "肆", t: "도철의 굴", it: ["bones", "jars"], who: ["도철"] },
    { n: "伍", t: "막내의 소라", it: ["shell"], who: ["초도"] } ] },
  "ash-altar": { shape: "cliff", w: 560, g: 9, floors: [
    { n: "上", t: "절벽 끝 · 첫 햇빛", it: ["sun"] },
    { n: "壇", t: "흰 돌 제단", it: ["altar", "fire"], who: ["헬리아"] },
    { n: "下", t: "그을린 바위", it: ["rock", "ash"] } ] },
  lantern: { shape: "outdoor", w: 600, g: 2, floors: [
    { n: "上", t: "안개 낀 숲 위", it: ["moon", "cloud"] },
    { n: "地", t: "등불 초소 · 길 안내판 · 갈림길", it: ["lamppost", "bench", "sign", "pine"], who: ["노엘"] } ] },
  mortar: { shape: "outdoor", w: 560, g: 2, floors: [
    { n: "月", t: "달빛 기둥", it: ["moon"] },
    { n: "地", t: "돌절구 · 달꽃 덤불", it: ["flowers", "mortar", "flowers"], who: ["소월"] } ] },
  "shadow-palace": { shape: "hall", w: 640, g: 3, dark: true, floors: [
    { n: "玉", t: "안개의 옥좌", it: ["banner", "throne", "banner"], who: ["오베론"] },
    { n: "鏡", t: "거울 회랑", it: ["mirror", "mirror", "mirror"] },
    { n: "庭", t: "꿈의 정원", it: ["flowers", "tree", "flowers"] } ] },
  avallach: { shape: "outdoor", w: 640, g: 2, floors: [
    { n: "林", t: "사과나무 길", it: ["apple", "apple", "apple"] },
    { n: "舍", t: "오두막", it: ["table", "teapot", "bed"], who: ["비비안"] },
    { n: "湖", t: "고요한 호수", it: ["water"] } ] },
  pier: { shape: "outdoor", w: 600, g: 2, floors: [
    { n: "上", t: "선착장", it: ["crate", "boat", "post"], who: ["지오"] },
    { n: "水", t: "대운하 물길", it: ["water"] } ] },
  "bell-tower": { shape: "tower", w: 300, roof: "spire", g: 1, flooded: true, floors: [
    { n: "鐘", t: "종루", it: ["bell"], who: ["청류"] },
    { n: "階", t: "물에 잠긴 계단", it: ["stairs"] },
    { n: "村", t: "잠긴 마을", it: ["ruin", "ruin"] } ] },
  abyss: { shape: "outdoor", w: 560, g: 0, floors: [
    { n: "水", t: "심연의 입구", it: ["water"] },
    { n: "深", t: "푸른 잠자리", it: ["shell", "water"], who: ["멜뤼진"] } ] },
  "glass-tower": { shape: "tower", w: 280, roof: "glass", g: 3, glass: true, floors: [
    { n: "頂", t: "꼭대기 서재", it: ["shelf", "desk"], who: ["멀린"] },
    { n: "空", t: "편지의 하늘", it: ["letters", "flyletters"] },
    { n: "螺", t: "나선 계단", it: ["stairs"] } ] },
  "herb-shop": { shape: "house", w: 460, g: 2, floors: [
    { n: "2F", t: "약초 건조대", it: ["herbs", "jars", "herbs"] },
    { n: "1F", t: "가게 카운터", it: ["jars", "counter", "cauldron"], who: ["셀윈"] } ],
    wing: { side: "right", t: "뒷마당 밭", it: ["flowers", "plant"] } },
  greenhouse: { shape: "dome", w: 520, g: 2, broken: true, floors: [
    { n: "頂", t: "깨진 유리 지붕", it: ["vine", "vine"] },
    { n: "1F", t: "시든 화단 · 녹슨 도구함", it: ["wilted", "chest", "wilted"], who: ["나르기스"] } ] },
  "golden-garden": { shape: "outdoor", w: 600, g: 2, floors: [
    { n: "樹", t: "황금 사과나무", it: ["goldtree"], who: ["헤스페리데스"] },
    { n: "池", t: "노을의 연못", it: ["water"] } ] },
  arena: { shape: "hall", w: 620, g: 2, roof: "arena", floors: [
    { n: "上", t: "주인석 · 관중석", it: ["bench", "throne", "bench"], who: ["페트라"] },
    { n: "場", t: "결투장 · 대기실", it: ["target", "sword", "bench"], who: ["레아"] } ] },
  "spear-hill": { shape: "outdoor", w: 600, g: 2, floors: [
    { n: "風", t: "창의 숲", it: ["spears", "spears"], who: ["힐드"] },
    { n: "塚", t: "이름 없는 돌무덤", it: ["cairn"] } ] },
  crater: { shape: "cliff", w: 600, g: 9, volcanic: true, floors: [
    { n: "火", t: "화구 가장자리", it: ["fire", "fire"], who: ["이프리트"] },
    { n: "石", t: "제물의 바위", it: ["anvil", "rock"] } ] },
  "storm-watch": { shape: "tower", w: 300, roof: "ruin", g: 9, floors: [
    { n: "頂", t: "무너진 망루", it: ["cloud"], who: ["휘린"] },
    { n: "階", t: "번개 자국 계단", it: ["stairs"] },
    { n: "地", t: "풀밭", it: ["flowers"] } ] },
  "garuda-tower": { shape: "tower", w: 300, roof: "spire", g: 9, floors: [
    { n: "頂", t: "탑 꼭대기 (금역)", it: ["nest"], who: ["가루다"] },
    { n: "羽", t: "깃털의 계단", it: ["stairs", "feather"] } ] },
  "closed-door": { shape: "shaft", w: 520, g: 0, floors: [
    { n: "▽", t: "금서고 계단", it: ["stairs"] },
    { n: "▽", t: "빈 홈", it: ["pillar", "pillar"] },
    { n: "門", t: "돌문 앞", it: ["bigdoor"], who: ["네페르"] } ] },
  "deep-bottom": { shape: "shaft", w: 520, g: 0, floors: [
    { n: "▽", t: "하층 갱도", it: ["bones"] },
    { n: "∞", t: "어둠", it: ["eyes"], who: ["니드호그"], redact: true } ] },
};

// ── 가구 (밑변 가운데 x, 바닥 y 기준) ──
const s1 = (w = 1.6) => `stroke="${K}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const IT = {
  shelf: (x, y, c) => { let o = `<path d="M${x - 26},${y} v-86 h52 v86" fill="${WOOD}" ${s1(2)}/>`; for (let r = 0; r < 4; r++) { o += `<path d="M${x - 26},${y - 21 * r - 1} h52" ${s1(1.4)}/>`; for (let b = 0; b < 6; b++) o += `<rect x="${x - 23 + b * 8}" y="${y - 21 * r - 18 + (b % 3)}" width="6" height="${16 - (b % 3)}" fill="${["#7b3b34", "#3e5a74", "#c8a050", "#5a6e4a", "#7a5a8c", "#d8c8a0"][(b + r) % 6]}" ${s1(0.6)}/>`; } return o; },
  desk: (x, y) => `<path d="M${x - 30},${y} v-34 M${x + 30},${y} v-34" ${s1(2)}/><path d="M${x - 34},${y - 34} h68 v-6 h-68z" fill="${WOOD}" ${s1(1.6)}/><path d="M${x - 14},${y - 40} l6,-12 h10 l-2,12" fill="${P}" ${s1(1)}/><path d="M${x + 12},${y - 40} v-10 m-3,0 h6" ${s1(1.2)}/><path d="M${x + 22},${y - 40} q2,-10 8,-12" fill="none" ${s1(1)}/>`,
  chair: (x, y) => `<path d="M${x - 10},${y} v-22 h20 v22 M${x - 10},${y - 22} v-24" fill="none" ${s1(2)}/><path d="M${x - 12},${y - 22} h24" ${s1(3)}/>`,
  bed: (x, y, c) => `<path d="M${x - 36},${y} v-30 M${x + 36},${y} v-20" ${s1(2.2)}/><path d="M${x - 36},${y - 14} h72 v-8 h-72z" fill="${c}" ${s1(1.4)}/><path d="M${x - 32},${y - 22} q4,-10 16,-8 v8z" fill="${P}" ${s1(1.2)}/><path d="M${x - 14},${y - 22} q20,-8 50,0" fill="${P2}" ${s1(1.2)}/>`,
  bunk: (x, y, c) => `<path d="M${x - 30},${y} v-80 M${x + 30},${y} v-80" ${s1(2.2)}/><path d="M${x - 30},${y - 14} h60 v-7 h-60z M${x - 30},${y - 56} h60 v-7 h-60z" fill="${c}" ${s1(1.2)}/><path d="M${x + 22},${y - 56} v-24 M${x + 22},${y - 64} h8 M${x + 22},${y - 72} h8" ${s1(1)}/>`,
  table: (x, y) => `<path d="M${x - 30},${y - 30} h60" ${s1(4)}/><path d="M${x - 22},${y} l4,-30 M${x + 22},${y} l-4,-30" ${s1(2)}/><path d="M${x - 10},${y - 32} v-8 h8 v8 M${x + 8},${y - 32} q4,-12 10,0" fill="${P}" ${s1(1)}/><path d="M${x - 46},${y} v-18 h12 v18 M${x + 34},${y} v-18 h12 v18" fill="none" ${s1(1.6)}/>`,
  lamp: (x, y) => `<path d="M${x},${y} v-50 M${x - 8},${y} h16" ${s1(2)}/><path d="M${x - 12},${y - 50} l4,-14 h16 l4,14z" fill="#f2d27a" ${s1(1.4)}/>`,
  candle: (x, y) => `<path d="M${x - 10},${y} h20 M${x},${y} v-30 M${x - 12},${y - 30} h24" ${s1(2)}/>` + [-10, 0, 10].map((d) => `<path d="M${x + d - 2},${y - 30} v-12 h4 v12" fill="${P}" ${s1(1)}/><path d="M${x + d},${y - 44} q-4,-6 0,-12 q4,6 0,12z" fill="#f2a443" ${s1(0.8)}/>`).join(""),
  win: (x, y, c) => `<path d="M${x - 18},${y - 34} v-40 a18,18 0 0 1 36,0 v40z" fill="#cfe0e6" ${s1(2)}/><path d="M${x},${y - 34} v-58 M${x - 18},${y - 60} h36" ${s1(1.2)}/>`,
  plant: (x, y) => `<path d="M${x - 10},${y} l-3,-18 h26 l-3,18z" fill="#b96a45" ${s1(1.4)}/><path d="M${x},${y - 18} q-18,-16 -10,-36 M${x},${y - 18} q4,-26 14,-34 M${x},${y - 18} q-2,-20 -2,-30" fill="none" stroke="#5f7d45" stroke-width="3"/>`,
  barrel: (x, y) => `<path d="M${x - 16},${y} q-6,-22 0,-44 h32 q6,22 0,44z" fill="${WOOD}" ${s1(1.8)}/><path d="M${x - 19},${y - 12} h38 M${x - 19},${y - 32} h38" ${s1(1.4)}/>`,
  crate: (x, y) => `<path d="M${x - 20},${y} v-36 h40 v36z" fill="#c09060" ${s1(1.8)}/><path d="M${x - 20},${y} l40,-36 M${x - 20},${y - 36} l40,36" ${s1(1)}/>`,
  anvil: (x, y) => `<path d="M${x - 10},${y} l4,-14 h12 l4,14z" fill="#555" ${s1(1.4)}/><path d="M${x - 26},${y - 14} q4,-10 18,-12 h24 v12z" fill="#666" ${s1(1.6)}/><path d="M${x + 10},${y - 30} l14,-14 M${x + 20},${y - 48} l8,8" ${s1(3)}/>`,
  forge: (x, y) => `<path d="M${x - 30},${y} v-40 h60 v40z" fill="#9b5a44" ${s1(2)}/><path d="M${x - 20},${y - 10} v-18 a20,14 0 0 1 40,0 v18z" fill="#2b2026" ${s1(1.4)}/><path d="M${x - 10},${y - 12} q4,-14 10,-6 q4,-12 10,6z" fill="#f2a443" ${s1(1)}/><path d="M${x - 8},${y - 40} v-40 h16 v40" fill="#9b5a44" ${s1(1.6)}/>`,
  fire: (x, y) => `<path d="M${x - 22},${y} l44,-6 M${x - 22},${y - 6} l44,6" ${s1(3)}/><path d="M${x - 12},${y - 4} q-6,-22 8,-34 q-2,14 8,18 q4,-12 -2,-22 q20,16 8,38z" fill="#f2a443" ${s1(1.2)}/><path d="M${x - 2},${y - 6} q-2,-10 4,-16 q4,8 0,16z" fill="#f5d36a"/>`,
  cauldron: (x, y) => `<path d="M${x - 26},${y - 34} q0,32 26,32 q26,0 26,-32z" fill="#2b2833" ${s1(2)}/><ellipse cx="${x}" cy="${y - 34}" rx="26" ry="5" fill="#7fbf7a" ${s1(1.4)}/><circle cx="${x - 6}" cy="${y - 46}" r="4" fill="none" ${s1(1)}/><circle cx="${x + 6}" cy="${y - 56}" r="5" fill="none" ${s1(1)}/>`,
  chest: (x, y) => `<path d="M${x - 24},${y} v-26 h48 v26z" fill="${WOOD}" ${s1(1.8)}/><path d="M${x - 24},${y - 26} q24,-18 48,0" fill="${WOOD}" ${s1(1.8)}/><path d="M${x - 24},${y - 20} h48" ${s1(1)}/><rect x="${x - 4}" y="${y - 24}" width="8" height="10" fill="#c8a050" ${s1(1)}/>`,
  clock: (x, y) => `<path d="M${x - 12},${y} v-80 h24 v80z" fill="${WOOD}" ${s1(1.8)}/><circle cx="${x}" cy="${y - 64}" r="9" fill="${P}" ${s1(1.2)}/><path d="M${x},${y - 64} v-6 M${x},${y - 64} l4,2" ${s1(1)}/><path d="M${x},${y - 50} v24" ${s1(1)}/><circle cx="${x}" cy="${y - 24}" r="4" fill="#c8a050" ${s1(1)}/>`,
  globe: (x, y) => `<path d="M${x - 10},${y} h20 M${x},${y} v-14" ${s1(2)}/><circle cx="${x}" cy="${y - 32}" r="18" fill="#a9c6c0" ${s1(1.6)}/><path d="M${x - 18},${y - 32} h36 M${x},${y - 50} q-12,18 0,36 q12,-18 0,-36" fill="none" ${s1(1)}/><path d="M${x - 24},${y - 32} a24,24 0 0 0 24,24" fill="none" ${s1(1.6)}/>`,
  scope: (x, y) => `<path d="M${x - 14},${y} l14,-34 l14,34 M${x},${y - 34} v34" ${s1(1.6)}/><path d="M${x - 24},${y - 30} l46,-26 l4,8 l-46,26z" fill="#c8a050" ${s1(1.6)}/>`,
  banner: (x, y, c) => `<path d="M${x - 16},${y - 96} h32" ${s1(2)}/><path d="M${x - 14},${y - 96} v56 l14,-10 l14,10 v-56z" fill="${c}" ${s1(1.6)}/><path d="M${x},${y - 82} l4,8 l-4,8 l-4,-8z" fill="#e8c84a" ${s1(0.8)}/>`,
  map: (x, y) => `<path d="M${x - 30},${y - 40} h60 v-44 h-60z" fill="#e9dbb4" ${s1(1.6)}/><path d="M${x - 22},${y - 50} q10,-20 20,-8 q8,10 20,-14" fill="none" ${s1(1)}/><circle cx="${x + 12}" cy="${y - 66}" r="3" fill="#a4372f"/>`,
  bench: (x, y) => `<path d="M${x - 30},${y - 20} h60" ${s1(4)}/><path d="M${x - 24},${y} v-20 M${x + 24},${y} v-20" ${s1(2)}/>`,
  hammock: (x, y, c) => `<path d="M${x - 34},${y - 80} v80 M${x + 34},${y - 80} v80" ${s1(2)}/><path d="M${x - 34},${y - 60} q34,30 68,0" fill="${c}" ${s1(1.4)}/>`,
  letters: (x, y) => { let o = `<path d="M${x - 30},${y} v-84 h60 v84" fill="${WOOD}" ${s1(2)}/>`; for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) o += `<rect x="${x - 26 + c * 18}" y="${y - 80 + r * 20}" width="16" height="16" fill="#5a3e28" ${s1(0.6)}/>` + ((r + c) % 2 ? `<path d="M${x - 24 + c * 18},${y - 72 + r * 20} h12 v6 h-12z" fill="${P}" ${s1(0.5)}/>` : ""); return o; },
  mailbag: (x, y) => `<path d="M${x - 18},${y} q-6,-30 6,-40 h24 q12,10 6,40z" fill="#a08460" ${s1(1.6)}/><path d="M${x - 10},${y - 40} q10,-12 20,0" fill="none" ${s1(1.4)}/><path d="M${x - 6},${y - 20} h12 v8 h-12z" fill="${P}" ${s1(0.8)}/>`,
  jars: (x, y) => `<path d="M${x - 28},${y - 44} h56 M${x - 28},${y - 2} h56" ${s1(2)}/>` + [-18, 0, 18].map((d, i) => `<path d="M${x + d - 7},${y - 4} v-16 q0,-6 7,-6 q7,0 7,6 v16z" fill="${["#9cc3cf", "#c88ad8", "#e3b04b"][i]}" ${s1(1)}/><path d="M${x + d - 6},${y - 46} v-12 h12 v12z" fill="${["#d97b6c", "#7fbf7a", "#cfe0e6"][i]}" ${s1(1)}/>`).join(""),
  altar: (x, y, c) => `<path d="M${x - 30},${y} v-36 h60 v36z" fill="${P}" ${s1(2)}/><path d="M${x - 36},${y - 36} h72 v-6 h-72z" fill="${c}" ${s1(1.6)}/><circle cx="${x}" cy="${y - 62}" r="14" fill="#f0c95a" ${s1(1.6)}/>` + Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * 6.283; return `<path d="M${f1(x + Math.cos(a) * 18)},${f1(y - 62 + Math.sin(a) * 18)} l${f1(Math.cos(a) * 7)},${f1(Math.sin(a) * 7)}" ${s1(1.4)}/>`; }).join(""),
  bell: (x, y) => `<path d="M${x - 30},${y - 90} h60" ${s1(4)}/><path d="M${x},${y - 90} v6" ${s1(2)}/><path d="M${x - 18},${y - 40} q0,-44 18,-44 q18,0 18,44 l4,6 h-44z" fill="#d7b25a" ${s1(1.8)}/><circle cx="${x}" cy="${y - 30}" r="4" fill="${K}"/>`,
  counter: (x, y) => `<path d="M${x - 40},${y} v-40 h80 v40z" fill="${WOOD}" ${s1(2)}/><path d="M${x - 44},${y - 40} h88" ${s1(4)}/><path d="M${x - 30},${y - 30} h60 M${x - 30},${y - 16} h60" ${s1(0.8)}/><path d="M${x + 16},${y - 44} v-10 h12 v10" fill="#c8a050" ${s1(1)}/>`,
  lectern: (x, y) => `<path d="M${x},${y} v-44 M${x - 12},${y} h24" ${s1(2.4)}/><path d="M${x - 20},${y - 44} l40,-10 v6 l-40,10z" fill="${WOOD}" ${s1(1.6)}/><path d="M${x - 16},${y - 50} q8,-8 18,-6 q8,-6 16,-8" fill="${P}" ${s1(1)}/>`,
  tank: (x, y) => `<path d="M${x - 34},${y} v-40 h68 v40z" fill="#9cc3cf" ${s1(2)}/><path d="M${x - 34},${y - 28} q8,-4 17,0 t17,0 t17,0 t17,0" fill="none" ${s1(1)}/><path d="M${x - 10},${y - 14} h16 v8 h-16z" fill="${WOOD}" ${s1(1)}/>`,
  statue: (x, y) => `<path d="M${x - 18},${y} v-20 h36 v20z" fill="${STONE}" ${s1(1.6)}/><path d="M${x - 14},${y - 20} q-4,-26 10,-34 l-6,-12 l10,6 l6,-6 l2,12 q12,10 6,34z" fill="#8f877c" ${s1(1.6)}/><path d="M${x - 14},${y - 46} q-20,-6 -22,-26 q12,6 20,16 M${x + 12},${y - 46} q20,-6 22,-26 q-12,6 -20,16" fill="#8f877c" ${s1(1.4)}/>`,
  cloud: (x, y) => `<path d="M${x - 40},${y - 30} q-8,-22 14,-24 q6,-20 28,-12 q18,-14 30,6 q20,2 12,22 q4,12 -14,10 h-62 q-14,0 -8,-2z" fill="#fbf8ef" ${s1(1.4)}/>`,
  cloudlet: (x, y) => `<path d="M${x - 16},${y - 70} q-4,-10 6,-12 q4,-10 14,-4 q10,-4 12,6 q8,2 2,10z" fill="#7d7a8c" ${s1(1.2)}/><path d="M${x},${y - 66} l-4,8 h6 l-4,8" fill="none" stroke="#e8c84a" stroke-width="1.8"/>`,
  lantern: (x, y) => `<path d="M${x},${y - 100} v20" ${s1(1.4)}/><path d="M${x - 10},${y - 80} h20 l-2,24 h-16z" fill="#f2d27a" ${s1(1.4)}/><path d="M${x - 10},${y - 80} l10,-6 l10,6" fill="${K}"/>`,
  lamppost: (x, y) => `<path d="M${x},${y} v-96 h18 v8" fill="none" ${s1(2.6)}/><path d="M${x + 10},${y - 88} h16 l-2,22 h-12z" fill="#f2d27a" ${s1(1.4)}/>`,
  sword: (x, y) => `<path d="M${x - 24},${y} v-60 M${x + 24},${y} v-60 M${x - 28},${y - 60} h56 M${x - 28},${y - 14} h56" ${s1(2)}/>` + [-14, 0, 14].map((d) => `<path d="M${x + d},${y - 14} v-56 l3,-6 l3,6 v56" fill="#d8d8d8" ${s1(1)}/><path d="M${x + d - 4},${y - 66} h14" ${s1(1.6)}/>`).join(""),
  target: (x, y) => `<path d="M${x - 12},${y} l12,-30 l12,30" fill="none" ${s1(2)}/><circle cx="${x}" cy="${y - 44}" r="22" fill="${P}" ${s1(1.6)}/><circle cx="${x}" cy="${y - 44}" r="14" fill="#a4372f" ${s1(1)}/><circle cx="${x}" cy="${y - 44}" r="6" fill="${P}" ${s1(1)}/>`,
  throne: (x, y, c) => `<path d="M${x - 22},${y} v-46 l-4,-40 l12,10 l14,-20 l14,20 l12,-10 l-4,40 v46z" fill="${c}" ${s1(2)}/><path d="M${x - 16},${y - 30} h32 v-10 h-32z" fill="${P}" ${s1(1.2)}/>`,
  mirror: (x, y) => `<ellipse cx="${x}" cy="${y - 50}" rx="20" ry="34" fill="#cfe0e6" ${s1(2.2)}/><ellipse cx="${x}" cy="${y - 50}" rx="14" ry="27" fill="none" ${s1(0.8)}/><path d="M${x - 8},${y - 66} l8,-6" stroke="#fff" stroke-width="3"/><path d="M${x - 10},${y} l10,-16 l10,16" fill="none" ${s1(1.6)}/>`,
  tree: (x, y) => `<path d="M${x - 4},${y} q2,-40 -2,-70 h10 q-4,30 0,70z" fill="#8a6440" ${s1(1.6)}/><path d="M${x},${y - 64} c-36,4 -40,-34 -14,-40 c4,-24 34,-22 34,0 c26,8 18,42 -20,40z" fill="#6f8f4f" ${s1(1.8)}/>`,
  flowers: (x, y) => `<path d="M${x - 26},${y} v-12 h52 v12z" fill="#b96a45" ${s1(1.4)}/>` + [-18, -6, 6, 18].map((d, i) => `<path d="M${x + d},${y - 12} v-${14 + (i % 2) * 8}" stroke="#5f7d45" stroke-width="2"/><circle cx="${x + d}" cy="${y - 28 - (i % 2) * 8}" r="5" fill="${["#e39ab8", "#f2c96b", "#d97b6c", "#c88ad8"][i]}" ${s1(0.8)}/>`).join(""),
  wilted: (x, y) => `<path d="M${x - 26},${y} v-12 h52 v12z" fill="#8a6440" ${s1(1.4)}/>` + [-14, 0, 14].map((d) => `<path d="M${x + d},${y - 12} q2,-20 10,-18 q2,6 -4,10" fill="none" stroke="#8a7a50" stroke-width="2"/>`).join(""),
  herbs: (x, y) => `<path d="M${x - 34},${y - 96} h68" ${s1(2)}/>` + [-24, -8, 8, 24].map((d) => `<path d="M${x + d},${y - 96} v10" ${s1(1)}/><path d="M${x + d - 6},${y - 86} q6,30 12,0z" fill="#7e9a5b" ${s1(1)}/>`).join(""),
  fence: (x, y) => [-24, -8, 8, 24].map((d) => `<path d="M${x + d - 3},${y} v-40 l3,-6 l3,6 v40z" fill="${P}" ${s1(1.2)}/>`).join("") + `<path d="M${x - 30},${y - 30} h60 M${x - 30},${y - 14} h60" ${s1(1.6)}/>`,
  door: (x, y) => `<path d="M${x - 18},${y} v-60 a18,18 0 0 1 36,0 v60z" fill="${WOOD}" ${s1(2)}/><circle cx="${x + 10}" cy="${y - 30}" r="2.5" fill="#c8a050"/>`,
  bigdoor: (x, y, c) => `<path d="M${x - 40},${y} v-70 a40,36 0 0 1 80,0 v70z" fill="#6a5e54" ${s1(2.6)}/><path d="M${x},${y - 106} V${y}" ${s1(1.6)}/><circle cx="${x}" cy="${y - 54}" r="9" fill="${c}" ${s1(1.4)}/><path d="M${x - 30},${y - 20} h20 M${x + 10},${y - 20} h20" ${s1(1)}/>`,
  stairs: (x, y) => { let o = ""; for (let i = 0; i < 7; i++) o += `<path d="M${x - 40 + i * 12},${y - i * 12} h12 v-12" fill="none" ${s1(1.8)}/>`; return o + `<path d="M${x - 40},${y} l84,-84" ${s1(0.8)}/>`; },
  rune: (x, y) => `<circle cx="${x}" cy="${y - 4}" rx="30" r="30" fill="none" stroke="#8b6cc4" stroke-width="2" transform="matrix(1,0,0,.25,0,${f1((y - 4) * 0.75)})"/><path d="M${x - 6},${y - 40} l-6,12 h8 l-6,14" fill="none" stroke="#e8c84a" stroke-width="2.4"/>`,
  scroll: (x, y) => `<path d="M${x - 30},${y - 30} h60" ${s1(4)}/><path d="M${x - 22},${y} v-30 M${x + 22},${y} v-30" ${s1(2)}/><path d="M${x - 18},${y - 34} q18,-8 36,0 v-12 q-18,-8 -36,0z" fill="#e9dbb4" ${s1(1.2)}/><circle cx="${x - 18}" cy="${y - 40}" r="5" fill="#e9dbb4" ${s1(1)}/>`,
  cage: (x, y) => `<path d="M${x - 22},${y} v-50 q22,-26 44,0 v50z" fill="none" ${s1(2)}/>` + [-12, 0, 12].map((d) => `<path d="M${x + d},${y} v-${58 - Math.abs(d)}" ${s1(1)}/>`).join("") + `<path d="M${x - 8},${y - 6} q8,-16 16,0" fill="#6a6a8a" ${s1(1)}/><circle cx="${x + 2}" cy="${y - 12}" r="1.5" fill="#f2d27a"/>`,
  boat: (x, y, c) => `<path d="M${x - 44},${y - 16} q44,22 88,0 l-6,-10 h-76z" fill="#8e6a44" ${s1(1.8)}/><path d="M${x},${y - 26} v-40" ${s1(1.6)}/><path d="M${x},${y - 64} q20,14 0,34z" fill="${P}" ${s1(1.2)}/><path d="M${x - 50},${y - 6} q8,-5 16,0 t16,0 t16,0 t16,0 t16,0 t16,0" fill="none" ${s1(1)}/>`,
  laundry: (x, y) => `<path d="M${x - 34},${y - 90} q34,10 68,0" fill="none" ${s1(1.2)}/>` + [-22, -6, 10].map((d) => `<path d="M${x + d},${y - 86} h12 v16 h-12z" fill="${P}" ${s1(1)}/><path d="M${x + d + 2},${y - 80} h8 M${x + d + 2},${y - 76} h6" ${s1(0.6)}/>`).join(""),
  golem: (x, y) => `<path d="M${x - 24},${y} v-12 h-6 v-46 h60 v46 h-6 v12z" fill="${STONE}" ${s1(2)}/><path d="M${x - 22},${y - 50} h44 v26 h-44z" fill="#5a3e28" ${s1(1)}/><path d="M${x - 16},${y - 44} h10 v6 h-10z M${x + 4},${y - 40} h10 v6 h-10z" fill="${P}" ${s1(0.6)}/><circle cx="${x - 8}" cy="${y - 64}" r="3" fill="#f2d27a"/><circle cx="${x + 8}" cy="${y - 64}" r="3" fill="#f2d27a"/><path d="M${x - 14},${y - 58} h28 v-14 h-28z" fill="none" ${s1(1.2)}/>`,
  scales: (x, y) => `<path d="M${x},${y} v-50 M${x - 12},${y} h24 M${x - 26},${y - 50} h52" ${s1(2)}/><path d="M${x - 26},${y - 50} l-8,18 h16z M${x + 26},${y - 50} l-8,18 h16z" fill="#c8a050" ${s1(1.2)}/>`,
  harp: (x, y) => `<path d="M${x - 16},${y} v-70 q30,6 34,40 q-4,20 -34,30" fill="none" stroke="#c8a050" stroke-width="4"/>` + [0, 8, 16].map((d) => `<path d="M${x - 16 + d + 2},${y - 66 + d} V${y - 6}" ${s1(0.6)}/>`).join(""),
  spark: (x, y) => `<path d="M${x},${y - 40} l-6,-10 l10,-2 l-4,-10 l10,6 l4,-10 l2,12 l10,0 l-8,8" fill="#e3b23c" ${s1(1.2)}/><path d="M${x - 16},${y} v-20 h32 v20z" fill="#7a6d66" ${s1(1.4)}/>`,
  beacon: (x, y) => `<path d="M${x - 24},${y} v-12 h48 v12z" fill="${WOOD}" ${s1(1.6)}/><path d="M${x - 16},${y - 12} l4,-40 h24 l4,40z" fill="#f2d27a" ${s1(1.8)}/><path d="M${x - 70},${y - 40} L${x - 16},${y - 30} L${x - 16},${y - 50}z M${x + 70},${y - 40} L${x + 16},${y - 30} L${x + 16},${y - 50}z" fill="#f2d27a" opacity=".5"/>`,
  bowl: (x, y) => `<path d="M${x - 16},${y - 12} q16,16 32,0z" fill="#9cc3cf" ${s1(1.4)}/><path d="M${x + 20},${y} q-4,-16 8,-18 q8,6 4,18z" fill="#6a6a8a" ${s1(1)}/>`,
  hay: (x, y) => `<path d="M${x - 30},${y} q0,-36 30,-40 q30,4 30,40z" fill="#e3c66a" ${s1(1.6)}/><path d="M${x - 16},${y - 20} l8,-8 M${x + 4},${y - 26} l8,-6 M${x - 4},${y - 10} l6,-6" ${s1(0.8)}/>`,
  ash: (x, y) => `<path d="M${x - 6},${y} q4,-50 -2,-90 h12 q-6,40 0,90z" fill="#8a6440" ${s1(1.8)}/><path d="M${x},${y - 80} c-50,6 -56,-44 -22,-56 c4,-30 46,-30 48,0 c34,12 26,58 -26,56z" fill="#7d9662" ${s1(2)}/>`,
  moon: (x, y) => `<path d="M${x - 6},${y - 60} a24,24 0 1 0 30,-30 a18,18 0 1 1 -30,30z" fill="#efe6c7" ${s1(1.6)}/>`,
  broom: (x, y) => `<path d="M${x - 40},${y - 40} l70,-24" ${s1(2)}/><path d="M${x + 30},${y - 64} l20,-10 l6,14 l-20,6z" fill="#c8a050" ${s1(1.2)}/>`,
  tent: (x, y, c) => `<path d="M${x - 36},${y} l36,-60 l36,60z" fill="${c}" ${s1(2)}/><path d="M${x},${y - 60} v60 M${x - 8},${y} l8,-24 l8,24" fill="${K}" ${s1(1)}/><path d="M${x},${y - 60} v-12 l10,4 l-10,4" fill="#e8c84a" ${s1(1)}/>`,
  sundial: (x, y) => `<path d="M${x - 14},${y} v-50 h28 v50z" fill="${P}" ${s1(2)}/><circle cx="${x}" cy="${y - 70}" r="18" fill="${P2}" ${s1(1.6)}/><path d="M${x},${y - 70} l12,-12" ${s1(2)}/>` + Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * 6.283; return `<path d="M${f1(x + Math.cos(a) * 14)},${f1(y - 70 + Math.sin(a) * 14)} l${f1(Math.cos(a) * 4)},${f1(Math.sin(a) * 4)}" ${s1(1)}/>`; }).join(""),
  fountain: (x, y) => `<path d="M${x - 40},${y} v-16 h80 v16z" fill="${P}" ${s1(2)}/><path d="M${x - 34},${y - 16} q8,-4 17,0 t17,0 t17,0 t17,0" fill="none" stroke="#7fa7b5" stroke-width="2"/><path d="M${x - 4},${y - 16} v-30 h8 v30" fill="${P}" ${s1(1.6)}/><ellipse cx="${x}" cy="${y - 48}" rx="18" ry="4" fill="#9cc3cf" ${s1(1.4)}/><path d="M${x},${y - 52} q-14,-14 -20,6 M${x},${y - 52} q14,-14 20,6" fill="none" stroke="#7fa7b5" stroke-width="1.6"/>`,
  rock: (x, y) => `<path d="M${x - 34},${y} q-2,-30 20,-36 q20,-8 36,6 q12,14 12,30z" fill="#a9a094" ${s1(2)}/><path d="M${x + 2},${y - 38} l4,-10 l4,10" ${s1(1.6)} fill="none"/><path d="M${x - 16},${y - 16} l8,-6 M${x + 14},${y - 12} l6,-4" ${s1(1)}/>`,
  sign: (x, y) => `<path d="M${x},${y} v-70" ${s1(2.4)}/><path d="M${x},${y - 66} h30 l8,6 l-8,6 h-30z M${x},${y - 46} h-30 l-8,6 l8,6 h30z" fill="${P}" ${s1(1.4)}/>`,
  censer: (x, y) => `<path d="M${x - 20},${y} l6,-10 h28 l6,10z" fill="#8f877c" ${s1(1.6)}/><path d="M${x - 22},${y - 10} q0,-26 22,-26 q22,0 22,26z" fill="#c8a050" ${s1(1.8)}/><path d="M${x},${y - 36} q-8,-12 2,-22 q10,-10 0,-22 M${x + 10},${y - 40} q8,-12 0,-24" fill="none" ${s1(1.2)}/><path d="M${x - 14},${y - 20} h28" ${s1(1)}/>`,
  water: (x, y) => `<path d="M${x - 60},${y - 30} q10,-6 20,0 t20,0 t20,0 t20,0 t20,0 t20,0 M${x - 50},${y - 14} q10,-6 20,0 t20,0 t20,0 t20,0 t20,0" fill="none" stroke="#5f8fa3" stroke-width="2"/><ellipse cx="${x + 20}" cy="${y - 50}" rx="4" ry="6" fill="none" stroke="#5f8fa3" stroke-width="1.4"/><ellipse cx="${x - 24}" cy="${y - 60}" rx="3" ry="4" fill="none" stroke="#5f8fa3" stroke-width="1.2"/>`,
  rock2: (x, y) => IT.rock(x, y),
  stele: (x, y) => `<path d="M${x - 50},${y} q0,-30 50,-34 q50,4 50,34z" fill="#8f9a7a" ${s1(2)}/><path d="M${x - 16},${y - 34} v-56 q16,-10 32,0 v56z" fill="${STONE}" ${s1(2)}/><path d="M${x - 8},${y - 80} h16 M${x - 8},${y - 70} h16 M${x - 8},${y - 60} h12 M${x - 8},${y - 50} h16" ${s1(1)}/><path d="M${x - 50},${y - 6} q-20,-6 -24,-20 q12,0 20,8" fill="#8f9a7a" ${s1(1.6)}/>`,
  bones: (x, y) => `<path d="M${x - 30},${y - 4} l24,-8 M${x + 6},${y - 6} l26,6" ${s1(4)}/><circle cx="${x - 30}" cy="${y - 4}" r="4" fill="${P}" ${s1(1)}/><circle cx="${x + 32}" cy="${y}" r="4" fill="${P}" ${s1(1)}/><path d="M${x - 10},${y - 16} q10,-14 20,0 q-10,8 -20,0z" fill="#c8a050" ${s1(1)}/>`,
  shell: (x, y) => `<path d="M${x - 34},${y} q-6,-50 34,-56 q36,4 34,30 q-2,22 -24,20 q-18,-2 -16,-18 q4,-12 14,-8" fill="#ead8c0" ${s1(2)}/><path d="M${x - 34},${y} h68" ${s1(2)}/>`,
  sun: (x, y) => `<circle cx="${x}" cy="${y - 60}" r="20" fill="#f0c95a" ${s1(1.8)}/>` + Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * 6.283; return `<path d="M${f1(x + Math.cos(a) * 26)},${f1(y - 60 + Math.sin(a) * 26)} l${f1(Math.cos(a) * 12)},${f1(Math.sin(a) * 12)}" ${s1(1.6)}/>`; }).join(""),
  mortar: (x, y) => `<path d="M${x - 26},${y} q0,-30 26,-30 q26,0 26,30z" fill="${STONE}" ${s1(2)}/><ellipse cx="${x}" cy="${y - 30}" rx="26" ry="6" fill="${P2}" ${s1(1.4)}/>`,
  pine: (x, y) => `<path d="M${x},${y - 90} l-18,30 h8 l-14,26 h12 l-14,26 h52 l-14,-26 h12 l-14,-26 h8z" fill="#5b6a7e" ${s1(1.6)}/><path d="M${x},${y} v-8" ${s1(2)}/>`,
  apple: (x, y) => IT.tree(x, y) + [[-14, -80], [8, -90], [16, -70], [-4, -66]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="4" fill="#c8403a" ${s1(0.8)}/>`).join(""),
  goldtree: (x, y) => IT.tree(x, y).replace("#6f8f4f", "#a7b46a") + [[-18, -82], [8, -92], [18, -70], [-6, -66], [26, -84]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="5" fill="#e7b83a" ${s1(1)}/>`).join(""),
  teapot: (x, y) => `<path d="M${x - 20},${y - 30} h40" ${s1(4)}/><path d="M${x - 14},${y} l4,-30 M${x + 14},${y} l-4,-30" ${s1(2)}/><path d="M${x - 10},${y - 32} q0,-16 10,-16 q10,0 10,16z" fill="#e9dbb4" ${s1(1.2)}/><path d="M${x + 10},${y - 40} l8,-6" ${s1(1.4)}/><path d="M${x - 2},${y - 50} q2,-6 6,-2" fill="none" ${s1(1)}/>`,
  post: (x, y) => `<path d="M${x - 4},${y} v-50 h8 v50" fill="${WOOD}" ${s1(1.6)}/><path d="M${x - 8},${y - 50} h16" ${s1(2)}/><path d="M${x},${y - 50} v-4" ${s1(1)}/>`,
  ruin: (x, y) => `<path d="M${x - 30},${y} v-40 l10,-10 l6,8 l8,-14 v56z M${x + 6},${y} v-30 l12,-8 l8,10 v28z" fill="#9aa9a6" ${s1(1.6)}/><path d="M${x - 22},${y - 30} h8 v10 h-8z" fill="${K}"/>`,
  flyletters: (x, y) => [[-30, -40], [-6, -70], [20, -50], [34, -86], [-26, -96]].map(([dx, dy], i) => `<g transform="translate(${x + dx},${y + dy}) rotate(${i * 17 - 20})"><path d="M-10,-6 h20 v12 h-20z" fill="${P}" ${s1(1)}/><path d="M-10,-6 l10,7 l10,-7" fill="none" ${s1(0.8)}/></g>`).join(""),
  vine: (x, y) => `<path d="M${x - 40},${y - 100} q10,30 0,50 q-8,20 6,40 M${x + 30},${y - 100} q-14,24 4,46" fill="none" stroke="#5f7d45" stroke-width="3"/><path d="M${x - 10},${y - 90} l14,6 l-8,8z M${x + 12},${y - 60} l12,-2 l-4,10z" fill="#d6ecef" ${s1(1)}/>`,
  spears: (x, y) => [-24, -10, 6, 20].map((d, i) => `<path d="M${x + d},${y} l${(i - 1.5) * 4},-80" ${s1(1.8)}/><path d="M${x + d + (i - 1.5) * 4},${y - 80} l-4,8 l4,10 l4,-10z" fill="${P}" ${s1(1)}/>`).join(""),
  cairn: (x, y) => `<ellipse cx="${x}" cy="${y - 8}" rx="34" ry="9" fill="#a9a094" ${s1(1.6)}/><ellipse cx="${x - 2}" cy="${y - 22}" rx="24" ry="8" fill="#b8b0a2" ${s1(1.6)}/><ellipse cx="${x + 2}" cy="${y - 34}" rx="14" ry="6" fill="#a9a094" ${s1(1.4)}/><path d="M${x + 2},${y - 40} v-16 m-6,6 h12" ${s1(1.6)}/>`,
  nest: (x, y) => `<path d="M${x - 44},${y - 4} q44,-30 88,0 q-44,14 -88,0z" fill="#a0805a" ${s1(2)}/><path d="M${x - 36},${y - 10} l20,-8 M${x + 10},${y - 14} l22,6 M${x - 10},${y - 16} l16,6" ${s1(1)}/><ellipse cx="${x - 6}" cy="${y - 14}" rx="8" ry="10" fill="#e9dbb4" ${s1(1)}/><ellipse cx="${x + 10}" cy="${y - 14}" rx="7" ry="9" fill="#e9dbb4" ${s1(1)}/>`,
  feather: (x, y) => `<path d="M${x},${y - 20} q-30,-40 10,-76 q14,40 -10,76z" fill="#d9a43a" ${s1(1.4)}/><path d="M${x},${y - 20} q4,-36 10,-74" fill="none" ${s1(0.8)}/>`,
  pillar: (x, y) => `<path d="M${x - 14},${y} v-90 h28 v90z" fill="${STONE}" ${s1(1.8)}/><path d="M${x - 18},${y - 90} h36 v-8 h-36z M${x - 18},${y} h36 v-6 h-36z" fill="${STONE}" ${s1(1.4)}/><path d="M${x - 6},${y - 80} v70 M${x + 6},${y - 80} v70" ${s1(0.6)}/><path d="M${x - 8},${y - 54} h16 v12 h-16z" fill="#1c1820"/>`,
  eyes: (x, y) => `<ellipse cx="${x - 30}" cy="${y - 50}" rx="10" ry="4" fill="#e8c84a"/><ellipse cx="${x + 30}" cy="${y - 50}" rx="10" ry="4" fill="#e8c84a"/><path d="M${x - 30},${y - 54} v8 M${x + 30},${y - 54} v8" stroke="#1c1820" stroke-width="2"/>`,
};

// ── 단면도 그리기 ──
let uid = 0;
export function drawSection(site, CHARS, color) {
  const cfg = SEC[site.id];
  if (!cfg) return null;
  const id = "sx" + ++uid;
  const R = rng(site.id);
  const FH = 140, SL = 12; // 층 높이, 바닥판 두께
  const n = cfg.floors.length;
  const roofH = { tower: 150, manor: 110, ship: 60, dome: 0, terrace: 30, keep: 70, shaft: 0, house: 100, hall: 80, outdoor: 0, cliff: 0 }[cfg.shape];
  const top = 40 + roofH + (cfg.shape === "manor" ? 10 : 0);
  const maxW = Math.max(...cfg.floors.map((f) => f.narrow || cfg.w));
  const CX = 200 + maxW / 2 + ({ cliff: 120, shaft: 50, terrace: 240, ship: 60 }[cfg.shape] || 0);
  const wingW = cfg.wing ? 260 : 0;
  // 층 사각형
  const rects = cfg.floors.map((f, i) => {
    let w = f.narrow || cfg.w;
    let x = CX - w / 2;
    if (cfg.shape === "terrace") { w = cfg.w; x = CX - 300 + (n - 1 - i) * 70 - 60; }
    if (cfg.shape === "ship" && i === n - 1) { w = cfg.w * 0.82; x = CX - w / 2; }
    if (cfg.shape === "dome" && i === 0 && cfg.g > 0) { w = cfg.w * 0.72; x = CX - w / 2; }
    return { x, y: top + i * (FH + SL) - (f.dream ? 0 : 0), w, h: FH };
  });
  if (cfg.shape === "manor") rects.slice(1).forEach((r) => (r.y += 110));
  const rightMost = Math.max(...rects.map((r) => r.x + r.w)) + ({ cliff: 140, ship: 130, shaft: 70, outdoor: 50 }[cfg.shape] || 40);
  const VW = rightMost + (cfg.wing ? wingW + 30 : 20);
  const groundY = cfg.g >= n ? rects[n - 1].y + FH + SL : rects[cfg.g].y - SL / 2;
  const VH = rects[n - 1].y + FH + SL + 70;

  let o = `<svg class="section" viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg">`;
  o += `<defs><pattern id="${id}h" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="${P2}"/><path d="M0,0 v10" stroke="${K}" stroke-width="1.6"/></pattern>
    <pattern id="${id}e" width="40" height="30" patternUnits="userSpaceOnUse"><rect width="40" height="30" fill="#c8b38a"/><circle cx="8" cy="8" r="2.4" fill="#8f7a58"/><circle cx="28" cy="20" r="3" fill="#8f7a58"/><path d="M14,24 l6,-3 M30,6 l5,2" stroke="#6a5a40" stroke-width="1.2"/></pattern>
    <pattern id="${id}w" width="40" height="16" patternUnits="userSpaceOnUse"><rect width="40" height="16" fill="#a9c9d3"/><path d="M0,8 q10,-6 20,0 t20,0" fill="none" stroke="#5f8fa3" stroke-width="1.4"/></pattern></defs>`;
  // 배경: 하늘 / 땅 / 물
  const shape = cfg.shape;
  const sky = shape === "shaft" || cfg.dark ? "#2a2738" : site.id === "glass-tower" ? "#262c4a" : "#e9dfc6";
  o += `<rect width="${VW}" height="${VH}" fill="${sky}"/>`;
  if (shape !== "shaft" && !cfg.dark) for (let i = 0; i < 6; i++) o += `<path d="M${60 + R() * (VW - 200)},${30 + R() * Math.max(groundY - 120, 30)} q10,-8 20,0 q8,-10 22,0 q12,-4 14,4" fill="none" stroke="${K}" stroke-width="1" opacity=".35"/>`;
  if (groundY < VH) {
    const below = cfg.flooded || site.id === "abyss" || site.id === "pier" || site.id === "flumen" ? `url(#${id}w)` : `url(#${id}e)`;
    o += `<rect x="0" y="${groundY}" width="${VW}" height="${VH - groundY}" fill="${below}"/>`;
    o += `<path d="M0,${groundY} ${Array.from({ length: 14 }, (_, i) => `L${f1(((i + 1) / 14) * VW)},${f1(groundY + (R() - 0.5) * 6)}`).join(" ")}" fill="none" stroke="${K}" stroke-width="3"/>`;
    if (below.includes("e")) for (let x = 20; x < VW; x += 26) o += `<path d="M${x},${groundY - 2} l-3,-8 M${x + 6},${groundY - 2} l2,-7" stroke="#5f7d45" stroke-width="1.6"/>`;
  }
  // 산비탈 (계단식)
  if (shape === "terrace") {
    let d = `M0,${VH}`;
    [...rects].reverse().forEach((r) => (d += ` L${r.x - 30},${r.y + FH + SL} L${r.x + r.w + 16},${r.y + FH + SL}`));
    d += ` L${rects[0].x + rects[0].w + 120},${rects[0].y - 20} L${VW},${rects[0].y + 40} V${VH}z`;
    o += `<path d="${d}" fill="url(#${id}e)" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>`;
  }
  // 바깥 장소의 먼 언덕
  if ((shape === "outdoor" || shape === "cliff") && !cfg.dark) {
    const gy = Math.min(groundY, VH - 40);
    o += `<path d="M0,${gy} C${VW * 0.15},${gy - 90} ${VW * 0.3},${gy - 60} ${VW * 0.45},${gy - 30} S${VW * 0.8},${gy - 120} ${VW},${gy - 50} V${gy}z" fill="#d3c8a6" stroke="${K}" stroke-width="1.4" opacity=".8"/>`;
    o += `<path d="M0,${gy} C${VW * 0.2},${gy - 40} ${VW * 0.5},${gy - 70} ${VW * 0.7},${gy - 26} S${VW * 0.9},${gy - 40} ${VW},${gy - 20} V${gy}z" fill="#bfb38c" stroke="${K}" stroke-width="1.4" opacity=".85"/>`;
    for (let i = 0; i < 7; i++) { const tx = R() * VW, ty = gy - 10 - R() * 30; o += `<path d="M${f1(tx)},${f1(ty - 26)} l-9,16 h5 l-7,12 h22 l-7,-12 h5z" fill="#7d8a62" stroke="${K}" stroke-width="1"/>`; }
  }
  // 바위산/절벽
  if (shape === "cliff") {
    const yb = rects[n - 1].y + FH + 30;
    o += `<path d="M${CX - cfg.w / 2 - 110},${yb + 40} L${CX - cfg.w / 2 - 70},${rects[0].y + 40} L${CX - cfg.w / 2 + 40},${rects[0].y - 30} L${CX + 40},${rects[0].y - 10} L${CX + cfg.w / 2 + 30},${rects[0].y + 20} L${CX + cfg.w / 2 + 120},${yb + 40}z" fill="${cfg.volcanic ? "#8a5a48" : "#c9c1ad"}" stroke="${K}" stroke-width="3.4" stroke-linejoin="round"/>`;
    for (let i = 0; i < 40; i++) o += `<path d="M${f1(CX - cfg.w / 2 - 40 + R() * (cfg.w + 80))},${f1(rects[0].y + R() * (yb - rects[0].y))} l${f1(6 + R() * 8)},${f1(4 + R() * 6)}" stroke="${K}" stroke-width="1" opacity=".6"/>`;
    if (cfg.volcanic) o += `<path d="M${CX - 40},${rects[0].y - 10} q10,-50 -10,-90 q30,20 30,60 q10,-30 0,-60 q30,40 20,90" fill="#f2a443" stroke="${K}" stroke-width="1.6"/>`;
  }
  // 갱도
  if (shape === "shaft") {
    const x0 = CX - cfg.w / 2 - 50, y0 = rects[0].y + (rects[0].w < cfg.w ? FH : -10);
    o += `<rect x="${x0}" y="${y0}" width="${cfg.w + 100}" height="${VH - y0}" fill="url(#${id}e)" stroke="${K}" stroke-width="3"/>`;
  }
  // 바깥 공간(별채)
  if (cfg.wing) {
    const wf = cfg.wing, last = rects[Math.min(cfg.g, n) - 1] || rects[n - 1];
    const wx = wf.side === "right" ? Math.max(...rects.map((r) => r.x + r.w)) + 50 : 40;
    const wy = last.y + FH - 120;
    o += `<g class="wing"><path d="M${wx},${last.y + FH} h${wingW - 40}" stroke="${K}" stroke-width="2.4"/>`;
    if (wf.water) o += `<rect x="${wx}" y="${last.y + FH - 24}" width="${wingW - 40}" height="40" fill="url(#${id}w)"/>`;
    o += `<text x="${wx + (wingW - 40) / 2}" y="${wy - 6}" text-anchor="middle" class="sec-wing" font-family="Gowun Batang, serif" font-size="19" font-weight="700" fill="${K}">${esc(wf.t)}</text>`;
    o += `<path d="M${wx + 20},${wy + 6} h${wingW - 80}" stroke="${K}" stroke-width=".8" stroke-dasharray="3 4"/></g>`;
    rects.wing = { x: wx, y: last.y + FH - FH, w: wingW - 40, h: FH, f: wf };
  }

  // 지붕
  const r0 = rects[0];
  const roof = () => {
    const L = r0.x - 14, Rr = r0.x + r0.w + 14, M = r0.x + r0.w / 2, T = r0.y - SL;
    switch (shape) {
      case "tower":
        if (cfg.roof === "sun") return `<path d="M${L},${T} L${M},${T - 140} L${Rr},${T}z" fill="${color}" stroke="${K}" stroke-width="3"/><circle cx="${M}" cy="${T - 160}" r="26" fill="#f0c95a" stroke="${K}" stroke-width="2.6"/>` + Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * 6.283; return `<path d="M${f1(M + Math.cos(a) * 32)},${f1(T - 160 + Math.sin(a) * 32)} l${f1(Math.cos(a) * (i % 2 ? 8 : 16))},${f1(Math.sin(a) * (i % 2 ? 8 : 16))}" stroke="${K}" stroke-width="2"/>`; }).join("");
        if (cfg.roof === "lamp") return `<path d="M${L + 20},${T} L${M},${T - 70} L${Rr - 20},${T}z" fill="#3a3240" stroke="${K}" stroke-width="3"/><path d="M${M},${T - 70} v-24" stroke="${K}" stroke-width="2"/>`;
        if (cfg.roof === "glass") return `<path d="M${L},${T} L${M},${T - 150} L${Rr},${T}z" fill="#d6ecef" fill-opacity=".5" stroke="${K}" stroke-width="2.4"/><path d="M${M},${T - 150} V${T}" stroke="${K}" stroke-width="1"/>`;
        if (cfg.roof === "ruin") return `<path d="M${L},${T} v-30 l20,10 l16,-26 l18,20 l20,-34 l14,24 l20,-12 v48z" fill="${STONE}" stroke="${K}" stroke-width="2.6"/>`;
        return `<path d="M${L},${T} L${M},${T - 130} L${Rr},${T}z" fill="${color}" stroke="${K}" stroke-width="3"/><path d="M${M},${T - 130} v-20" stroke="${K}" stroke-width="2"/>`;
      case "manor": { const B = rects[1].y - SL, r1 = rects[1]; const l = r1.x - 14, rr = r1.x + r1.w + 14; return `<path d="M${l - 20},${B} L${l + 60},${B - 80} H${rr - 60} L${rr + 20},${B}z" fill="#3c4a7a" stroke="${K}" stroke-width="3"/>` + [l + 120, rr - 160].map((x) => `<path d="M${x},${B - 80} v-26 h22 v26" fill="${P}" stroke="${K}" stroke-width="2"/>`).join("") + Array.from({ length: 6 }, (_, k) => `<path d="M${rr - 40 - k * 34},${B - 84 - k * 22} h30 v8 h-30z" fill="${STONE}" stroke="${K}" stroke-width="1.6"/>`).join(""); }
      case "house": return `<path d="M${L - 16},${T} L${M},${T - 100} L${Rr + 16},${T}z" fill="${color}" stroke="${K}" stroke-width="3"/><path d="M${Rr - 80},${T - 40} v-60 h26 v40" fill="${P}" stroke="${K}" stroke-width="2.4"/>` + Array.from({ length: 8 }, (_, i) => `<path d="M${f1(L + (i + 1) * ((Rr - L) / 9))},${T - 4} l${i < 4 ? 8 : -8},-12" stroke="${K}" stroke-width="1"/>`).join("");
      case "hall": if (cfg.roof === "arena") return `<path d="M${L - 30},${T} q${(Rr - L) / 2 + 30},-90 ${Rr - L + 60},0" fill="none" stroke="${K}" stroke-width="3"/>` + [L + 40, Rr - 40].map((x) => `<path d="M${x},${T} v-60" stroke="${K}" stroke-width="2"/><path d="M${x},${T - 60} l18,6 l-18,6" fill="${color}" stroke="${K}" stroke-width="1.4"/>`).join("");
        return `<path d="M${L - 20},${T} L${M},${T - 80} L${Rr + 20},${T}z" fill="${cfg.dark ? "#45506e" : P}" stroke="${K}" stroke-width="3"/><path d="M${L + 40},${T - 10} L${M},${T - 64} L${Rr - 40},${T - 10}z" fill="none" stroke="${K}" stroke-width="1.2"/><circle cx="${M}" cy="${T - 36}" r="12" fill="${color}" stroke="${K}" stroke-width="1.6"/>`;
      case "keep": { let s = ""; for (let x = L; x < Rr - 10; x += 28) s += `<rect x="${x}" y="${T - 22}" width="16" height="22" fill="${STONE}" stroke="${K}" stroke-width="2"/>`; return s + `<path d="M${M},${T - 22} v-40" stroke="${K}" stroke-width="2"/><path d="M${M},${T - 62} l24,8 l-24,8z" fill="${color}" stroke="${K}" stroke-width="1.6"/>`; }
      case "ship": return `<path d="M${M},${T} v-60" stroke="${K}" stroke-width="4"/>` + `<path d="M${M},${T - 60} l30,10 l-30,10z" fill="${color}" stroke="${K}" stroke-width="1.6"/>`;
      case "terrace": return rects.map((r) => `<path d="M${r.x + r.w - 60},${r.y - SL} v-40 h22 v40" fill="#a8533a" stroke="${K}" stroke-width="2"/><path d="M${r.x + r.w - 49},${r.y - SL - 46} q-6,-12 2,-22 q8,-10 0,-22" fill="none" stroke="#7a6d66" stroke-width="3"/>`).join("");
      case "dome": {
        const a = rects[0], b = rects[Math.min(1, n - 1)];
        const dx = b.x - 14, dw = b.w + 28, dy = b.y + FH;
        return `<path d="M${dx},${dy} V${a.y + 30} A${dw / 2},${dw / 2.4} 0 0 1 ${dx + dw},${a.y + 30} V${dy}" fill="none" stroke="${K}" stroke-width="3.4"/>` +
          Array.from({ length: 7 }, (_, i) => `<path d="M${f1(dx + (i + 1) * dw / 8)},${dy} V${f1(a.y + 30 - Math.sin(((i + 1) / 8) * Math.PI) * (dw / 2.4) + 4)}" stroke="${K}" stroke-width="1" opacity=".55"/>`).join("") +
          (cfg.broken ? "" : `<path d="M${M},${a.y - dw / 2.4 + 30} v-40" stroke="#8a6440" stroke-width="6"/><path d="M${M},${a.y - dw / 2.4 - 6} c-40,-4 -44,-40 -14,-44 c4,-24 36,-22 36,0 c26,6 20,44 -22,44z" fill="#6f8f4f" stroke="${K}" stroke-width="2"/>`);
      }
      default: return "";
    }
  };
  if (shape !== "outdoor" && shape !== "cliff") o += roof();

  // 층
  rects.forEach((r, i) => {
    const f = cfg.floors[i];
    const under = i >= cfg.g;
    const outdoor = shape === "outdoor";
    if (shape === "cliff") {
      o += `<path d="M${r.x + 10},${r.y + r.h} q-14,-${r.h * 0.6} 20,-${r.h - 10} h${r.w - 60} q34,10 30,${r.h - 10}z" fill="${cfg.volcanic ? "#5a3a32" : "#efe6cf"}" stroke="${K}" stroke-width="2.6"/>`;
    } else if (outdoor) {
      if ((f.it || []).includes("water")) o += `<rect x="${r.x + 20}" y="${r.y + 30}" width="${r.w - 40}" height="${r.h - 34}" rx="50" fill="url(#${id}w)" stroke="${K}" stroke-width="2.4"/>`;
      if (i > 0) o += `<path d="M${r.x - 40},${r.y - SL / 2} h${r.w + 80}" stroke="${K}" stroke-width="1" stroke-dasharray="6 6" opacity=".6"/>`;
    } else {
      // 단면 벽(빗금) + 내부
      o += `<rect x="${r.x - 14}" y="${r.y - SL}" width="${r.w + 28}" height="${r.h + SL * 2}" fill="url(#${id}h)" stroke="${K}" stroke-width="3"/>`;
      const inner = f.redact ? "#1d1a22" : f.dream ? "#d9dcef" : cfg.dark ? "#4a4b66" : cfg.glass ? "#d6ecef" : shape === "shaft" ? "#e3d6b8" : i % 2 ? P : "#efe2c4";
      o += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${inner}" stroke="${K}" stroke-width="1.4"/>`;
      if (!f.redact) {
        // 벽지 결
        for (let x = r.x + 24; x < r.x + r.w; x += 34) o += `<path d="M${x},${r.y + 6} v${r.h - 12}" stroke="${K}" stroke-width=".6" opacity=".14"/>`;
        o += `<path d="M${r.x},${r.y + r.h - 4} h${r.w}" stroke="${K}" stroke-width="1" opacity=".5"/>`;
        if (shape === "shaft" && i > 0 && f.n !== "▽") {
          const vx = r.x + r.w / 2;
          o += `<rect x="${vx - 50}" y="${r.y}" width="100" height="${r.h}" fill="#141019"/>`;
          o += `<path d="M${vx - 50},${r.y + r.h - 20} L${vx + 50},${r.y + 20}" stroke="#d7b25a" stroke-width="1.4" stroke-dasharray="4 4" opacity=".7"/>`;
        }
        // 계단 (층 사이를 잇는 사선)
        if (i < n - 1 && shape !== "terrace" && shape !== "outdoor") {
          const sx = i % 2 ? r.x + 18 : r.x + r.w - 70;
          for (let k = 0; k < 5; k++) o += `<path d="M${sx + k * 10},${r.y + r.h - k * 7} h10 v-7" fill="none" stroke="${K}" stroke-width="1.2" opacity=".55"/>`;
        }
      } else {
        o += `<text x="${r.x + r.w / 2}" y="${r.y + r.h / 2 + 8}" text-anchor="middle" font-family="IM Fell English SC, serif" font-size="26" letter-spacing="6" fill="#d8c8a0">CLASSIFIED</text>`;
        o += `<path d="M${r.x + 20},${r.y + 20} L${r.x + r.w - 20},${r.y + r.h - 20} M${r.x + r.w - 20},${r.y + 20} L${r.x + 20},${r.y + r.h - 20}" stroke="#d8c8a0" stroke-width="1" opacity=".3"/>`;
      }
    }
    if (shape === "ship" && i === n - 1) o += `<path d="M${r.x - 60},${r.y - SL} H${r.x + r.w + 60} L${r.x + r.w},${r.y + r.h + SL} H${r.x}z" fill="none" stroke="${K}" stroke-width="3.4"/><path d="M${r.x - 120},${r.y + 6} H${r.x + r.w + 120}" stroke="#5f8fa3" stroke-width="2" stroke-dasharray="10 6"/>`;
  });
  if (cfg.flooded) o += `<rect x="0" y="${rects[0].y + FH + SL}" width="${VW}" height="${VH}" fill="#7fa7b5" opacity=".35"/>`;
  if (cfg.fog) for (let i = 0; i < 8; i++) o += `<path d="M${f1(R() * VW)},${f1(60 + R() * (VH - 120))} q40,-14 80,0 q40,14 80,0" fill="none" stroke="#fbf8ef" stroke-width="12" stroke-linecap="round" opacity=".6"/>`;
  if (cfg.shape === "manor") o += [0, 1, 2].map((k) => `<path d="M${rects[0].x - 40 + k * 260},${rects[0].y + FH + 14} q-30,-6 -20,-24 q20,-14 40,-2 q30,-14 46,6 q18,4 4,20z" fill="#fbf8ef" stroke="${K}" stroke-width="1.6"/>`).join("");

  // 가구와 인물
  const pins = [];
  const placeRow = (r, f) => {
    const items = f.it || [], who = f.who || [];
    const order = [];
    let a = 0, b = 0;
    while (a < items.length || b < who.length) {
      if (a < items.length) order.push(["i", items[a++]]);
      if (b < who.length) order.push(["n", who[b++]]);
    }
    const pad = shape === "outdoor" || shape === "cliff" ? 40 : 30;
    const span = r.w - pad * 2 - (shape === "terrace" || f.redact ? 0 : 40);
    const startX = r.x + pad + (cfg.floors.indexOf(f) % 2 ? 50 : 0);
    order.forEach(([t, v], k) => {
      const x = f1(startX + (span * (k + 0.5)) / order.length);
      const y = r.y + r.h - 4;
      if (t === "i") o += (IT[v] || IT.crate)(x, y, color);
      else pins.push({ name: v, x, y });
    });
  };
  rects.forEach((r, i) => placeRow(r, cfg.floors[i]));
  if (rects.wing) placeRow(rects.wing, rects.wing.f);

  // 층 표기 (왼쪽 여백)
  rects.forEach((r, i) => {
    const f = cfg.floors[i];
    const ly = r.y + r.h / 2;
    o += `<g class="flabel"><path d="M120,${ly} H${r.x - 22}" stroke="${K}" stroke-width=".8" stroke-dasharray="2 4"/>
      <circle cx="96" cy="${ly - 6}" r="22" fill="${P}" stroke="${K}" stroke-width="2"/><circle cx="96" cy="${ly - 6}" r="17" fill="none" stroke="${color}" stroke-width="1.4"/>
      <text x="96" y="${ly}" text-anchor="middle" font-family="Cinzel, serif" font-weight="700" font-size="${f.n.length > 2 ? 11 : 15}" fill="${K}">${esc(f.n)}</text>
      <text x="${r.x + 10}" y="${r.y + 24}" font-family="Gowun Batang, serif" font-weight="700" font-size="19" fill="${f.redact || cfg.dark || cfg.volcanic ? "#f4e9cd" : K}" class="room-name">${esc(f.t)}</text></g>`;
  });

  // 인물 표식
  for (const p of pins) {
    const c = CHARS[p.name];
    const clip = `${id}c${pins.indexOf(p)}`;
    const img = c && c.img ? c.img : null;
    const veiled = c && c.imgSpoiler;
    o += `<g class="npc-pin${veiled ? " veiled" : ""}" data-npc="${esc(p.name)}" transform="translate(${p.x},${p.y})" tabindex="0" role="button" aria-label="${esc(p.name)} 소개 보기">
      <path d="M0,0 l-9,-20 h18z" fill="${K}"/>
      <circle cy="-50" r="32" fill="${P}" stroke="${K}" stroke-width="2.6"/>
      <circle cy="-50" r="32" fill="none" stroke="${color}" stroke-width="5" stroke-dasharray="2 5"/>
      <clipPath id="${clip}"><circle cy="-50" r="26"/></clipPath>
      ${img ? `<image href="${img}" x="-30" y="-80" width="60" height="88" preserveAspectRatio="xMidYMin slice" clip-path="url(#${clip})" ${veiled ? `filter="url(#${id}b)"` : ""}/>` : `<text y="-42" text-anchor="middle" font-size="24" fill="${K}">${esc(p.name[0])}</text>`}
      <g transform="translate(0,-92)"><path d="M${-p.name.length * 9 - 14},-13 h${p.name.length * 18 + 28} l-7,13 l7,13 h${-p.name.length * 18 - 28} l7,-13z" fill="${K}"/><text y="5" text-anchor="middle" font-family="Gowun Batang, serif" font-weight="700" font-size="16" fill="${P}">${esc(p.name)}</text></g>
    </g>`;
  }
  o = o.replace("</defs>", `<filter id="${id}b"><feGaussianBlur stdDeviation="5"/></filter></defs>`);
  o += `</svg>`;
  return o;
}
