(() => {
/* ===== 설정 ===== */
const FAME_CUTOFF = 72688;          // 명성 하한
const SHOW_DATE = true;             // 날짜 줄 표시 여부(true/false)

/* ===== 유틸 ===== */
function getFormattedDate() {
  const d = new Date();
  const yy = d.getFullYear().toString().slice(-2);
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  const HH = String(d.getHours()).padStart(2,'0');
  const MM = String(d.getMinutes()).padStart(2,'0');
  return `${yy}${mm}${dd} ${HH}:${MM}`;
}

// 딜(억 단위 소수)로 통일
function formatDeal(v) {
  v = String(v).replace(/,/g,'').trim();
  if (v.includes('억')) {
    const [eokPart, rest] = v.split('억');
    const eok = parseFloat(eokPart||0);
    const rem = rest ? parseFloat(rest.replace('만',''))||0 : 0;
    return ((eok*10000 + rem) / 10000).toFixed(2);
  } else if (v.includes('만')) {
    return (parseFloat(v.replace('만',''))/10000).toFixed(2);
  }
  return (parseFloat(v||0)/100000000).toFixed(2);
}
// 버프(만 단위 소수)
function formatBuff(v) {
  return (parseInt(String(v).replace(/,/g,''),10)/10000).toFixed(1);
}

/* ===== 닉/직업/명성 ===== */
const nicknameFixMap = {
  '무떠닝': '떠닝무',
  '도치떠닝': '떠닝도치',
  '원시오단': '시오단원',
};

const jobAliasMap = {
  '웨펀마스터':'웨펀','소울브링어':'소울','버서커':'버서커','아수라':'아수라','검귀':'검귀',
  '소드마스터':'소마','다크템플러':'암제','데몬슬레이어':'검마','베가본드':'검제','블레이드':'블레',
  '넨마스터':'넨마','스트라이커':'스커','스트리트파이터':'독왕','그래플러':'그플','레인저':'레인저',
  '런처':'런처','메카닉':'메카닉','스핏파이어':'스핏','어썰트':'어썰트','패러메딕':'메딕',
  '엘레멘탈 바머':'바보','빙결사':'빙결사','블러드 메이지':'블메','스위프트 마스터':'바람',
  '디멘션워커':'디멘','엘레멘탈마스터':'엘마','소환사':'소환사','배틀메이지':'배메','마도학자':'마도',
  '인챈트리스':'인챈','크루세이더':'크루','인파이터':'인파','퇴마사':'퇴마사','어벤저':'어벤저',
  '이단심판관':'이단','무녀':'무녀','미스트리스':'리디머','로그':'로그','사령술사':'사령술사',
  '쿠노이치':'쿠노이치','섀도우댄서':'섀댄','엘븐나이트':'엘븐','카오스':'카오스','팔라딘':'팔라딘',
  '드래곤나이트':'드나','뱅가드':'뱅가드','듀얼리스트':'듀얼','드래고니안 랜서':'드붕','다크 랜서':'닼랜',
  '히트맨':'히트맨','요원':'요원','트러블 슈터':'트슈','스페셜리스트':'스페셜리스트',
  '뮤즈':'뮤즈','트래블러':'트븜','헌터':'헌터','비질란테':'비질','키메라':'키메라',
  '크리에이터':'크리','다크나이트':'닼나'
};

function getJobAlias(jobText) {
  const clean = String(jobText).replace(/^眞\s*/,'').trim();
  return jobAliasMap[clean] || clean;
}

function getFame(card) {
  const el =
    card.querySelector('.seh_name .level .val') ||
    card.querySelector('.seh_name .level > .val') ||
    card.querySelector('.seh_name .val');
  if (!el) return null;
  const m = el.textContent.match(/[\d,]+/);
  return m ? parseInt(m[0].replace(/,/g,''),10) : null;
}

/* ===== 파싱 ===== */
let dealers = [], buffers = [];
document.querySelectorAll('.scon').forEach(card => {
  // 닉네임
  let nameEl = card.querySelector('.seh_name > span') || card.querySelector('.seh_name .name') || card.querySelector('.seh_name span');
  if (!nameEl) return;
  let name = nameEl.textContent.trim();
  const serverEl = card.querySelector('.seh_name .introd.server');
  if (serverEl) name = name.replace(serverEl.textContent.trim(), '').trim();
  if (nicknameFixMap[name]) name = nicknameFixMap[name];

  // 직업
  const jobEl = card.querySelector('.seh_job .sev, .seh_job .job');
  const jobRaw = jobEl ? jobEl.textContent : '직업없음';
  const job = getJobAlias(jobRaw);

  // 명성 컷
  const fame = getFame(card);
  if (fame === null || fame < FAME_CUTOFF) return;

  // 수치(딜/버프)
  const dealEl = card.querySelector('.stat_a .val');
  const buffEl = card.querySelector('.stat_b .val');
  const specBuffEl = card.querySelector('.stat_b > li:nth-child(3) > div > span.val'); // 인챈 특수

  if (dealEl) {
    dealers.push({ name, job, value: formatDeal(dealEl.textContent) });
  } else if (job.includes('인챈') && specBuffEl) {
    buffers.push({ name, job, value: formatBuff(specBuffEl.textContent) });
  } else if (buffEl) {
    buffers.push({ name, job, value: formatBuff(buffEl.textContent) });
  }
});

/* ===== 정렬 & 출력 ===== */
dealers.sort((a,b)=>parseFloat(b.value)-parseFloat(a.value));
buffers.sort((a,b)=>parseFloat(b.value)-parseFloat(a.value));

const dealerLines = dealers
  .map(c => `${c.name}-${c.job} ${Math.round(parseFloat(c.value))}`)
  .join('\n');

const bufferLines = buffers
  .map(c => `${c.name}-${c.job} ${Math.round(parseFloat(c.value))}`)
  .join('\n');

const out = `${SHOW_DATE ? getFormattedDate()+'\n' : ''}${dealerLines}${dealerLines && bufferLines ? '\n\n' : ''}${bufferLines}`.trim();

console.log(out);

// 클립보드 복사
const ta = document.createElement('textarea');
ta.value = out;
document.body.appendChild(ta);
ta.select();
document.execCommand('copy');
document.body.removeChild(ta);
})();
