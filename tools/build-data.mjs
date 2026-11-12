// 티팟 저장본(snapshot JSON)의 로어북에서 사이트용 데이터(js/data.js)를 만든다.
// 사용법: node tools/build-data.mjs <snapshot.json>
// [비밀] 줄은 spoiler로 표시해서 사이트에서 가린다. AI용 지시(공개:)는 뺀다.
import fs from "node:fs";
import path from "node:path";

const src = process.argv[2];
if (!src) throw new Error("snapshot.json 경로가 필요해요");
const snap = JSON.parse(fs.readFileSync(src, "utf8"));
const books = snap.keyword_books;
const byIdx = (i) => books.find((b) => Number(b.indexLabel) === i);

// ---------- 로어북 본문 파싱 ----------
function parseInfo(info) {
  const lines = info.replace(/\{user\}/g, "당신").split("\n");
  const head = (lines.find((l) => l.startsWith("## ")) || "").slice(3).trim();
  const fields = [];
  let cur = null;
  for (const raw of lines) {
    if (raw.startsWith("## ") || raw.startsWith("### ") || !raw.trim()) continue;
    const sub = raw.match(/^\s+\*\s*(.*)$/);
    if (sub && cur) {
      cur.v += "\n" + sub[1];
      continue;
    }
    const m = raw.match(/^-\s*(?:(\[비밀\])\s*)?(?:([^:：]{1,14})[:：]\s*)?(.*)$/);
    if (!m) continue;
    let [, sec1, k, v] = m;
    k = (k || "").trim();
    let spoiler = !!sec1;
    if (/^\[비밀\]/.test(v)) (spoiler = true), (v = v.replace(/^\[비밀\]\s*/, ""));
    if (k === "공개") { cur = null; continue; }
    cur = { k, v: v.trim(), spoiler };
    fields.push(cur);
  }
  return { head, fields };
}

// ---------- 이미지 ----------
const IMG = {
  셀레스틴: "schools/aurora/celestine", 가브리엘: "schools/aurora/gabriel", 루시앙: "schools/aurora/lucien",
  녹스: "schools/somnium/nox", 이졸데: "schools/somnium/isolde", 카스: "schools/somnium/cass",
  오르솔라: "schools/flumen/orsola", 마테오: "schools/flumen/mateo", 니나: "schools/flumen/nina",
  베아트리체: "schools/hortus/beatrice", 앙리: "schools/hortus/henri", 로즈마리: "schools/hortus/rosemary",
  브란: "schools/fornax/bran", 레아: "schools/fornax/lea", 토비: "schools/fornax/toby",
  하인리히: "schools/tonans/heinrich", 엘레오노르: "schools/tonans/eleonore", 카이: "schools/tonans/kai",
  에제키엘: "schools/profundum/ezekiel", 이리나: "schools/profundum/irina", 핀: "schools/profundum/finn",
  아우구스투스: "institutions/concilium/augustus", 세실리아: "institutions/concilium/cecilia", 퍽: "institutions/concilium/puck",
  "아드리안 그레이": "institutions/tabularium/adrian_gray", 야나: "institutions/tabularium/jana", 토마스: "institutions/tabularium/thomas",
  레온하르트: "institutions/ordo_fulguris/leonhard", 고드윈: "institutions/ordo_fulguris/godwin", 미라: "institutions/ordo_fulguris/mira",
  야경: "institutions/vigilia/maude", 시온: "institutions/vigilia/sion", 엘린: "institutions/vigilia/elin",
  오토: "institutions/cursus/otto", 피오: "institutions/cursus/fio", 그레타: "institutions/cursus/greta",
  로렌초: "institutions/mercator/lorenzo", 자스민: "institutions/mercator/jasmine", 오닐: "institutions/mercator/oneill",
  이브: "institutions/limen/eve", 한서진: "institutions/limen/han_seojin", 오스왈드: "institutions/limen/oswald",
  "모레이 할멈": "institutions/conventus/moray", 빅스: "institutions/conventus/vix", 셀윈: "institutions/conventus/selwyn",
  펜드라곤: "institutions/caliburnus/pendragon", 탈리에신: "institutions/caliburnus/taliesin", 퍼시벌: "institutions/caliburnus/percival",
  마르타: "others/concordia/martha", 빔: "others/concordia/wim", 테오: "others/concordia/theo", 아샤: "others/concordia/asha",
  티슬: "others/concordia/thistle", 벨: "others/concordia/belle",
  지오: "others/regions/gio", 페트라: "others/regions/petra", 노엘: "others/regions/noel",
  용생구자: "ancients/longsheng_jiuzi/longsheng_jiuzi_true",
  비희: "ancients/longsheng_jiuzi/bixi_human", 이문: "ancients/longsheng_jiuzi/chiwen_human", 포뢰: "ancients/longsheng_jiuzi/pulao_human",
  폐안: "ancients/longsheng_jiuzi/bian_human", 도철: "ancients/longsheng_jiuzi/taotie_human", 공복: "ancients/longsheng_jiuzi/gongfu_human",
  애자: "ancients/longsheng_jiuzi/yazi_human", 산예: "ancients/longsheng_jiuzi/suanni_human", 초도: "ancients/longsheng_jiuzi/jiaotu_human",
  오베론: "ancients/oberon_human", 멜뤼진: "ancients/melusine_human", 헤스페리데스: "ancients/hesperides_human",
  이프리트: "ancients/ifrit_human", 가루다: "ancients/garuda_human", 니드호그: "ancients/nidhogg_true",
  헬리아: "majors/helia_human", 소월: "majors/sowol_human", 청류: "majors/cheongryu_human", 나르기스: "majors/nargis_human",
  힐드: "majors/hild_human", 휘린: "majors/huirin_human", 네페르: "majors/nefer_human",
  멀린: "hidden/merlin", 비비안: "hidden/vivian",
};
const TRUE_IMG = {
  오베론: "ancients/oberon_true", 멜뤼진: "ancients/melusine_true", 헤스페리데스: "ancients/hesperides_true",
  이프리트: "ancients/ifrit_true", 가루다: "ancients/garuda_true",
};

// ---------- 지역 ----------
const REGIONS = [
  { id: "concordia", idx: 81, name: "콘코르디아 교차시", short: "콘코르디아", latin: "CONCORDIA", attr: "중립", sym: "✶", color: "#6fae8c" },
  { id: "arcadia", idx: 82, name: "아르카디아 고원", short: "아르카디아", latin: "ARCADIA", attr: "태양", sym: "☉", color: "#d9a43a" },
  { id: "lunatica", idx: 83, name: "루나티카 안개 숲", short: "루나티카", latin: "LUNATICA", attr: "달", sym: "☽", color: "#8c93d6" },
  { id: "mercurius", idx: 84, name: "메르쿠리우스 운하", short: "메르쿠리우스", latin: "MERCURIUS", attr: "수성", sym: "☿", color: "#4f9cc4" },
  { id: "venustas", idx: 85, name: "베누스타스 화원주", short: "베누스타스", latin: "VENUSTAS", attr: "금성", sym: "♀", color: "#d67fa4" },
  { id: "martialis", idx: 86, name: "마르티알리스 산맥", short: "마르티알리스", latin: "MARTIALIS", attr: "화성", sym: "♂", color: "#c8573c" },
  { id: "jupiter", idx: 87, name: "유피테르 성벽지", short: "유피테르", latin: "JUPITER", attr: "목성", sym: "♃", color: "#8b6cc4" },
  { id: "saturnus", idx: 88, name: "사투르누스 대심도", short: "사투르누스", latin: "SATURNUS", attr: "토성", sym: "♄", color: "#a8875a" },
];
for (const r of REGIONS) {
  const p = parseInfo(byIdx(r.idx).info);
  r.fields = p.fields.filter((f) => !["주요 인물"].includes(f.k));
}

// ---------- 장소(기관) ----------
// kind: school / inst / local / major / ancient / hidden
// icon: 지도 위에 그릴 건물 그림 종류
// rooms: 평면도의 방. npcs의 각 인물은 같은 순번의 방에 선다(넘치면 마지막 방).
const SITES = [
  // 콘코르디아
  { id: "plaza", region: "concordia", kind: "local", icon: "plaza", name: "중앙 광장", desc: "일곱 지역의 길이 만나는 콘코르디아의 심장. 해시계와 일곱 색 깃발, 검이 뽑힌 자국이 남은 바위가 있다.", rooms: ["분수대", "해시계 탑", "검이 뽑힌 바위", "순례길 시작점", "광장 벤치"], npcs: ["티슬", "벨", "퍼시벌", "테오"] },
  { id: "inn", region: "concordia", kind: "local", icon: "inn", name: "여관 '일곱 갈래 길'", desc: "순례자와 표류자를 수십 년째 받아 온 여관. 1층 식당에서는 음유시인의 공연이 자주 열린다.", rooms: ["카운터", "식당", "공연 무대", "2층 객실", "다락 하숙방"], npcs: ["마르타", "아샤", "탈리에신", "테오", "카이"] },
  { id: "workshop", region: "concordia", kind: "local", icon: "workshop", name: "빔의 마도구 공방", desc: "폭발음이 끊이지 않는 마도구 공방. 불꽃 마도구가 명물이다.", rooms: ["작업대", "진열장", "시험 마당", "창고"], npcs: ["빔"] },
  { id: "tabularium-branch", region: "concordia", kind: "inst", icon: "archive", name: "타불라리움 분원", desc: "콘코르디아의 계약 등록 창구. 순례의 아침이면 줄이 광장까지 늘어선다.", rooms: ["등록 창구", "대기실", "각인 감정실", "서류 보관실"], npcs: ["토마스"] },
  // 아르카디아
  { id: "aurora", region: "arcadia", kind: "school", icon: "tower-sun", inst: 93, name: "여명탑 '아우로라'", rooms: ["새벽 기도실", "정화의 회랑", "원장실", "치유 강의실", "견습생 숙소"], npcs: ["셀레스틴", "가브리엘", "셀레스틴", "가브리엘", "루시앙"] },
  { id: "spring", region: "arcadia", kind: "local", icon: "spring", name: "치유의 샘과 성소의 향로", desc: "공복이 관리하는 치유의 샘, 산예가 머무는 성소의 향로. 고원 순례자들이 가장 먼저 찾는 곳이다.", rooms: ["치유의 샘", "성소의 향로", "순례자 쉼터"], npcs: ["공복", "산예", "포뢰"] },
  { id: "nest", region: "arcadia", kind: "ancient", icon: "nest", name: "용생구자의 둥지", desc: "아홉 형제 용의 금역. 백금빛 비늘이 바위틈마다 박혀 있다.", rooms: ["맏이의 비석", "망루", "성역의 문", "도철의 굴", "승냥이 바위", "막내의 소라"], npcs: ["비희", "이문", "폐안", "도철", "애자", "초도", "용생구자"] },
  { id: "ash-altar", region: "arcadia", kind: "major", icon: "altar", inst: 139, name: "재의 제단", rooms: ["흰 돌 제단", "그을린 바위", "절벽 끝"], npcs: ["헬리아"] },
  // 루나티카
  { id: "somnium", region: "lunatica", kind: "school", icon: "tower-moon", inst: 94, name: "몽월원 '솜니움'", rooms: ["꿈 해석실", "원장의 서재", "월광 강의실", "뒷골목 출구"], npcs: ["이졸데", "녹스", "녹스", "카스"] },
  { id: "lantern", region: "lunatica", kind: "local", icon: "lantern", name: "숲 입구의 등불 초소", desc: "안개 숲으로 들어가는 유일하게 안전한 길목. 등불지기가 길 잃은 이들을 기다린다.", rooms: ["등불 초소", "길 안내판", "갈림길"], npcs: ["노엘"] },
  { id: "mortar", region: "lunatica", kind: "major", icon: "mortar", inst: 140, name: "달빛 절구터", rooms: ["달빛 기둥", "돌절구", "달꽃 덤불"], npcs: ["소월"] },
  { id: "shadow-palace", region: "lunatica", kind: "ancient", icon: "palace", name: "그림자 궁전", desc: "오베론이 잠든 안개의 궁전. 길을 잃은 채 세 번 잠들면 이곳에서 깨어난다고 한다.", rooms: ["안개의 옥좌", "꿈의 정원", "거울 회랑"], npcs: ["오베론"] },
  { id: "avallach", region: "lunatica", kind: "hidden", icon: "apple", inst: 131, name: "사과나무 숲", realName: "사과나무 숲 '아발라흐'", rooms: ["오두막", "사과나무 길", "고요한 호수"], npcs: ["비비안"] },
  // 메르쿠리우스
  { id: "flumen", region: "mercurius", kind: "school", icon: "tower-water", inst: 95, name: "유수당 '플루멘'", rooms: ["원장실", "도선 연습 수로", "기록 보관소", "물길 강의실"], npcs: ["오르솔라", "마테오", "니나"] },
  { id: "cursus", region: "mercurius", kind: "inst", icon: "post", inst: 104, name: "우편국 '쿠르수스'", rooms: ["국장실", "우편선 부두", "분류실", "분실 우편 보관소"], npcs: ["오토", "피오", "피오", "그레타"] },
  { id: "mercator", region: "mercurius", kind: "inst", icon: "market", inst: 105, name: "메르카토르 조합", rooms: ["조합장실", "대운하 시장 다리", "뒷골목 골동품 가게", "행운의 노점"], npcs: ["로렌초", "세실리아", "자스민", "오닐"] },
  { id: "pier", region: "mercurius", kind: "local", icon: "gondola", name: "곤돌라 선착장", desc: "대운하 곳곳을 잇는 곤돌라의 출발지. 사공들의 노랫소리로 하루가 시작된다.", rooms: ["선착장", "대운하 물길"], npcs: ["지오"] },
  { id: "bell-tower", region: "mercurius", kind: "major", icon: "belltower", inst: 141, name: "잠긴 종탑", rooms: ["종루", "물에 잠긴 계단", "잠긴 마을"], npcs: ["청류"] },
  { id: "abyss", region: "mercurius", kind: "ancient", icon: "abyss", name: "운하의 심연", desc: "멜뤼진이 잠든 깊은 물. 운하 수위가 바뀌는 날은 플루멘도 휴강한다.", rooms: ["심연의 입구", "푸른 잠자리"], npcs: ["멜뤼진"] },
  { id: "glass-tower", region: "mercurius", kind: "hidden", icon: "glass", inst: 129, name: "???", realName: "유리탑 '에스플뤼무아르'", rooms: ["나선 계단", "편지의 하늘", "꼭대기 서재"], npcs: ["멀린"] },
  // 베누스타스
  { id: "hortus", region: "venustas", kind: "school", icon: "dome", inst: 96, name: "만화정 '호르투스'", rooms: ["월계수 원장실", "조향실", "학파 정원", "온실 강의실"], npcs: ["베아트리체", "앙리", "로즈마리"] },
  { id: "herb-shop", region: "venustas", kind: "local", icon: "herb", name: "변두리의 약초 가게", desc: "약초 마녀 셀윈의 가게. 마른 풀 냄새와 고양이 털이 가득하다.", rooms: ["가게 카운터", "약초 건조대", "뒷마당 밭"], npcs: ["셀윈"] },
  { id: "greenhouse", region: "venustas", kind: "major", icon: "greenhouse", inst: 142, name: "버려진 온실", rooms: ["시든 화단", "깨진 유리 지붕", "녹슨 도구함"], npcs: ["나르기스"] },
  { id: "golden-garden", region: "venustas", kind: "ancient", icon: "tree", name: "황금 사과의 정원", desc: "헤스페리데스의 금역. 지친 자에게는 안식을, 탐욕스러운 자에게는 영원한 매혹을 준다.", rooms: ["황금 사과나무", "노을의 연못"], npcs: ["헤스페리데스"] },
  // 마르티알리스
  { id: "fornax", region: "martialis", kind: "school", icon: "forge", inst: 97, name: "단철관 '포르낙스'", rooms: ["관장의 대장간", "단조장", "견습 작업장", "무기고"], npcs: ["브란", "레아", "토비"] },
  { id: "arena", region: "martialis", kind: "local", icon: "arena", name: "투기장", desc: "산맥 아래 마을의 투기장. 분쟁은 여기서 결투로 끝낸다.", rooms: ["주인석", "결투장", "대기실"], npcs: ["페트라", "레아"] },
  { id: "spear-hill", region: "martialis", kind: "major", icon: "spears", inst: 143, name: "창의 언덕", rooms: ["창의 숲", "이름 없는 돌무덤"], npcs: ["힐드"] },
  { id: "crater", region: "martialis", kind: "ancient", icon: "volcano", name: "이프리트의 화구", desc: "산맥 정상의 화구. 화로제 날, 작품을 바치면 불길 속에서 이프리트가 모습을 드러낸다.", rooms: ["화구 가장자리", "제물의 바위"], npcs: ["이프리트"] },
  // 유피테르
  { id: "tonans", region: "jupiter", kind: "school", icon: "keep", inst: 98, name: "뇌벽원 '토난스'", rooms: ["원장실", "학생회실", "결계 연습장", "내성 강의실"], npcs: ["하인리히", "엘레오노르"] },
  { id: "concilium", region: "jupiter", kind: "inst", icon: "council", inst: 100, name: "의회 '콘킬리움'", rooms: ["의장석", "의원석", "사절 참관석", "맹약문 보관실"], npcs: ["아우구스투스", "세실리아", "퍽"] },
  { id: "tabularium", region: "jupiter", kind: "inst", icon: "archive", inst: 101, name: "기록원 '타불라리움' 본원", rooms: ["기록원장실", "각인 감정실", "계약 대장고", "봉인 서고"], npcs: ["아드리안 그레이", "야나"] },
  { id: "ordo", region: "jupiter", kind: "inst", icon: "barracks", inst: 102, name: "기사단 '오르도 풀구리스'", rooms: ["단장실", "훈련장", "순찰로", "마구간"], npcs: ["레온하르트", "고드윈", "미라"] },
  { id: "storm-watch", region: "jupiter", kind: "major", icon: "watchtower", inst: 144, name: "폭풍 망루", rooms: ["무너진 망루", "번개 자국 계단", "풀밭"], npcs: ["휘린"] },
  { id: "garuda-tower", region: "jupiter", kind: "ancient", icon: "spire", name: "가루다의 탑", desc: "성벽지 가장 높은 곳의 탑. 꼭대기는 금역이다.", rooms: ["탑 꼭대기", "깃털의 계단"], npcs: ["가루다"] },
  // 사투르누스
  { id: "profundum", region: "saturnus", kind: "school", icon: "library", inst: 99, name: "심연서고 '프로푼둠'", rooms: ["대사서실", "봉인관", "열람실", "가고일의 입구"], npcs: ["에제키엘", "이리나", "핀"] },
  { id: "closed-door", region: "saturnus", kind: "major", icon: "door", inst: 145, name: "닫힌 문", rooms: ["돌문 앞", "빈 홈", "금서고 계단"], npcs: ["네페르"] },
  { id: "deep-bottom", region: "saturnus", kind: "ancient", icon: "shaft", name: "대심도 바닥", desc: "끝이 보이지 않는 수직 갱도의 바닥. 너무 깊이 내려간 자는 돌아오지 못한다.", rooms: ["어둠"], npcs: ["니드호그"] },
];

// 지도 바깥 여백에 적는 '자리가 정해지지 않은 기관'
const WANDERING = [
  { id: "vigilia", kind: "inst", icon: "eye", inst: 103, name: "감찰국 '비질리아'", rooms: ["본부(비공개)", "사역마 쉼터", "현장"], npcs: ["야경", "엘린", "시온"] },
  { id: "limen", kind: "inst", icon: "rift", inst: 106, name: "관측소 '리멘'", rooms: ["관측실", "표류자 숙소", "경계 연구실"], npcs: ["이브", "한서진", "오스왈드"] },
  { id: "conventus", kind: "inst", icon: "cauldron", inst: 107, name: "마녀 회합 '콘벤투스'", rooms: ["모닥불", "마녀 부스", "약초 좌판"], npcs: ["모레이 할멈", "빅스", "셀윈"] },
  { id: "caliburnus", kind: "inst", icon: "sword", inst: 108, name: "비밀 결사 '칼리부르누스'", rooms: ["가면의 회합실", "하프 소리가 나는 곳", "바위 곁"], npcs: ["펜드라곤", "탈리에신", "퍼시벌"] },
];

// ---------- 인물 ----------
const GROUP_BY_PREFIX = { 여명탑: "aurora", 몽월원: "somnium", 유수당: "flumen", 만화정: "hortus", 단철관: "fornax", 뇌벽원: "tonans", 심연서고: "profundum" };
const REGION_BY_WORD = { 콘코르디아: "concordia", 아르카디아: "arcadia", 루나티카: "lunatica", 메르쿠리우스: "mercurius", 베누스타스: "venustas", 마르티알리스: "martialis", 유피테르: "jupiter", 사투르누스: "saturnus" };
const ANCIENT_REGION = { 용생구자: "arcadia", 비희: "arcadia", 이문: "arcadia", 포뢰: "arcadia", 폐안: "arcadia", 도철: "arcadia", 공복: "arcadia", 애자: "arcadia", 산예: "arcadia", 초도: "arcadia", 오베론: "lunatica", 멜뤼진: "mercurius", 헤스페리데스: "venustas", 이프리트: "martialis", 가루다: "jupiter", 니드호그: "saturnus" };
const INST_REGION = { 의회: "jupiter", 기록원: "jupiter", 기사단: "jupiter", 우편국: "mercurius", "상인 연합": "mercurius" };

const CHARS = {};
for (const b of books) {
  const t = b.title.match(/^\[(NPC|원형종|고대종)\]\s*(.*?)\s*·\s*(.*?)\s*'([^']+)'\s*$/) || b.title.match(/^\[(고대종)\]\s*(.*?)\s*·\s*'([^']+)'\s*$/);
  if (!t) continue;
  let type, aff, role, name;
  if (t.length === 5) [, type, aff, role, name] = t;
  else [, type, aff, name] = t, (role = "");
  const p = parseInfo(b.info);
  let group = "other", region = null;
  if (type === "고대종") (group = "ancient"), (region = ANCIENT_REGION[name]);
  else if (aff === "미공개") (group = "hidden"), (region = name === "멀린" ? "mercurius" : "lunatica");
  else if (GROUP_BY_PREFIX[aff]) (group = GROUP_BY_PREFIX[aff]), (region = { aurora: "arcadia", somnium: "lunatica", flumen: "mercurius", hortus: "venustas", fornax: "martialis", tonans: "jupiter", profundum: "saturnus" }[GROUP_BY_PREFIX[aff]]);
  else if (REGION_BY_WORD[aff.split(" ")[0]]) (group = type === "원형종" && aff !== "콘코르디아" ? "major" : "regional"), (region = REGION_BY_WORD[aff.split(" ")[0]]);
  else region = INST_REGION[aff] || null;
  if (type === "원형종" && aff !== "콘코르디아") group = "major";
  const subtitle = p.head.split("/").slice(1).join("/").trim();
  CHARS[name] = {
    name, type, aff, role, group, region, subtitle,
    img: IMG[name] ? "assets/portraits/" + IMG[name] + ".webp" : null,
    imgTrue: TRUE_IMG[name] ? "assets/portraits/" + TRUE_IMG[name] + ".webp" : null,
    fields: p.fields,
    hidden: group === "hidden",
    imgSpoiler: name === "야경",
  };
}

// 기관 설명을 로어북에서 채우기
function instDesc(idx) {
  const p = parseInfo(byIdx(idx).info);
  return p.fields;
}
for (const s of [...SITES, ...WANDERING]) {
  if (s.inst) s.fields = instDesc(s.inst);
  else s.fields = [{ k: "", v: s.desc, spoiler: false }];
  delete s.desc;
  for (const n of s.npcs) if (!CHARS[n]) throw new Error("인물 없음: " + n + " @" + s.id);
}

// 세계관 용어(책장용 원문)
const LORE = {};
for (const i of [74, 75, 76, 77, 78, 79, 80, 91, 92, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127]) {
  const b = byIdx(i);
  LORE[b.title] = b.info.replace(/\{user\}/g, "당신");
}

const out =
  "// 자동 생성 파일: node tools/build-data.mjs <snapshot.json>\n" +
  "export const REGIONS = " + JSON.stringify(REGIONS, null, 1) + ";\n" +
  "export const SITES = " + JSON.stringify(SITES, null, 1) + ";\n" +
  "export const WANDERING = " + JSON.stringify(WANDERING, null, 1) + ";\n" +
  "export const CHARS = " + JSON.stringify(CHARS, null, 1) + ";\n" +
  "export const LORE = " + JSON.stringify(LORE, null, 1) + ";\n";
const dest = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "js", "data.js");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out);
console.log("chars", Object.keys(CHARS).length, "sites", SITES.length, "→", dest);
