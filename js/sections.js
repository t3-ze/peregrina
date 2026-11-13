// 기관 단면도: 건물을 세로로 잘라 모든 층을 보여 준다. 층마다 가구와 장식, 머무는 인물의 표식을 둔다.
import { rng, f1, esc } from "./util.js";

const K = "#2c2015", P = "#f4e9cd", P2 = "#e6d6b0", WOOD = "#9a6e45", STONE = "#b9b2a4";

// ── 기관별 단면 (위층 → 아래층) ──
// shape: build(건물) · ship(배) · terrace(비탈 계단식) · shaft(수직 갱도) · outdoor(바깥) · cliff(절벽)
// wall: 벽 재질 marble·stone·brick·timber·plank·glass·stripes·dream / stair: straight·spiral·none
// ext: 바깥 장식 buttress·cloister·turrets·columns·jetty·chimney·clock·bridge·awning·sign·tiers·hull·rigging
// 층: n 표기, t 이름, it 가구, who 인물, w 폭, dx 가로 어긋남, ceil 천장(flat·arch·gothic·dome·vault·attic), roof 지붕(종류:재질), wall 벽 재질 덮어쓰기
// g: 지면 아래로 내려가는 첫 층의 순번
export const SEC = {
  aurora: { shape: "build", wall: "marble", stair: "spiral", ext: ["buttress", "cloister"], g: 7, floors: [
    { n: "7F", t: "새벽 기도실", it: ["candle", "altar", "candle"], w: 300, ceil: "dome", roof: "sun:gold" },
    { n: "6F", t: "원장실", it: ["win", "desk", "plant"], who: ["셀레스틴"], w: 320, ceil: "gothic" },
    { n: "5F", t: "교관 숙소 · 지도관실", it: ["desk", "clock", "bed"], who: ["가브리엘"], w: 340, ceil: "gothic" },
    { n: "4F", t: "견습생 숙소 · 북쪽 계단참", it: ["bunk", "chest"], who: ["루시앙"], w: 360 },
    { n: "3F", t: "도서실 · 성유물 보관소", it: ["shelf", "lectern", "shelf"], w: 380, ceil: "arch" },
    { n: "2F", t: "강의실", it: ["lectern", "bench", "globe"], w: 400, ceil: "arch" },
    { n: "1F", t: "정화의 회랑 · 치유 진료소", it: ["bed", "jars", "bed", "counter"], w: 420, ceil: "gothic" },
    { n: "B1", t: "정화 수조", it: ["tank", "chest", "tank"], w: 440, ceil: "vault", wall: "stone" } ] },
  somnium: { shape: "build", wall: "timber", stair: "straight", ext: ["jetty", "chimney"], g: 4, float: 1, floors: [
    { n: "夢", t: "꿈층 · 끝없는 도서관", it: ["shelf", "lantern", "shelf", "cloud", "shelf"], who: ["녹스"], w: 560, ceil: "gothic", wall: "dream", dream: true },
    { n: "3F", t: "원장의 서재 · 학생 숙소", it: ["shelf", "desk", "bed"], w: 600, ceil: "attic", roof: "mansard:slate" },
    { n: "2F", t: "꿈 전언실 · 해몽실", it: ["bed", "bed", "candle", "bed"], who: ["이졸데"], w: 660 },
    { n: "1F", t: "현관홀 · 월광 강의실 · 식당", it: ["door", "lectern", "table", "lantern"], who: ["카스"], w: 600, ceil: "arch", wall: "stone" } ] },
  flumen: { shape: "ship", wall: "plank", stair: "straight", ext: ["rigging"], g: 3, water: true, floors: [
    { n: "塔", t: "돛대 종탑 · 수위 관측대", it: ["bell", "scope"], who: ["마테오"], w: 190, dx: -170, roof: "conic:copper" },
    { n: "UP", t: "강의실 · 해먹 선실", it: ["lectern", "hammock", "hammock"], w: 460, dx: 40, ceil: "arch", roof: "gable:copper" },
    { n: "DK", t: "갑판층 · 도선 수로 · 기록 보관소", it: ["boat", "letters", "table", "laundry"], who: ["니나"], w: 680 },
    { n: "HD", t: "선창 · 유리 바닥 물길 강의실", it: ["tank", "barrel", "crate", "tank"], w: 600, ceil: "vault" } ],
    wing: { side: "right", t: "원장의 배", it: ["boat"], who: ["오르솔라"], water: true } },
  hortus: { shape: "build", wall: "glass", stair: "spiral", ext: ["chimney"], g: 2, floors: [
    { n: "2F", t: "공중 회랑 · 사교실 · 축제 준비실", it: ["banner", "bench", "flowers"], who: ["앙리"], w: 460, ceil: "dome", roof: "dome:glass" },
    { n: "1F", t: "월계수 원장실 · 조향실 · 강의 온실", it: ["jars", "tree", "desk", "plant"], who: ["베아트리체"], w: 660, roof: "gable:glass" },
    { n: "B1", t: "뿌리층 · 씨앗 보관고 · 약초 건조실", it: ["jars", "herbs", "crate", "herbs"], w: 600, ceil: "vault", wall: "brick" } ],
    wing: { side: "right", t: "바깥 정원 · 금지 울타리", it: ["flowers", "fence"], who: ["로즈마리"] } },
  fornax: { shape: "terrace", wall: "brick", stair: "straight", g: 5, floors: [
    { n: "5", t: "관장의 대장간", it: ["forge", "anvil"], who: ["브란"], w: 320, roof: "saw:slate" },
    { n: "4", t: "교관 대장간 · 강화술 연습장", it: ["anvil", "target"], w: 360, roof: "saw:tile" },
    { n: "3", t: "공동 화로 광장 · 식당", it: ["fire", "table"], w: 400, ceil: "arch", roof: "gable:tile" },
    { n: "2", t: "견습 작업장 · 다락 숙소", it: ["forge", "desk", "bed"], who: ["토비"], w: 380, roof: "saw:tile" },
    { n: "1", t: "정문 · 투기장 터널 · 무기고", it: ["sword", "door"], who: ["레아"], w: 420, ceil: "vault", roof: "flat" } ] },
  tonans: { shape: "build", wall: "stone", stair: "straight", ext: ["turrets"], g: 5, floors: [
    { n: "5F", t: "결계 탑 꼭대기 · 원장실", it: ["win", "desk", "banner"], who: ["하인리히"], w: 280, ceil: "gothic", roof: "conic:slate" },
    { n: "4F", t: "교관실 · 문서실", it: ["shelf", "desk", "clock"], w: 600, roof: "crenel" },
    { n: "3F", t: "학생회실 · 도서관 · 생도 숙소", it: ["desk", "shelf", "bunk"], who: ["엘레오노르"], w: 600 },
    { n: "2F", t: "강의실", it: ["map", "lectern", "bench"], w: 600, ceil: "arch" },
    { n: "1F", t: "안뜰 연병장 · 위병소 · 식당", it: ["target", "sword", "table"], w: 600, ceil: "gothic" },
    { n: "B1", t: "결계 연습장 · 징계실", it: ["target", "chest", "rune"], w: 560, ceil: "vault" } ] },
  profundum: { shape: "shaft", wall: "stone", g: 1, w: 640, floors: [
    { n: "GL", t: "입구 · 가고일 · 출입 명부", it: ["statue", "lectern"], w: 280, ceil: "gothic", roof: "pointed:slate" },
    { n: "B1-2", t: "열람실 · 강의실 · 연구자 숙소", it: ["shelf", "desk", "lamp", "shelf"] },
    { n: "B3-5", t: "고문서 서가 · 기록관실", it: ["shelf", "scroll", "desk"], who: ["핀"] },
    { n: "B6", t: "봉인관", it: ["chest", "cage", "jars"], who: ["이리나"] },
    { n: "B7-8", t: "하층 서가", it: ["shelf", "clock", "shelf"] },
    { n: "B9", t: "대사서실", it: ["shelf", "desk", "globe"], who: ["에제키엘"] },
    { n: "▽", t: "금서고 계단 · 닫힌 문", it: ["bigdoor"], w: 320, ceil: "gothic", end: true } ] },

  concilium: { shape: "build", wall: "marble", stair: "straight", ext: ["columns"], g: 2, floors: [
    { n: "2F", t: "사절 참관석", it: ["banner", "chair", "chair"], who: ["퍽"], w: 460, ceil: "dome", roof: "dome:copper" },
    { n: "1F", t: "본회의장 · 의장석 · 의원석", it: ["bench", "throne", "bench"], who: ["아우구스투스", "세실리아"], w: 660, ceil: "arch", roof: "flat" },
    { n: "B1", t: "맹약문 보관실", it: ["scroll", "chest", "lamp"], w: 580, ceil: "vault", wall: "stone" } ] },
  tabularium: { shape: "build", wall: "marble", stair: "straight", ext: ["columns"], g: 2, floors: [
    { n: "2F", t: "기록원장실", it: ["shelf", "desk", "clock"], who: ["아드리안 그레이"], w: 600, roof: "pediment" },
    { n: "1F", t: "각인 감정실 · 계약 대장고", it: ["lectern", "shelf", "shelf"], who: ["야나"], w: 620, ceil: "arch" },
    { n: "B1", t: "봉인 서고", it: ["shelf", "chest", "shelf"], w: 560, ceil: "vault", wall: "stone" } ] },
  ordo: { shape: "build", wall: "stone", stair: "straight", ext: ["turrets"], g: 3, floors: [
    { n: "3F", t: "단장실", it: ["map", "desk", "banner"], who: ["레온하르트"], w: 300, ceil: "gothic", roof: "conic:slate" },
    { n: "2F", t: "기사 숙소 · 무기고", it: ["bunk", "sword", "bunk"], w: 560, roof: "crenel" },
    { n: "1F", t: "훈련장 · 순찰로 대기실", it: ["target", "sword", "bench"], who: ["미라"], w: 560, ceil: "arch" } ],
    wing: { side: "right", t: "마구간", it: ["hay", "barrel"], who: ["고드윈"] } },
  cursus: { shape: "build", wall: "brick", stair: "straight", ext: ["clock"], g: 3, floors: [
    { n: "3F", t: "국장실", it: ["desk", "clock", "letters"], who: ["오토"], w: 500, ceil: "attic", roof: "mansard:slate" },
    { n: "2F", t: "분류실", it: ["letters", "mailbag", "letters"], who: ["피오"], w: 580 },
    { n: "1F", t: "분실 우편 보관소", it: ["letters", "chest", "golem"], who: ["그레타"], w: 580, ceil: "arch" } ],
    wing: { side: "right", t: "우편선 부두", it: ["boat"], water: true } },
  mercator: { shape: "build", wall: "timber", stair: "straight", ext: ["jetty", "bridge"], g: 3, water: true, floors: [
    { n: "3F", t: "조합장실", it: ["chest", "desk", "scales"], who: ["로렌초", "세실리아"], w: 600, ceil: "attic", roof: "gambrel:tile" },
    { n: "2F", t: "뒷골목 골동품 가게", it: ["shelf", "mirror", "jars"], who: ["자스민"], w: 620 },
    { n: "1F", t: "대운하 시장 다리 · 행운의 노점", it: ["counter", "crate", "barrel"], who: ["오닐"], w: 540, wall: "stone", ceil: "arch" } ] },
  "tabularium-branch": { shape: "build", wall: "brick", stair: "straight", ext: ["awning", "chimney"], g: 2, floors: [
    { n: "2F", t: "서류 보관실", it: ["shelf", "shelf"], w: 480, ceil: "attic", roof: "gable:tile" },
    { n: "1F", t: "등록 창구 · 대기실", it: ["flowers", "counter", "bench"], who: ["토마스"], w: 520 } ] },
  inn: { shape: "build", wall: "timber", stair: "straight", ext: ["jetty", "chimney", "sign"], g: 4, floors: [
    { n: "AT", t: "다락 하숙방", it: ["bed", "chest", "cloudlet"], who: ["카이"], w: 460, ceil: "attic", roof: "gable:tile" },
    { n: "2F", t: "객실", it: ["bed", "bunk", "bed"], who: ["아샤", "테오"], w: 660 },
    { n: "1F", t: "카운터 · 식당 · 공연 무대", it: ["counter", "table", "harp", "table"], who: ["마르타", "탈리에신"], w: 620, wall: "stone" },
    { n: "B1", t: "포도주 저장고", it: ["barrel", "barrel", "crate"], w: 560, ceil: "vault", wall: "stone" } ] },
  workshop: { shape: "build", wall: "brick", stair: "straight", ext: ["chimney"], g: 2, floors: [
    { n: "2F", t: "창고 · 시제품 선반", it: ["crate", "shelf", "chest"], w: 480, roof: "saw:slate" },
    { n: "1F", t: "작업대 · 진열장", it: ["shelf", "anvil", "desk"], who: ["빔"], w: 500, ceil: "arch" } ],
    wing: { side: "right", t: "시험 마당", it: ["target", "spark"] } },
  limen: { shape: "build", wall: "stripes", stair: "spiral", g: 4, floors: [
    { n: "LT", t: "등불실", it: ["beacon"], w: 200, wall: "glass", roof: "lantern" },
    { n: "3F", t: "관측실 · 경계 연구실", it: ["scope", "globe"], who: ["오스왈드"], w: 270 },
    { n: "2F", t: "표류자 숙소", it: ["bed", "table"], who: ["한서진"], w: 310 },
    { n: "1F", t: "관측소장실 · 접수", it: ["desk", "jars"], who: ["이브"], w: 350, ceil: "arch" } ] },
  vigilia: { shape: "build", wall: "timber", stair: "straight", ext: ["chimney"], g: 2, floors: [
    { n: "2F", t: "쉼터 다락", it: ["bed", "crate"], w: 460, ceil: "attic", roof: "thatch" },
    { n: "1F", t: "뒤틀린 사역마 쉼터", it: ["cage", "bowl", "plant"], who: ["엘린"], w: 500 },
    { n: "??", t: "본부 (비공개)", it: [], who: ["야경", "시온"], w: 460, ceil: "vault", wall: "stone", redact: true } ],
    wing: { side: "right", t: "마당의 물푸레나무", it: ["ash"] } },
  caliburnus: { shape: "build", wall: "stone", stair: "straight", g: 3, fog: true, dark: true, ext: ["buttress"], floors: [
    { n: "?", t: "가면의 회합실 (장소 불명)", it: ["candle", "table", "candle"], who: ["펜드라곤"], w: 480, ceil: "gothic", roof: "pointed:slate" },
    { n: "?", t: "하프 소리가 나는 곳", it: ["harp", "bench"], who: ["탈리에신"], w: 540, ceil: "gothic" },
    { n: "?", t: "바위 곁", it: ["rock"], who: ["퍼시벌"], w: 580, ceil: "vault" } ] },
  "shadow-palace": { shape: "build", wall: "stone", stair: "straight", g: 3, dark: true, ext: ["buttress"], floors: [
    { n: "玉", t: "안개의 옥좌", it: ["banner", "throne", "banner"], who: ["오베론"], w: 440, ceil: "gothic", roof: "spires:slate" },
    { n: "鏡", t: "거울 회랑", it: ["mirror", "mirror", "mirror"], w: 600, ceil: "gothic", roof: "pointed:slate" },
    { n: "庭", t: "꿈의 정원", it: ["flowers", "tree", "flowers"], w: 660, ceil: "arch" } ] },
  arena: { shape: "build", wall: "stone", stair: "straight", ext: ["tiers"], g: 2, floors: [
    { n: "上", t: "주인석 · 관중석", it: ["bench", "throne", "bench"], who: ["페트라"], w: 520, roof: "flat" },
    { n: "場", t: "결투장 · 대기실", it: ["target", "sword", "bench"], who: ["레아"], w: 600, ceil: "arch" } ] },
  "bell-tower": { shape: "build", wall: "stone", stair: "spiral", g: 1, water: true, flooded: true, floors: [
    { n: "鐘", t: "종루", it: ["bell"], who: ["청류"], w: 240, ceil: "arch", roof: "conic:slate" },
    { n: "階", t: "물에 잠긴 계단", it: ["stairs"], w: 260 },
    { n: "村", t: "잠긴 마을", it: ["ruin", "ruin"], w: 560, ceil: "vault" } ] },
  "glass-tower": { shape: "build", wall: "glass", stair: "spiral", g: 3, night: true, floors: [
    { n: "頂", t: "꼭대기 서재", it: ["shelf", "desk"], who: ["멀린"], w: 250, ceil: "gothic", roof: "glass" },
    { n: "空", t: "편지의 하늘", it: ["flyletters"], w: 290 },
    { n: "螺", t: "나선 계단", it: ["letters"], w: 330 } ] },
  "herb-shop": { shape: "build", wall: "timber", stair: "straight", ext: ["chimney"], g: 2, floors: [
    { n: "2F", t: "약초 건조대", it: ["herbs", "jars"], w: 400, dx: 18, ceil: "attic", roof: "thatch" },
    { n: "1F", t: "가게 카운터", it: ["jars", "counter", "cauldron"], who: ["셀윈"], w: 440, dx: -8 } ],
    wing: { side: "right", t: "뒷마당 밭", it: ["flowers", "plant"] } },
  greenhouse: { shape: "build", wall: "glass", stair: "none", g: 2, broken: true, floors: [
    { n: "頂", t: "깨진 유리 지붕", it: ["vine", "vine"], w: 380, ceil: "dome", roof: "dome:glass" },
    { n: "1F", t: "시든 화단 · 녹슨 도구함", it: ["wilted", "chest", "wilted"], who: ["나르기스"], w: 520, wall: "brick" } ] },
  "storm-watch": { shape: "build", wall: "stone", stair: "spiral", g: 9, floors: [
    { n: "頂", t: "무너진 망루", it: ["cloud"], who: ["휘린"], w: 240, roof: "broken" },
    { n: "階", t: "번개 자국 계단", it: ["stairs"], w: 260 },
    { n: "地", t: "풀밭 쪽 문간", it: ["flowers", "door"], w: 300, ceil: "arch" } ] },
  "garuda-tower": { shape: "build", wall: "stone", stair: "spiral", g: 9, floors: [
    { n: "頂", t: "탑 꼭대기 (금역)", it: ["nest"], who: ["가루다"], w: 220, ceil: "dome", roof: "spire:gold" },
    { n: "羽", t: "깃털의 계단", it: ["feather"], w: 260 },
    { n: "門", t: "탑의 밑동", it: ["door"], w: 300, ceil: "gothic" } ] },
  "closed-door": { shape: "shaft", wall: "stone", g: 0, w: 560, floors: [
    { n: "▽", t: "금서고 계단", it: ["pillar"] },
    { n: "▽", t: "빈 홈", it: ["pillar", "pillar"] },
    { n: "門", t: "돌문 앞", it: ["bigdoor"], who: ["네페르"], w: 400, ceil: "gothic", end: true } ] },
  "deep-bottom": { shape: "shaft", wall: "stone", g: 0, w: 560, floors: [
    { n: "▽", t: "하층 갱도", it: ["bones"] },
    { n: "∞", t: "어둠", it: ["eyes"], who: ["니드호그"], redact: true, end: true } ] },

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
  avallach: { shape: "outdoor", w: 640, g: 2, floors: [
    { n: "林", t: "사과나무 길", it: ["apple", "apple", "apple"] },
    { n: "舍", t: "오두막", it: ["table", "teapot", "bed"], who: ["비비안"] },
    { n: "湖", t: "고요한 호수", it: ["water"] } ] },
  pier: { shape: "outdoor", w: 600, g: 2, water: true, floors: [
    { n: "上", t: "선착장", it: ["crate", "boat", "post"], who: ["지오"] },
    { n: "水", t: "대운하 물길", it: ["water"] } ] },
  abyss: { shape: "outdoor", w: 560, g: 0, water: true, floors: [
    { n: "水", t: "심연의 입구", it: ["water"] },
    { n: "深", t: "푸른 잠자리", it: ["shell", "water"], who: ["멜뤼진"] } ] },
  "golden-garden": { shape: "outdoor", w: 600, g: 2, floors: [
    { n: "樹", t: "황금 사과나무", it: ["goldtree"], who: ["헤스페리데스"] },
    { n: "池", t: "노을의 연못", it: ["water"] } ] },
  "spear-hill": { shape: "outdoor", w: 600, g: 2, floors: [
    { n: "風", t: "창의 숲", it: ["spears", "spears"], who: ["힐드"] },
    { n: "塚", t: "이름 없는 돌무덤", it: ["cairn"] } ] },
  crater: { shape: "cliff", w: 600, g: 9, volcanic: true, floors: [
    { n: "火", t: "화구 가장자리", it: ["fire", "fire"], who: ["이프리트"] },
    { n: "石", t: "제물의 바위", it: ["anvil", "rock"] } ] },
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
const FH = 150, SL = 20, WT = 14; // 층 높이, 층 사이 바닥판, 벽 두께
const EDGE = `stroke="rgba(44,32,21,.55)" stroke-width="1.4"`;
const INNER = { marble: "#f7f2e6", stone: "#ece2cc", brick: "#f2e4ca", timber: "#f4ead2", plank: "#ecd9b6", glass: "#e6f2ee", stripes: "#f3ede0", dream: "#e2e3f4" };
const ROOFC = { slate: "#565c70", tile: null, copper: "#6f9a8a", glass: "#cfe6ea", gold: "#d9a43a", thatch: "#c9a865" };

function patterns(id, color) {
  return `<pattern id="${id}marble" width="48" height="24" patternUnits="userSpaceOnUse"><rect width="48" height="24" fill="#eee7d8"/><path d="M0,.5 h48 M0,12.5 h48 M12,0 v12 M36,12 v12" stroke="#c9bea6" stroke-width="1"/></pattern>
  <pattern id="${id}stone" width="40" height="20" patternUnits="userSpaceOnUse"><rect width="40" height="20" fill="#b9b0a0"/><path d="M0,.5 h40 M0,10.5 h40 M10,0 v10 M30,10 v10" stroke="#857c6c" stroke-width="1.2"/></pattern>
  <pattern id="${id}brick" width="28" height="14" patternUnits="userSpaceOnUse"><rect width="28" height="14" fill="#b97e5e"/><path d="M0,.5 h28 M0,7.5 h28 M7,0 v7 M21,7 v7" stroke="#7a4630" stroke-width="1"/></pattern>
  <pattern id="${id}timber" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#efe3c6"/><path d="M2,0 v44" stroke="#6b4a2e" stroke-width="5"/><path d="M4,44 L44,4" stroke="#6b4a2e" stroke-width="3.5"/><path d="M0,22 h44" stroke="#6b4a2e" stroke-width="3"/></pattern>
  <pattern id="${id}plank" width="40" height="10" patternUnits="userSpaceOnUse"><rect width="40" height="10" fill="#a2734a"/><path d="M0,.5 h40 M18,0 v10" stroke="#6b4a2e" stroke-width="1"/></pattern>
  <pattern id="${id}glass" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#c6e1e4"/><path d="M0,.5 h26 M.5,0 v26" stroke="#6f9499" stroke-width="1.4"/><path d="M5,20 l8,-8" stroke="#fff" stroke-width="1.4" opacity=".7"/></pattern>
  <pattern id="${id}stripes" width="40" height="72" patternUnits="userSpaceOnUse"><rect width="40" height="36" fill="#f3ede0"/><rect y="36" width="40" height="36" fill="#b8463a"/></pattern>
  <pattern id="${id}dream" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#7c86c8"/><path d="M10,10 l2,5 l5,2 l-5,2 l-2,5 l-2,-5 l-5,-2 l5,-2z" fill="#f6f0dc" opacity=".8"/></pattern>
  <pattern id="${id}tile" width="22" height="14" patternUnits="userSpaceOnUse"><rect width="22" height="14" fill="${color}"/><path d="M0,14 a11,9 0 0 1 22,0" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1.4"/></pattern>
  <pattern id="${id}slate" width="18" height="12" patternUnits="userSpaceOnUse"><rect width="18" height="12" fill="#565c70"/><path d="M0,11.5 h18 M9,0 v12" stroke="#3a3e4e" stroke-width="1"/></pattern>
  <pattern id="${id}copper" width="20" height="40" patternUnits="userSpaceOnUse"><rect width="20" height="40" fill="#6f9a8a"/><path d="M.5,0 v40" stroke="#4d7466" stroke-width="1.6"/></pattern>
  <pattern id="${id}gold" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#d9a43a"/><path d="M0,15.5 h16" stroke="#a87a22" stroke-width="1"/></pattern>
  <pattern id="${id}thatch" width="12" height="30" patternUnits="userSpaceOnUse"><rect width="12" height="30" fill="#c9a865"/><path d="M3,0 l-2,30 M8,0 l1,30" stroke="#957a3e" stroke-width="1.2"/></pattern>
  <pattern id="${id}e" width="40" height="30" patternUnits="userSpaceOnUse"><rect width="40" height="30" fill="#c8b38a"/><circle cx="8" cy="8" r="2.4" fill="#8f7a58"/><circle cx="28" cy="20" r="3" fill="#8f7a58"/><path d="M14,24 l6,-3 M30,6 l5,2" stroke="#6a5a40" stroke-width="1.2"/></pattern>
  <pattern id="${id}w" width="40" height="16" patternUnits="userSpaceOnUse"><rect width="40" height="16" fill="#a9c9d3"/><path d="M0,8 q10,-6 20,0 t20,0" fill="none" stroke="#5f8fa3" stroke-width="1.4"/></pattern>`;
}

// 방 안쪽 모양 (천장 형태)
function roomPath({ x, y, w, h }, ceil) {
  const b = y + h;
  switch (ceil) {
    case "arch": { const r = Math.min(w * 0.16, h * 0.28); return `M${x},${b} V${y + r} A${w / 2},${r} 0 0 1 ${x + w},${y + r} V${b}Z`; }
    case "vault": { const r = Math.min(w * 0.1, h * 0.2); return `M${x},${b} V${y + r} A${w / 2},${r} 0 0 1 ${x + w},${y + r} V${b}Z`; }
    case "gothic": { const r = Math.min(h * 0.42, w * 0.32); return `M${x},${b} V${y + r} Q${x + w * 0.06},${y + r * 0.2} ${x + w / 2},${y} Q${x + w * 0.94},${y + r * 0.2} ${x + w},${y + r} V${b}Z`; }
    case "dome": { const r = Math.min(h * 0.5, w * 0.45); return `M${x},${b} V${y + r} A${w / 2},${r} 0 0 1 ${x + w},${y + r} V${b}Z`; }
    case "attic": return `M${x},${b} V${y + h * 0.5} L${x + w * 0.24},${y} H${x + w * 0.76} L${x + w},${y + h * 0.5} V${b}Z`;
    default: return `M${x},${y} H${x + w} V${b} H${x}Z`;
  }
}
const ceilRise = (r, c) => ({ arch: Math.min(r.w * 0.16, r.h * 0.28), vault: Math.min(r.w * 0.1, r.h * 0.2), gothic: Math.min(r.h * 0.42, r.w * 0.32), dome: Math.min(r.h * 0.5, r.w * 0.45), attic: r.h * 0.3 }[c] || 0);

// 곧은 계단 한 줄 (x0에서 시작해 dir 방향으로 오른다)
function flight(x0, yb, yt, SW, dir) {
  const n = 9, run = SW / n, rise = (yb - yt) / n;
  const X = (d) => x0 + dir * d;
  let d = `M${X(0)},${yb}`;
  for (let k = 0; k < n; k++) d += ` V${yb - rise * (k + 1)} H${X(run * (k + 1))}`;
  d += ` V${yt + 18} L${X(16)},${yb}Z`;
  let o = `<path d="${d}" fill="#9a6e45" stroke="#5a3a20" stroke-width="1.2" stroke-linejoin="round"/>`;
  for (let k = 0; k < n; k++) o += `<path d="M${X(run * k)},${yb - rise * (k + 1)} H${X(run * (k + 1))}" stroke="#c9a070" stroke-width="2"/>`;
  // 난간
  const rail = (k) => [X(run * (k + 0.5)), yb - rise * (k + 1) - 38];
  o += `<path d="M${rail(0)[0]},${rail(0)[1]} L${rail(n - 1)[0]},${rail(n - 1)[1]}" stroke="#5a3a20" stroke-width="3" stroke-linecap="round"/>`;
  for (let k = 0; k < n; k += 2) o += `<path d="M${X(run * (k + 0.5))},${yb - rise * (k + 1)} v-38" stroke="#5a3a20" stroke-width="1.4"/>`;
  o += `<path d="M${X(run * 0.5)},${yb - rise} v-46" stroke="#5a3a20" stroke-width="4"/><circle cx="${X(run * 0.5)}" cy="${yb - rise - 48}" r="3.5" fill="#5a3a20"/>`;
  return o;
}
// 나선 계단 한 층 분량 (기둥을 감고 오른다)
function spiral(cx, yb, yt, Wd = 70) {
  const n = 8, rise = (yb - yt) / n;
  let o = `<rect x="${cx - 4}" y="${yt}" width="8" height="${yb - yt}" fill="#7a5a3a"/>`;
  for (let k = 0; k < n; k++) {
    const y = yb - rise * (k + 1), left = k % 2 === 0;
    const xa = left ? cx - Wd / 2 : cx + Wd / 2;
    o += `<path d="M${cx},${y + 4} L${xa},${y} L${xa},${y + 7} L${cx},${y + 10}Z" fill="${k % 4 < 2 ? "#a77a4f" : "#8a6440"}" stroke="#5a3a20" stroke-width="1"/>`;
  }
  let d = `M${cx - Wd / 2},${yb - 30}`;
  for (let k = 0; k < n; k++) { const y = yb - rise * (k + 1) - 30; d += ` Q${cx},${y + rise / 2 + (k % 2 ? -8 : 8)} ${k % 2 ? cx - Wd / 2 : cx + Wd / 2},${y}`; }
  return o + `<path d="${d}" fill="none" stroke="#5a3a20" stroke-width="2.4"/>`;
}

// 지붕
function roof(spec, r, id, color, attic) {
  const [type, mat = "tile"] = spec.split(":");
  const fill = mat === "tile" ? `url(#${id}tile)` : `url(#${id}${mat})`;
  const x = r.x, w = r.w, M = x + w / 2;
  const L = x - WT - 16, R = x + w + WT + 16, T = r.y - SL / 2;
  const sh = `<path d="__" fill="rgba(0,0,0,.18)" transform="translate(5,6)"/>`;
  const shape = (d, f = fill) => sh.replace("__", d) + `<path d="${d}" fill="${f}" ${EDGE} stroke-linejoin="round"/>`;
  if (attic) {
    // 다락: 지붕이 방을 감싼다
    const b = r.y + r.h * 0.5 + 8;
    if (type === "mansard") return shape(`M${x - 30},${b} L${x + w * 0.2 - 14},${r.y - 18} L${M},${r.y - 52} L${x + w * 0.8 + 14},${r.y - 18} L${x + w + 30},${b}Z`) +
      [x + w * 0.12, x + w * 0.88].map((dx) => `<path d="M${dx - 18},${r.y + r.h * 0.34} v-26 l18,-16 l18,16 v26z" fill="#f4e9cd" ${EDGE}/><rect x="${dx - 9}" y="${r.y + r.h * 0.34 - 22}" width="18" height="18" fill="#cfe0e6"/>`).join("");
    if (type === "gambrel") return shape(`M${x - 30},${b} L${x + w * 0.1 - 10},${r.y + 4} L${M},${r.y - 64} L${x + w * 0.9 + 10},${r.y + 4} L${x + w + 30},${b}Z`);
    if (type === "thatch") return shape(`M${x - 46},${b + 6} C${x - 24},${r.y - 20} ${x + w * 0.22},${r.y - 86} ${M},${r.y - 90} C${x + w * 0.78},${r.y - 86} ${x + w + 24},${r.y - 20} ${x + w + 46},${b + 6} Q${M},${b - 10} ${x - 46},${b + 6}Z`, `url(#${id}thatch)`);
    return shape(`M${x - 32},${b} L${M},${r.y - 96} L${x + w + 32},${b}Z`);
  }
  switch (type) {
    case "gable": return shape(`M${L},${T} L${M},${T - Math.min(w * 0.42, 130)} L${R},${T}Z`);
    case "pointed": return shape(`M${L},${T} L${M},${T - w * 0.8} L${R},${T}Z`) + `<path d="M${M},${T - w * 0.8} v-24" stroke="#5a3a20" stroke-width="3"/>`;
    case "spires": {
      const H = w * 0.95;
      let s = shape(`M${x + w * 0.18},${T} L${M},${T - H} L${x + w * 0.82},${T}Z`);
      for (const px of [x + 6, x + w - 6]) s += shape(`M${px - 22},${T} L${px},${T - H * 0.6} L${px + 22},${T}Z`) + `<rect x="${px - 22}" y="${T - 4}" width="44" height="8" fill="url(#${id}stone)"/>`;
      return s + `<path d="M${M},${T - H} v-22 m-8,8 h16" stroke="#c8a050" stroke-width="3"/>`;
    }
    case "spire": case "sun": {
      const H = w * 0.95;
      let s = shape(`M${L + 10},${T} L${M},${T - H} L${R - 10},${T}Z`);
      for (let k = 1; k < 6; k++) { const t = k / 6; s += `<circle cx="${L + 10 + (M - L - 10) * t - 5}" cy="${T - H * t}" r="4" fill="${ROOFC[mat] || color}" ${EDGE}/><circle cx="${R - 10 - (R - 10 - M) * t + 5}" cy="${T - H * t}" r="4" fill="${ROOFC[mat] || color}" ${EDGE}/>`; }
      if (type === "sun") {
        s += `<circle cx="${M}" cy="${T - H - 30}" r="26" fill="#f0c95a" ${EDGE}/><circle cx="${M}" cy="${T - H - 30}" r="14" fill="none" stroke="#a87a22" stroke-width="1.4"/>`;
        for (let i = 0; i < 16; i++) { const a = (i / 16) * 6.283, L1 = 32, L2 = i % 2 ? 42 : 52; s += `<path d="M${M + Math.cos(a) * L1},${T - H - 30 + Math.sin(a) * L1} L${M + Math.cos(a) * L2},${T - H - 30 + Math.sin(a) * L2}" stroke="#a87a22" stroke-width="2.4"/>`; }
      } else s += `<path d="M${M},${T - H} v-26 m-9,10 h18" stroke="#5a3a20" stroke-width="3"/>`;
      return s;
    }
    case "conic": {
      const H = w * 1.15;
      return shape(`M${L - 6},${T} C${L + (M - L) * 0.45},${T - H * 0.18} ${M - 6},${T - H * 0.7} ${M},${T - H} C${M + 6},${T - H * 0.7} ${R - (R - M) * 0.45},${T - H * 0.18} ${R + 6},${T}Z`) +
        `<path d="M${M},${T - H} v-30" stroke="#5a3a20" stroke-width="3"/><path d="M${M},${T - H - 30} l22,7 l-22,7z" fill="${color}"/>`;
    }
    case "dome": {
      const H = w * 0.5;
      let s = shape(`M${L + 6},${T} A${(R - L - 12) / 2},${H} 0 0 1 ${R - 6},${T}Z`);
      for (let k = 1; k < 6; k++) { const t = k / 6, xx = L + 6 + (R - L - 12) * t; s += `<path d="M${xx},${T} Q${xx + (M - xx) * 0.25},${T - H * Math.sin(t * Math.PI) * 0.9} ${M},${T - H}" fill="none" stroke="rgba(44,32,21,.35)" stroke-width="1.4"/>`; }
      if (mat === "glass" && w > 400) s += `<path d="M${M},${T - H + 10} v-60" stroke="#8a6440" stroke-width="8"/><path d="M${M},${T - H - 44} c-46,-6 -52,-44 -18,-50 c4,-26 40,-24 40,0 c30,8 22,48 -22,50z" fill="#6f8f4f"/>`;
      else s += `<rect x="${M - 16}" y="${T - H - 34}" width="32" height="36" fill="#f4e9cd" ${EDGE}/><path d="M${M - 20},${T - H - 34} a20,18 0 0 1 40,0z" fill="${fill}" ${EDGE}/><path d="M${M},${T - H - 52} v-16" stroke="#c8a050" stroke-width="3"/>`;
      return s;
    }
    case "crenel": {
      let s = "";
      for (let xx = x - WT; xx < x + w + WT - 10; xx += 38) s += `<rect x="${xx}" y="${T - 26}" width="22" height="28" fill="url(#${id}stone)" ${EDGE}/>`;
      return s;
    }
    case "pediment": {
      const H = w * 0.17;
      return `<rect x="${L}" y="${T - 14}" width="${R - L}" height="16" fill="url(#${id}marble)" ${EDGE}/>` + shape(`M${L},${T - 14} L${M},${T - 14 - H} L${R},${T - 14}Z`, `url(#${id}marble)`) +
        `<circle cx="${M}" cy="${T - 14 - H * 0.42}" r="${H * 0.22}" fill="${color}" ${EDGE}/>` + [L, M, R].map((px) => `<path d="M${px - 8},${px === M ? T - 14 - H : T - 14} l8,-14 l8,14z" fill="#c8a050"/>`).join("");
    }
    case "saw": {
      let s = "", n = Math.max(2, Math.round(w / 110)), tw = (R - L) / n;
      for (let k = 0; k < n; k++) { const a = L + k * tw; s += shape(`M${a},${T} L${a},${T - 50} L${a + tw},${T}Z`) + `<path d="M${a + 3},${T - 4} V${T - 44}" stroke="#cfe0e6" stroke-width="5"/>`; }
      return s;
    }
    case "glass": {
      const H = w * 1.25;
      return shape(`M${L + 4},${T} L${M - 10},${T - H * 0.75} L${M},${T - H} L${M + 10},${T - H * 0.75} L${R - 4},${T}Z`, `url(#${id}glass)`) + `<path d="M${M},${T - H} V${T} M${M - 10},${T - H * 0.75} L${L + 60},${T} M${M + 10},${T - H * 0.75} L${R - 60},${T}" stroke="#6f9499" stroke-width="1.2"/>`;
    }
    case "lantern": {
      const lw = w * 0.82, lx = M - lw / 2;
      return `<path d="M${M - 150},${T - 50} L${lx},${T - 40} L${lx},${T - 70}Z M${M + 150},${T - 50} L${lx + lw},${T - 40} L${lx + lw},${T - 70}Z" fill="#f6e2a0" opacity=".55"/>` +
        `<rect x="${L}" y="${T - 10}" width="${R - L}" height="10" fill="#3a3240"/><path d="M${L},${T - 10} v-14 M${R},${T - 10} v-14 M${L},${T - 22} H${R}" stroke="#3a3240" stroke-width="2"/>` +
        `<path d="M${lx - 10},${T - 90} a${lw / 2 + 10},40 0 0 1 ${lw + 20},0z" fill="#3a3240"/><path d="M${M},${T - 128} v-20" stroke="#3a3240" stroke-width="3"/>`;
    }
    case "broken": return shape(`M${L},${T} v-40 l26,16 l18,-36 l22,26 l26,-48 l16,30 l24,-18 l14,22 V${T}Z`, `url(#${id}stone)`) + `<path d="M${M + 20},${T - 90} c-30,-8 -40,-36 -10,-40 c6,-20 36,-16 36,2 c22,2 22,30 -2,34z" fill="#7d7a8c"/><path d="M${M + 14},${T - 80} l-8,16 h10 l-8,18" fill="none" stroke="#e8c84a" stroke-width="3"/>`;
    case "flat": {
      let s = `<rect x="${L}" y="${T - 6}" width="${R - L}" height="8" fill="url(#${id}stone)" ${EDGE}/><path d="M${L},${T - 30} H${R}" stroke="#7f7666" stroke-width="4"/>`;
      for (let xx = L + 8; xx < R; xx += 16) s += `<path d="M${xx},${T - 6} v-24" stroke="#7f7666" stroke-width="3"/>`;
      return s;
    }
    default: return "";
  }
}

export function drawSection(site, CHARS, color, isVeiled) {
  const cfg = SEC[site.id];
  if (!cfg) return null;
  const id = "sx" + ++uid;
  const R = rng(site.id);
  const shape = cfg.shape;
  const n = cfg.floors.length;
  const ext = new Set(cfg.ext || []);
  const isBuild = shape === "build" || shape === "ship" || shape === "terrace";
  const widthOf = (f) => f.w || cfg.w || 600;
  const maxW = Math.max(...cfg.floors.map(widthOf));
  const margin = (ext.has("cloister") ? 160 : 0) + (ext.has("turrets") ? 90 : 0) + (ext.has("columns") ? 130 : 0) + (ext.has("tiers") ? 150 : 0) + (ext.has("buttress") ? 40 : 0) + (shape === "terrace" ? 170 : 0) + (shape === "cliff" ? 120 : 0) + (shape === "ship" ? 90 : 0) + (shape === "shaft" ? 50 : 0);
  const CX = 150 + margin + maxW / 2;
  const f0 = cfg.floors[0], w0 = widthOf(f0);
  const rt = (f0.roof || "").split(":")[0];
  const roofSpace = { sun: w0 * 0.95 + 90, spire: w0 * 0.95 + 40, conic: w0 * 1.15 + 50, glass: w0 * 1.25 + 20, dome: w0 * 0.5 + 80, spires: w0 * 0.95 + 40, pointed: w0 * 0.8 + 40, gable: 140, lantern: 150, broken: 110, pediment: 110 }[rt] ?? (f0.ceil === "attic" ? 110 : 60);
  const top = 40 + (isBuild || shape === "shaft" ? roofSpace : 30);
  const rects = cfg.floors.map((f, i) => {
    const w = widthOf(f);
    let x = CX - w / 2 + (f.dx || 0);
    if (shape === "terrace") x = CX - 170 + (n - 1 - i) * 85 - w / 2;
    return { x, y: top + i * (FH + SL), w, h: FH };
  });
  if (cfg.float) rects.slice(cfg.float).forEach((r) => (r.y += 130));
  const wingW = cfg.wing ? 270 : 0;
  const right = Math.max(...rects.map((r) => r.x + r.w)) + WT + margin * (shape === "terrace" ? 0 : 1) + (shape === "ship" ? 40 : 0) + 30;
  const VW = Math.max(right + (cfg.wing ? wingW + 30 : 10), CX + maxW / 2 + 60);
  const groundY = cfg.g >= n ? rects[n - 1].y + FH + SL : rects[cfg.g].y - SL / 2;
  const VH = rects[n - 1].y + FH + SL + 70;
  const dark = cfg.dark || shape === "shaft";
  const sky = dark ? "#2a2738" : cfg.night ? "#262c4a" : "#e9dfc6";
  const wallOf = (f) => f.wall || cfg.wall || "stone";

  let o = `<svg class="section" viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg"><defs>${patterns(id, color)}<filter id="${id}b"><feGaussianBlur stdDeviation="5"/></filter><filter id="${id}d" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="2" dy="3" stdDeviation="1.6" flood-color="#2c2015" flood-opacity=".3"/></filter></defs>`;
  o += `<rect x="-3000" y="-3000" width="${VW + 6000}" height="${VH + 6000}" fill="${sky}"/>`;
  if (!dark) for (let i = 0; i < 6; i++) { const cx = 60 + R() * (VW - 200), cy = 40 + R() * Math.max(groundY - 160, 30); o += `<path d="M${cx},${cy} q12,-12 26,-4 q10,-14 28,-2 q16,-2 16,10 h-70z" fill="${cfg.night ? "#3a4170" : "#f6f0e2"}" opacity=".8"/>`; }
  if (cfg.night) for (let i = 0; i < 30; i++) o += `<circle cx="${R() * VW}" cy="${R() * groundY}" r="${1 + R() * 1.6}" fill="#f6f0dc" opacity=".8"/>`;
  // 땅 / 물
  if (groundY < VH) {
    const water = cfg.water || cfg.flooded;
    o += `<rect x="-3000" y="${groundY}" width="${VW + 6000}" height="${VH - groundY + 3000}" fill="url(#${id}${water ? "w" : "e"})"/>`;
    if (!water) {
      o += `<rect x="-3000" y="${groundY - 6}" width="${VW + 6000}" height="10" fill="#7d8f5a"/>`;
      for (let x = -600; x < VW + 600; x += 22) o += `<path d="M${x},${groundY - 4} l-3,-9 M${x + 7},${groundY - 4} l2,-8" stroke="#5f7d45" stroke-width="1.8"/>`;
    }
  }
  // 바깥 장소 배경 언덕
  if ((shape === "outdoor" || shape === "cliff") && !dark) {
    const gy = Math.min(groundY, VH - 40);
    o += `<path d="M-3000,${gy} L0,${gy} C${VW * 0.15},${gy - 90} ${VW * 0.3},${gy - 60} ${VW * 0.45},${gy - 30} S${VW * 0.8},${gy - 120} ${VW},${gy - 50} C${VW + 200},${gy - 40} ${VW + 400},${gy - 10} ${VW + 600},${gy} L${VW + 3000},${gy}z" fill="#d3c8a6"/>`;
    o += `<path d="M-3000,${gy} L0,${gy} C${VW * 0.2},${gy - 40} ${VW * 0.5},${gy - 70} ${VW * 0.7},${gy - 26} S${VW * 0.9},${gy - 40} ${VW},${gy - 20} C${VW + 200},${gy - 14} ${VW + 300},${gy} ${VW + 400},${gy} L${VW + 3000},${gy}z" fill="#bfb38c"/>`;
    for (let i = 0; i < 7; i++) { const tx = R() * VW, ty = gy - 10 - R() * 30; o += `<path d="M${tx},${ty - 26} l-9,16 h5 l-7,12 h22 l-7,-12 h5z" fill="#7d8a62"/>`; }
  }
  // 비탈
  if (shape === "terrace") {
    let d = `M-3000,${VH + 3000} L-3000,${rects[n - 1].y + FH + SL / 2} L${rects[n - 1].x - 60},${rects[n - 1].y + FH + SL / 2}`;
    [...rects].reverse().forEach((r) => (d += ` L${r.x - 40},${r.y + FH + SL / 2} L${r.x + r.w + 60},${r.y + FH + SL / 2}`));
    d += ` L${rects[0].x + rects[0].w + 200},${rects[0].y - 30} L${VW + 3000},${rects[0].y - 30} V${VH + 3000}z`;
    o += `<path d="${d}" fill="url(#${id}e)"/><path d="${d}" fill="none" stroke="#7d8f5a" stroke-width="6"/>`;
  }
  // 절벽
  if (shape === "cliff") {
    const yb = rects[n - 1].y + FH + 30, w = cfg.w;
    o += `<path d="M${CX - w / 2 - 110},${yb + 40} L${CX - w / 2 - 70},${rects[0].y + 40} L${CX - w / 2 + 40},${rects[0].y - 30} L${CX + 40},${rects[0].y - 10} L${CX + w / 2 + 30},${rects[0].y + 20} L${CX + w / 2 + 120},${yb + 40}z" fill="${cfg.volcanic ? "#8a5a48" : "#c9c1ad"}"/>`;
    for (let i = 0; i < 40; i++) o += `<path d="M${CX - w / 2 - 40 + R() * (w + 80)},${rects[0].y + R() * (yb - rects[0].y)} l${6 + R() * 8},${4 + R() * 6}" stroke="rgba(44,32,21,.45)" stroke-width="1.2"/>`;
    if (cfg.volcanic) o += `<path d="M${CX - 40},${rects[0].y - 10} q10,-50 -10,-90 q30,20 30,60 q10,-30 0,-60 q30,40 20,90" fill="#f2a443"/>`;
    // 바위를 깎은 계단
    for (let i = 0; i < n - 1; i++) { const a = rects[i], b = rects[i + 1]; for (let k = 0; k < 6; k++) o += `<rect x="${a.x + a.w + 8 + (k % 2) * 16}" y="${b.y + b.h - 4 - (k + 1) * ((b.h + SL) / 6)}" width="30" height="${(b.h + SL) / 6}" fill="#a39a86"/>`; }
  }
  // 갱도 몸체
  if (shape === "shaft") {
    const first = rects[Math.min(cfg.g, n - 1)];
    o += `<rect x="${CX - cfg.w / 2 - 60}" y="${first.y - SL}" width="${cfg.w + 120}" height="${VH - first.y + 3000}" fill="url(#${id}e)"/>`;
  }

  // ── 바깥 장식 (건물 뒤) ──
  const above = rects.filter((_, i) => i < cfg.g);
  const ground = rects[Math.min(cfg.g, n) - 1];
  if (isBuild && ext.has("turrets") && ground) {
    const body = rects.slice(1, cfg.g);
    const ty = body[0].y - 30, by = ground.y + ground.h + SL / 2;
    const lx = Math.min(...body.map((r) => r.x)) - WT - 70, rx = Math.max(...body.map((r) => r.x + r.w)) + WT - 10;
    for (const tx of [lx, rx]) {
      o += `<rect x="${tx}" y="${ty}" width="80" height="${by - ty}" fill="url(#${id}stone)" ${EDGE}/>`;
      for (let y = ty + 60; y < by - 40; y += 110) o += `<rect x="${tx + 36}" y="${y}" width="8" height="34" rx="4" fill="#2a2430"/>`;
      o += `<path d="M${tx - 10},${ty} C${tx + 14},${ty - 30} ${tx + 34},${ty - 90} ${tx + 40},${ty - 120} C${tx + 46},${ty - 90} ${tx + 66},${ty - 30} ${tx + 90},${ty}Z" fill="url(#${id}slate)" ${EDGE}/><path d="M${tx + 40},${ty - 120} v-20" stroke="#5a3a20" stroke-width="3"/>`;
    }
  }
  if (isBuild && ext.has("cloister") && ground) {
    const ay = ground.y + ground.h + SL / 2, h = 104;
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? ground.x - WT - 150 : ground.x + ground.w + WT;
      o += `<rect x="${x0}" y="${ay - h}" width="150" height="${h}" fill="url(#${id}marble)" ${EDGE}/>`;
      for (let k = 0; k < 3; k++) o += `<path d="M${x0 + 14 + k * 46},${ay} v-56 a17,17 0 0 1 34,0 v56z" fill="#d8ccb2"/>`;
      o += side < 0 ? `<path d="M${x0 - 12},${ay - h} L${x0 + 150},${ay - h - 36} V${ay - h}Z" fill="url(#${id}tile)" ${EDGE}/>` : `<path d="M${x0},${ay - h - 36} L${x0 + 162},${ay - h} H${x0}Z" fill="url(#${id}tile)" ${EDGE}/>`;
    }
  }
  if (isBuild && ext.has("columns") && ground) {
    const ay = ground.y + ground.h + SL / 2, h = ground.h + SL / 2;
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? ground.x - WT - 128 : ground.x + ground.w + WT;
      o += `<rect x="${x0 - 6}" y="${ay - h - 18}" width="140" height="20" fill="url(#${id}marble)" ${EDGE}/>`;
      for (let k = 0; k < 3; k++) { const cx = x0 + 18 + k * 46; o += `<rect x="${cx - 9}" y="${ay - h}" width="18" height="${h - 10}" fill="#f1ebdd" ${EDGE}/><path d="M${cx - 4},${ay - h + 4} v${h - 18} M${cx + 4},${ay - h + 4} v${h - 18}" stroke="#cfc5b0" stroke-width="1.2"/><rect x="${cx - 13}" y="${ay - h - 2}" width="26" height="8" fill="#e6dcc8"/><rect x="${cx - 12}" y="${ay - 12}" width="24" height="10" fill="#e6dcc8"/>`; }
      for (let k = 0; k < 3; k++) o += `<rect x="${x0 - 10 - k * 6}" y="${ay - 2 + k * 6}" width="${144 + k * 12}" height="6" fill="#d8ccb2"/>`;
    }
  }
  if (isBuild && ext.has("tiers") && ground) {
    const ay = ground.y + ground.h + SL / 2;
    for (const side of [-1, 1]) for (let k = 0; k < 5; k++) {
      const w = 150 - k * 28, x0 = side < 0 ? ground.x - WT - w : ground.x + ground.w + WT;
      o += `<rect x="${x0}" y="${ay - (k + 1) * 46}" width="${w}" height="46" fill="url(#${id}stone)" ${EDGE}/>`;
      if (k % 2 === 0) o += `<circle cx="${x0 + w / 2}" cy="${ay - (k + 1) * 46 - 10}" r="8" fill="#a4372f"/><rect x="${x0 + w / 2 - 9}" y="${ay - (k + 1) * 46 - 4}" width="18" height="6" fill="#a4372f"/>`;
    }
  }
  if (isBuild && ext.has("bridge") && ground) {
    const by = ground.y + ground.h + SL / 2, wy = groundY + 40;
    o += `<path d="M${ground.x - WT - 60},${by} H${ground.x + ground.w + WT + 60} V${wy + 30} H${ground.x + ground.w - 40} V${wy} A${ground.w / 2 - 40},${wy - by - 18} 0 0 0 ${ground.x + 40},${wy} V${wy + 30} H${ground.x - WT - 60}Z" fill="url(#${id}stone)" ${EDGE}/>`;
  }
  // 층마다의 지붕 (위층이 그 위를 덮는다)
  rects.forEach((r, i) => { const f = cfg.floors[i]; if (f.roof && isBuild || f.roof && shape === "shaft") o += roof(f.roof, r, id, color, f.ceil === "attic"); });
  // 버팀벽
  if (isBuild && ext.has("buttress")) above.forEach((r) => {
    for (const side of [-1, 1]) {
      const x0 = side < 0 ? r.x - WT : r.x + r.w + WT;
      o += `<path d="M${x0},${r.y - SL / 2} L${x0 + side * 18},${r.y + 10} L${x0 + side * 30},${r.y + r.h + SL / 2} L${x0},${r.y + r.h + SL / 2}Z" fill="url(#${id}${wallOf(cfg.floors[0])})" ${EDGE}/>`;
    }
  });

  // ── 층 (벽 덩어리 + 방) ──
  const voidX = CX - 55;
  rects.forEach((r, i) => {
    const f = cfg.floors[i];
    if (shape === "outdoor") {
      if ((f.it || []).includes("water")) o += `<rect x="${r.x + 20}" y="${r.y + 30}" width="${r.w - 40}" height="${r.h - 34}" rx="50" fill="url(#${id}w)"/>`;
      if (i > 0 && i !== cfg.g) o += `<path d="M${r.x - 40},${r.y - SL / 2} h${r.w + 80}" stroke="rgba(44,32,21,.35)" stroke-width="1" stroke-dasharray="6 6"/>`;
      return;
    }
    if (shape === "cliff") { o += `<path d="M${r.x + 10},${r.y + r.h} q-14,-${r.h * 0.6} 20,-${r.h - 10} h${r.w - 60} q34,10 30,${r.h - 10}z" fill="${cfg.volcanic ? "#5a3a32" : "#efe6cf"}"/>`; return; }
    const wall = wallOf(f);
    const attic = f.ceil === "attic" && f.roof;
    if (!attic) o += `<rect x="${r.x - WT}" y="${r.y - SL / 2}" width="${r.w + WT * 2}" height="${r.h + SL}" fill="url(#${id}${wall})" ${f.dream ? "" : EDGE}/>`;
    else o += `<rect x="${r.x - WT}" y="${r.y + r.h * 0.5}" width="${r.w + WT * 2}" height="${r.h * 0.5 + SL / 2}" fill="url(#${id}${wall})" ${EDGE}/>`;
    if (f.dream) o += [0, 1, 2, 3].map((k) => `<path d="M${r.x - 60 + k * (r.w / 3 + 20)},${r.y + r.h + SL / 2 + 10} q-30,-6 -18,-26 q22,-16 44,-2 q30,-16 50,6 q20,4 6,22z" fill="#fbf8ef"/>`).join("");
    const inner = f.redact ? "#1d1a22" : cfg.dark ? "#4a4b66" : INNER[wall] || "#efe2c4";
    o += `<path d="${roomPath(r, f.ceil)}" fill="${inner}"/>`;
    if (!f.redact) {
      // 걸레받이·바닥 널
      o += `<rect x="${r.x}" y="${r.y + r.h - 20}" width="${r.w}" height="16" fill="rgba(90,58,32,.13)"/><rect x="${r.x}" y="${r.y + r.h - 4}" width="${r.w}" height="4" fill="#8a6440"/>`;
      if (!f.ceil || f.ceil === "flat") for (let x = r.x + 30; x < r.x + r.w - 10; x += 60) o += `<rect x="${x - 6}" y="${r.y}" width="12" height="9" fill="rgba(90,58,32,.35)"/>`;
    } else {
      o += `<text x="${r.x + r.w / 2}" y="${r.y + r.h / 2 + 10}" text-anchor="middle" font-family="IM Fell English SC, serif" font-size="26" letter-spacing="6" fill="#d8c8a0">CLASSIFIED</text>`;
    }
    if (shape === "shaft" && i >= cfg.g && !f.end && !f.redact) o += `<rect x="${voidX}" y="${r.y}" width="110" height="${r.h}" fill="#141019"/>`;
  });
  // 배 선체
  if (shape === "ship") {
    const r = rects[n - 1], y0 = r.y - SL / 2, y1 = r.y + r.h + SL / 2 + 20;
    const hull = `M${r.x - 90},${y0} H${r.x + r.w + 110} Q${r.x + r.w + 70},${y1} ${r.x + r.w - 40},${y1} H${r.x + 40} Q${r.x - 60},${y1} ${r.x - 90},${y0}Z M${r.x},${r.y + 20} V${r.y + r.h} H${r.x + r.w} V${r.y + 20}Z`;
    o += `<path d="${hull}" fill="url(#${id}plank)" fill-rule="evenodd" ${EDGE}/>`;
    for (let x = r.x + 40; x < r.x + r.w; x += 90) o += `<circle cx="${x}" cy="${y1 - 22}" r="8" fill="#cfe0e6" stroke="#6b4a2e" stroke-width="3"/>`;
    o += `<rect x="-3000" y="${groundY}" width="${VW + 6000}" height="14" fill="#a9c9d3" opacity=".7"/>`;
    if (ext.has("rigging")) { const t = rects[0]; o += `<path d="M${t.x + t.w / 2},${t.y - 160} L${r.x - 80},${y0} M${t.x + t.w / 2},${t.y - 160} L${r.x + r.w + 100},${y0}" stroke="#5a3a20" stroke-width="1.6"/>`; }
  }
  // 겹친 처마 받침
  if (ext.has("jetty")) for (let i = 0; i < n - 1; i++) {
    const a = rects[i], b = rects[i + 1];
    if (a.w > b.w + 10 && i < cfg.g) for (const [x1, s] of [[b.x - WT, -1], [b.x + b.w + WT, 1]]) o += `<path d="M${x1},${a.y + a.h + SL / 2} h${s * ((a.w - b.w) / 2)} L${x1},${a.y + a.h + SL / 2 + 26}Z" fill="#6b4a2e"/>`;
  }
  // 굴뚝·시계·차양·간판
  const topR = rects[cfg.float || 0];
  // 지붕에서 꿈층으로 떠오르는 돌계단
  if (cfg.float) { const d = rects[0], b = rects[cfg.float]; for (let k = 0; k < 7; k++) { const t = k / 6; o += `<rect x="${d.x + d.w - 40 + 90 * Math.sin(t * 3)}" y="${b.y - 40 - (b.y - 40 - d.y - d.h - 30) * t}" width="46" height="12" rx="3" fill="url(#${id}stone)" opacity="${0.55 + t * 0.45}"/>`; } }
  if (ext.has("chimney")) { const tf = cfg.floors[cfg.float || 0], r = topR; const cx = r.x + r.w * 0.78; const cy = r.y - (tf.ceil === "attic" ? 40 : 60); o += `<rect x="${cx}" y="${cy - 50}" width="30" height="80" fill="url(#${id}brick)" ${EDGE}/><rect x="${cx - 4}" y="${cy - 56}" width="38" height="8" fill="#7a4630"/><path d="M${cx + 15},${cy - 62} q-12,-16 4,-28 q14,-12 0,-26" fill="none" stroke="#9a948c" stroke-width="5" stroke-linecap="round" opacity=".7"/>`; }
  if (ext.has("clock")) { const cx = topR.x + topR.w / 2, cy = topR.y - 4; o += `<circle cx="${cx}" cy="${cy}" r="26" fill="#f4e9cd" stroke="#c8a050" stroke-width="5"/><path d="M${cx},${cy} v-16 M${cx},${cy} l11,6" stroke="#2c2015" stroke-width="2.6" stroke-linecap="round"/>`; }
  if (ext.has("awning") && ground) { const ax = ground.x + ground.w + WT, ay = ground.y + 30; for (let k = 0; k < 5; k++) o += `<path d="M${ax + k * 16},${ay} h16 l6,40 h-16z" fill="${k % 2 ? "#f4e9cd" : color}"/>`; }
  if (ext.has("sign") && ground) { const sx = ground.x - WT, sy = ground.y + 24; o += `<path d="M${sx},${sy} h-70" stroke="#3a2a1c" stroke-width="5"/><path d="M${sx - 64},${sy} v12 M${sx - 22},${sy} v12" stroke="#3a2a1c" stroke-width="2"/><rect x="${sx - 72}" y="${sy + 12}" width="58" height="40" rx="4" fill="${color}"/><text x="${sx - 43}" y="${sy + 39}" text-anchor="middle" font-family="Cinzel, serif" font-size="15" fill="#f4e9cd">VII</text>`; }
  if (cfg.flooded) o += `<rect x="-3000" y="${rects[0].y + FH + SL}" width="${VW + 6000}" height="${VH + 3000}" fill="#7fa7b5" opacity=".33"/>`;
  if (cfg.fog) for (let i = 0; i < 8; i++) o += `<path d="M${R() * VW},${60 + R() * (VH - 120)} q40,-14 80,0 q40,14 80,0" fill="none" stroke="#fbf8ef" stroke-width="12" stroke-linecap="round" opacity=".45"/>`;

  // ── 계단 ──
  const stairZone = {};
  if (isBuild && cfg.stair === "spiral") {
    // 한쪽에 나선 계단 기둥을 세운다
    const usable = rects.filter((r, i) => !cfg.floors[i].redact);
    const sx = Math.max(...usable.map((r) => r.x)) + 44;
    usable.forEach((r, i) => {
      const k = rects.indexOf(r);
      if (k === 0) return;
      o += `<rect x="${sx - 38}" y="${r.y - SL / 2 - 2}" width="76" height="${SL + 4}" fill="${INNER[wallOf(cfg.floors[k - 1])] || "#efe2c4"}"/>`;
      o += spiral(sx, r.y + r.h - 4, r.y - SL / 2, 66);
      stairZone[k] = [sx - 40, sx + 40];
    });
    if (usable[0]) stairZone[0] = [sx - 40, sx + 40];
  } else if ((isBuild && cfg.stair !== "none") || shape === "shaft") {
    for (let i = 1; i < n; i++) {
      const r = rects[i], up = rects[i - 1], f = cfg.floors[i];
      if (f.redact || cfg.floors[i - 1].redact || cfg.floors[i - 1].dream) continue;
      if (shape === "shaft" && i >= cfg.g && !cfg.floors[i - 1].end && !(i === cfg.g && cfg.g > 0)) {
        // 갱도 가운데 빈 곳을 지그재그로 오르는 계단
        const dir = i % 2 ? 1 : -1, x0 = dir > 0 ? voidX + 4 : voidX + 106;
        o += flight(x0, r.y + r.h - 4, r.y - SL / 2, 102, dir);
        continue;
      }
      const lo = Math.max(r.x, up.x) + 10, hi = Math.min(r.x + r.w, up.x + up.w) - 10;
      const SW = Math.min(130, hi - lo - 10);
      if (SW < 60) continue;
      const leftSide = i % 2 === 0;
      const dir = leftSide ? -1 : 1;
      const x0 = leftSide ? lo + SW : hi - SW;
      const xt = x0 + dir * SW;
      o += `<rect x="${Math.min(xt, xt - dir * SW * 0.45)}" y="${r.y - SL / 2 - 2}" width="${SW * 0.45}" height="${SL + 4}" fill="${INNER[wallOf(cfg.floors[i - 1])] || "#efe2c4"}"/>`;
      o += flight(x0, r.y + r.h - 4, r.y - SL / 2, SW, dir);
      stairZone[i] = [Math.min(x0, xt) - 6, Math.max(x0, xt) + 6];
    }
  }

  // ── 가구와 인물 ──
  const pins = [];
  const placeRow = (r, f, zone) => {
    const items = f.it || [], who = f.who || [];
    const order = [];
    let a = 0, b = 0;
    while (a < items.length || b < who.length) { if (a < items.length) order.push(["i", items[a++]]); if (b < who.length) order.push(["n", who[b++]]); }
    let x0 = r.x + 36, x1 = r.x + r.w - 36;
    if (shape === "shaft" && !f.end) { // 빈 곳 양옆으로 나눠 둔다
      const L = order.filter((_, k) => k % 2 === 0), Rr = order.filter((_, k) => k % 2 === 1);
      L.forEach(([t, v], k) => put(t, v, r.x + 30 + ((voidX - r.x - 40) * (k + 0.5)) / L.length, r.y + r.h - 4));
      Rr.forEach(([t, v], k) => put(t, v, voidX + 120 + ((r.x + r.w - voidX - 140) * (k + 0.5)) / Rr.length, r.y + r.h - 4));
      return;
    }
    if (zone) { if (zone[0] - x0 > x1 - zone[1]) x1 = zone[0]; else x0 = zone[1]; }
    order.forEach(([t, v], k) => put(t, v, x0 + ((x1 - x0) * (k + 0.5)) / order.length, r.y + r.h - 4));
  };
  let furn = "";
  const put = (t, v, x, y) => { x = Math.round(x); if (t === "i") furn += (IT[v] || IT.crate)(x, y, color); else pins.push({ name: v, x, y }); };
  rects.forEach((r, i) => placeRow(r, cfg.floors[i], stairZone[i]));
  // 별채
  if (cfg.wing) {
    const wf = cfg.wing, last = rects[Math.min(cfg.g, n) - 1] || rects[n - 1];
    const wx = Math.max(...rects.map((r) => r.x + r.w)) + WT + (ext.has("columns") || ext.has("turrets") || ext.has("tiers") ? margin / 2 + 40 : 40);
    const wr = { x: wx, y: last.y, w: wingW - 40, h: FH };
    // 장면 전체가 물이면 따로 물을 깔지 않는다(끊겨 보임)
    if (wf.water && !cfg.water) o += `<rect x="${wx - 20}" y="${last.y + FH - 24}" width="${wingW}" height="${Math.max(44, groundY - (last.y + FH - 24) + 10)}" fill="url(#${id}w)"/>`;
    o += `<text x="${wx + (wingW - 40) / 2}" y="${last.y - 6}" text-anchor="middle" font-family="KookminUniversitySunggokSerif, serif" font-size="20" fill="#2c2015">${esc(wf.t)}</text>`;
    placeRow(wr, wf, null);
  }
  // 도면 안의 자잘한 외곽선: 면이 있는 도형에서는 선을 빼고, 가구는 그림자로 띄운다
  const unline = (str) => str.replace(/<(path|rect|circle|ellipse)\b([^>]*?)\/>/g, (m, tag, attrs) =>
    /fill="(?!none)[^"]+"/.test(attrs) && /\sstroke="/.test(attrs) ? `<${tag}${attrs.replace(/\s(stroke|stroke-width|stroke-linejoin|stroke-linecap)="[^"]*"/g, "")}/>` : m);
  o = unline(o) + `<g filter="url(#${id}d)">${unline(furn)}</g>`;

  // 층 표기 · 방 이름
  rects.forEach((r, i) => {
    const f = cfg.floors[i];
    const ly = r.y + r.h / 2;
    const tag = 70;
    const lightText = f.redact || cfg.dark || cfg.volcanic || f.dream;
    o += `<g class="flabel"><path d="M${tag + 26},${ly} H${Math.min(...rects.map((q) => q.x)) - margin - 20 > tag + 40 ? r.x - WT - 30 : r.x - WT - 6}" stroke="rgba(44,32,21,.4)" stroke-width="1" stroke-dasharray="2 5"/>
      <circle cx="${tag}" cy="${ly}" r="24" fill="${color}"/><circle cx="${tag}" cy="${ly}" r="19" fill="none" stroke="#f4e9cd" stroke-width="1.2"/>
      <text x="${tag}" y="${ly + 6}" text-anchor="middle" font-family="Cinzel, serif" font-weight="700" font-size="${f.n.length > 2 ? 11 : 15}" fill="#f4e9cd">${esc(f.n)}</text>
      <text x="${r.x + r.w / 2}" y="${r.y + ceilRise(r, f.ceil) * 0.6 + 26}" text-anchor="middle" font-family="KookminUniversitySunggokSerif, serif" font-size="18" fill="${lightText ? "#f4e9cd" : "#2c2015"}">${esc(f.t)}</text></g>`;
  });

  // 인물 표식
  for (const p of pins) {
    const c = CHARS[p.name];
    const clip = `${id}c${pins.indexOf(p)}`;
    const img = c && c.img ? c.img : null;
    const veiled = c && (isVeiled ? isVeiled(p.name) : c.imgSpoiler);
    const label = c && c.hidden ? "???" : p.name;
    o += `<g class="npc-pin${veiled ? " veiled" : ""}" data-npc="${esc(p.name)}" transform="translate(${p.x},${p.y})" tabindex="0" role="button" aria-label="${esc(label)} 소개 보기">
      <ellipse cy="-2" rx="16" ry="4" fill="rgba(0,0,0,.25)"/>
      <path d="M0,-2 l-10,-20 h20z" fill="${color}"/>
      <circle cy="-52" r="33" fill="${color}"/><circle cy="-52" r="28" fill="#f4e9cd"/>
      <clipPath id="${clip}"><circle cy="-52" r="26"/></clipPath>
      ${img ? `<image href="${img}" x="-30" y="-82" width="60" height="88" preserveAspectRatio="xMidYMin slice" clip-path="url(#${clip})" ${veiled ? `filter="url(#${id}b)"` : ""}/>` : ""}
      <g transform="translate(0,-96)"><rect x="${-label.length * 9 - 14}" y="-14" width="${label.length * 18 + 28}" height="26" rx="13" fill="#2c2015" opacity=".88"/><text y="5" text-anchor="middle" font-family="KookminUniversitySunggokSerif, serif" font-size="16" fill="#f4e9cd">${esc(label)}</text></g>
    </g>`;
  }
  return o + `</svg>`;
}
