(async function () {
  const START_DATE = new Date('2025-01-09T06:00:00');
  const END_DATE = (() => { const t = new Date(); const r = new Date(t); const d = r.getDay(); const diff = (4 - d + 7) % 7; r.setDate(r.getDate() + diff); r.setHours(6, 0, 0, 0); return r; })();
  const NOW = new Date();
  const fmtYMD = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const delay = ms => new Promise(res => setTimeout(res, ms));
  async function clickAllMoreButtons() {
    const maxClicks = 100;
    const deadline = Date.now() + 30000;
    let clicks = 0;
    const findBtn = () => document.querySelector('a.btn.btntype_bu60');
    while (Date.now() < deadline && clicks < maxClicks) {
      const btn = findBtn();
      if (!btn || btn.style.display === 'none' || btn.disabled) break;
      btn.click();
      clicks++;
      await delay(300);
    }
  }
  await clickAllMoreButtons();

  const summary = { '레벨 상승치': 0, '피로도 사용량': 0, '115Lv 태초': 0, '115Lv 에픽': 0, '115Lv 레전더리': 0, '심연 : 종말의 숭배자': 0, '종말의 숭배자': 0, '나벨': 0, '베누스': 0, '이내 황혼전': 0 };
  const weeks = [];
  const normalize = s => (s||'').replace(/\s*아이템$/,'').replace(/\s*클리어$/,'').replace(/\s+/g,' ').trim();
  document.querySelectorAll('#weeklyArea dl').forEach(dl => {
    const span = dl.querySelector('dt span')?.textContent || '';
    const m = span.match(/(\d{4}\.\d{2}\.\d{2})\s+06시\s*~\s*(\d{4}\.\d{2}\.\d{2})\s+06시/);
    if (!m) return;
    const [_, sStr, eStr] = m;
    const start = new Date(sStr.replace(/\./g,'-')+'T06:00:00');
    const end   = new Date(eStr.replace(/\./g,'-')+'T06:00:00');
    if (!(start >= START_DATE && end <= END_DATE)) return;
    let weekTaecho = 0;
    dl.querySelectorAll('dd p').forEach(p=>{
      let label = normalize(p.querySelector('span')?.innerText);
      const number = parseInt((p.querySelector('b')?.innerText||'').replace(/[^\d]/g,''),10)||0;
      if (label==='115Lv 태초') { summary['115Lv 태초']+=number; weekTaecho+=number; return; }
      if (label==='115Lv 에픽')  { summary['115Lv 에픽']+=number; return; }
      if (label==='115Lv 레전더리'){ summary['115Lv 레전더리']+=number; return; }
      if (label==='심연 : 종말의 숭배자'){ summary['심연 : 종말의 숭배자']+=number; return; }
      if (label==='종말의 숭배자'){ summary['종말의 숭배자']+=number; return; }
      if (label==='나벨'){ summary['나벨']+=number; return; }
      if (label==='베누스'){ summary['베누스']+=number; return; }
      if (label==='레벨 상승치'){ summary['레벨 상승치']+=number; return; }
      if (label==='피로도 사용량'){ summary['피로도 사용량']+=number; return; }
      if (label==='이내황혼전' || label==='이내 황혼전'){ summary['이내 황혼전']+=number; return; }
    });
    weeks.push({ start, end, taecho: weekTaecho });
  });

  const epic = summary['115Lv 에픽'];
  const taecho= summary['115Lv 태초'];
  const simyeon=summary['심연 : 종말의 숭배자'];
  const tenEpicRate = epic ? (taecho/epic*10).toFixed(2) : '-';
  const oneSimyeonRate = simyeon ? (taecho/simyeon).toFixed(2) : '-';
  const dPlus = Math.floor((NOW - START_DATE) / 86400000) + 1;
  const weekIndex = Math.floor((NOW - START_DATE) / (86400000*7)) + 1;

  let moheomdan = '';
  const grpHTML = document.querySelector('p.chargroup')?.innerHTML || '';
  const gm = grpHTML.replace(/\s/g,'').match(/모험단<\/i>Lv\.\d+([^<]+)/);
  moheomdan = (gm && gm[1]) ? gm[1] : (document.querySelector('#personalArea ul.name li')?.textContent.trim() || '모험단');
  const nowStr = NOW.toLocaleString('ko-KR');

  document.querySelector('#df-summary-box')?.remove();

  const style = document.createElement('style');
  style.textContent = `
  @font-face{font-family:'DNFBitBitv2';font-style:normal;font-weight:400;src:url('https://cdn.df.nexon.com/img/common/font/DNFBitBitv2.otf') format('opentype')}
  `;
  document.head.appendChild(style);
  await Promise.all([document.fonts.load("34px 'DNFBitBitv2'"), document.fonts.ready]);

  const container = document.createElement('div');
  container.id='df-summary-box';
  container.style.cssText=`
    padding:16px;background:radial-gradient(1200px 600px at 20% -10%,rgba(77,98,255,.08),transparent),#0e111d;color:#eaf0ff;border:1px solid #24283e;border-radius:16px;
    margin:18px auto;max-width:1160px;box-shadow:0 10px 30px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.02);
    font-family:'Segoe UI','Apple SD Gothic Neo','Malgun Gothic',sans-serif;
  `;

  const topBrand = document.createElement('div');
  topBrand.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;';
  const brandLeft = document.createElement('div');
  brandLeft.style.cssText='display:flex;align-items:center;gap:10px;';
  const guild = document.createElement('div');
  guild.textContent = moheomdan;
  guild.style.cssText="font-family:'DNFBitBitv2',sans-serif;font-size:34px;letter-spacing:.3px;color:#ffffff;text-shadow:0 1px 0 #1a1d33, 0 0 16px rgba(120,140,255,.14);line-height:1;";
  brandLeft.appendChild(guild);
  const brandRight = document.createElement('div');
  brandRight.style.cssText='display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;';
  function chip(t){ const d=document.createElement('div'); d.textContent=t; d.style.cssText='padding:6px 10px;border-radius:999px;background:linear-gradient(180deg,#161a2e,#12162a);border:1px solid #2a2f50;color:#cfe1ff;font-weight:700;font-size:11px;'; return d; }
  brandRight.appendChild(chip(`W${weekIndex}`));
  brandRight.appendChild(chip(`D+${dPlus}`));
  brandRight.appendChild(chip(`에픽 10 : ${tenEpicRate}`));
  brandRight.appendChild(chip(`심숭 1 : ${oneSimyeonRate}`));
  brandRight.appendChild(chip("떠닝의 중천 모아보기 v3"));
  topBrand.appendChild(brandLeft); topBrand.appendChild(brandRight);

  const mainGrid = document.createElement('div');
  mainGrid.style.cssText='display:grid;grid-template-columns:1fr .8fr;gap:14px;align-items:start;';

  const leftCol = document.createElement('div');
  const rightCol = document.createElement('div');

  const ASSET_BASE = 'https://ddunin605.github.io/DNF/weekdnf/';  // 너의 깃헙 Pages 주소 + 폴더

  const ASSET_VERSION = await (async () => {
    try {
      const r = await fetch(ASSET_BASE + 'version.txt?ts=' + Date.now(), { cache: 'no-store' });
      if (r.ok) return (await r.text()).trim();
    } catch (e) {}
    // 실패 시: "오늘 날짜"로라도 변경 → 최소 하루마다 새로고침
    return new Date().toISOString().slice(0,10);
  })();
  
   // 파일명 → 완성 URL
  const v = (f) => `${ASSET_BASE}${f}?v=${encodeURIComponent(ASSET_VERSION)}`; 
  
  const CUSTOM_ICON_FILES = {
    '레벨 상승치': 'week_ico01.png',
    '피로도 사용량': 'week_ico02.png',
    '115Lv 에픽': 'week_ico04.png',
    '심연 : 종말의 숭배자': 'week_ico18.png',
    '종말의 숭배자': 'week_ico18_1.png',
    '115Lv 태초': 'week_ico19.png',
    '베누스': 'week_ico20.png',
    '115Lv 레전더리': 'week_ico21.png',
    '나벨': 'week_ico22.png',
    '이내 황혼전': 'week_ico23.png',
  };

  const CUSTOM_ICONS = Object.fromEntries(
    Object.entries(CUSTOM_ICON_FILES).map(([k, fname]) => [k, v(fname)])
  );

  const ICON_BASE = "https://resource.df.nexon.com/ui/img/mypage/";
  const ICONS = {
    "레벨 상승치": "week_ico01.png",
    "피로도 사용량": "week_ico02.png",
    "115Lv 태초": "week_ico19.png",
    "115Lv 에픽": "week_ico04.png",
    "115Lv 레전더리": "week_ico21.png",
    "심연 : 종말의 숭배자": "week_ico18.png",
    "종말의 숭배자": "week_ico18.png",
    "나벨": "week_ico22.png",
    "베누스": "week_ico20.png",
    "이내 황혼전": "week_ico23.png"
  };

  const resolveIcon = (k) => {
    if (CUSTOM_ICONS[k]) return CUSTOM_ICONS[k];
    if (ICONS[k]) return ICON_BASE + ICONS[k];
    return ICON_BASE + 'week_ico04.png';
  };
  // --- 교체 끝 ---


  function stripeGrad(k){
    if (k==='레벨 상승치' || k==='피로도 사용량') return 'linear-gradient(180deg,#9bd1ff,#5fa8ff)';
    if (k==='115Lv 태초') return 'linear-gradient(180deg,#8be6c0,#6fb6ff)';
    if (k==='115Lv 에픽') return 'linear-gradient(180deg,#fff2a6,#ffd84d)';
    if (k==='115Lv 레전더리') return 'linear-gradient(180deg,#ffc28b,#ff8e3c)';
    if (k==='심연 : 종말의 숭배자') return 'linear-gradient(180deg,#b68cff,#3a59ff)';
    if (k==='종말의 숭배자') return 'linear-gradient(180deg,#b68cff,#8a5cff)';
    if (k==='나벨') return 'linear-gradient(180deg,#6fb6ff,#a58bff)';
    if (k==='베누스') return 'linear-gradient(180deg,#a58bff,#7c66d6)';
    if (k==='이내 황혼전') return 'linear-gradient(180deg,#ffffff,#0d1228)';
    return 'linear-gradient(180deg,#8be6c0,#93c5fd)';  }

  function makeCard(k){
    const wrap = document.createElement('div');
    wrap.style.cssText = `
      position:relative;
      background: linear-gradient(180deg,rgb(13, 32, 56) 0%,rgb(51, 70, 105) 100%);
      border:1px solid rgb(20, 20, 46);
      border-radius:14px;
      box-shadow:0 6px 18px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.02);
      display:flex; gap:10px; align-items:center; padding:10px;
    `;

    const stripe = document.createElement('div');
    stripe.style.cssText = `width:5px; align-self:stretch; border-radius:8px; background:${stripeGrad(k)};`;

    const iconBadge = document.createElement('div');
    iconBadge.style.cssText = `
      flex:0 0 52px; height:52px; border-radius:12px;
      background:rgba(0, 0, 0, 0.5);
      border:1px solid rgba(197,205,252,.6);
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 2px 10px rgba(0, 0, 0, 0), inset 0 0 10px rgba(0,0,0,.03);
      backdrop-filter: blur(2px) saturate(120%);
    `;
    const img = document.createElement('img');
    img.src = resolveIcon(k);
    img.alt = k;
    img.crossOrigin = 'anonymous';
    img.style.cssText = 'width:36px; height:36px; display:block;';
    iconBadge.appendChild(img);

    const body = document.createElement('div');
    body.style.cssText = 'display:flex; flex-direction:column; gap:3px; min-width:0;';

    const title = document.createElement('div');
    title.textContent = (k==='심연 : 종말의 숭배자') ? '심숭이' : k;
    title.style.cssText = "font-size:13px; letter-spacing:.2px; color:#ffffff; font-weight:400; font-family:'DNFBitBitv2',sans-serif;";

    const value = document.createElement('div');
    value.textContent = Number(summary[k] || 0).toLocaleString();
    value.style.cssText = 'font-size:20px; font-weight:800; letter-spacing:.2px; color:#ffffff;';

    wrap.appendChild(stripe);
    wrap.appendChild(iconBadge);
    wrap.appendChild(body);
    body.appendChild(title);
    body.appendChild(value);
    return wrap;  }


  const rows = [
    ['레벨 상승치','피로도 사용량'],
    ['종말의 숭배자','심연 : 종말의 숭배자'],
    ['115Lv 태초','115Lv 에픽','115Lv 레전더리'],
    ['베누스','나벨','이내 황혼전']
  ];
  rows.forEach((arr,idx)=>{
    const row = document.createElement('div');
    const cols = arr.length;
    row.style.cssText = `display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:10px;margin-bottom:${idx===rows.length-1?0:10}px;`;
    arr.forEach(k=>row.appendChild(makeCard(k)));
    leftCol.appendChild(row);
  });

  const calCard = document.createElement('div');
  calCard.style.cssText='background:linear-gradient(180deg,#121733,#0d1228);border:1px solid #2a2e46;border-radius:14px;padding:10px;box-shadow:0 6px 18px rgba(0,0,0,.35);';
  const calTitle = document.createElement('div');
  calTitle.textContent = '🗓️ 태초 캘린더';
  calTitle.style.cssText="margin:0 0 6px;font-size:15px;font-family:'DNFBitBitv2',sans-serif;padding-left:12px;color:#e9f1ff;";
  calCard.appendChild(calTitle);

  const byMonth = new Map();
  const sortedWeeks = weeks.sort((a,b)=>a.start-b.start).map((w,i)=>({ ...w, idx:i+1 }));
  sortedWeeks.forEach(w=>{ const m=w.start.getMonth()+1; if(!byMonth.has(m)) byMonth.set(m,[]); byMonth.get(m).push(w); });

  const monthGrid = document.createElement('div');
  monthGrid.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:8px;';
  function mmdd(d){ return `${d.getMonth()+1}/${d.getDate()}`; }

  for (let m=1; m<=12; m++){
    const box = document.createElement('section');
    box.style.cssText='background:#0c132c;border:1px solid #273055;border-radius:10px;padding:8px;';
    const titleM = document.createElement('div');
    titleM.textContent = `${m}월`;
    titleM.style.cssText="font-family:'DNFBitBitv2',sans-serif;font-weight:800;margin-bottom:6px;color:#cdd3ff;font-size:12px;";
    box.appendChild(titleM);
    const data = (byMonth.get(m) || []).sort((a,b)=>a.start-b.start);
    const maxCols = 5;
    const padded = Array.from({length:maxCols}, (_,i)=> data[i] || null);

    const header = document.createElement('div');
    header.style.cssText="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;font-size:10px;color:#8c93b3;margin-bottom:2px;font-family:'DNFBitBitv2',sans-serif;";
    padded.forEach(w=>{
      const cell = document.createElement('div');
      cell.textContent = w ? `${w.idx}` : '';
      cell.style.cssText='text-align:center;';
      header.appendChild(cell);
    });
    box.appendChild(header);

    const line = document.createElement('div');
    line.style.cssText='display:grid;grid-template-columns:repeat(5,1fr);gap:4px;margin-bottom:2px;';
    padded.forEach(w=>{
      const v = w?.taecho ?? null;
      const c = document.createElement('div');
      if (v===null) {
        c.textContent = '';
        c.title = '주 데이터 없음';
        c.style.cssText = `text-align:center;padding:6px 0;border-radius:7px;border:1px solid #384065;background: repeating-linear-gradient(45deg,#131833,#131833 6px,#1a2044 6px,#1a2044 12px);color:#8792c2;font-size:10px;`;
      } else if (v===0) {
        c.textContent = '0';
        c.title = `W${w.idx} ${mmdd(w.start)} · 태초 0개`;
        c.style.cssText = `text-align:center;padding:6px 0;border-radius:7px;border:1px solid #2a2e46;background:#161a2e;color:#0a0a0a;font-weight:700;font-size:10px;`;
      } else {
        c.textContent = String(v);
        c.title = `W${w.idx} ${mmdd(w.start)} · 태초 ${v}개`;
        c.style.cssText = `text-align:center;padding:6px 0;border-radius:7px;border:1px solid #b8c7ff;background:linear-gradient(135deg,#8be6c0,#6fb6ff);color:#000000;font-weight:700;box-shadow: inset 0 0 14px rgba(255,255,255,.12);font-size:10px;`;
      }
      line.appendChild(c);
    });
    box.appendChild(line);

    const dates = document.createElement('div');
    dates.style.cssText="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;font-size:9px;color:#7db0ff;font-family:'DNFBitBitv2',sans-serif;";
    padded.forEach(w=>{
      const d = document.createElement('div');
      d.textContent = w ? mmdd(w.start) : '';
      d.style.cssText='text-align:center;';
      dates.appendChild(d);
    });
    box.appendChild(dates);

    monthGrid.appendChild(box);
  }
  calCard.appendChild(monthGrid);

  rightCol.appendChild(calCard);

  const bottomInfoWrap = document.createElement('div');
  bottomInfoWrap.style.cssText='margin-top:12px;text-align:center;opacity:.95;';
  const bottomInfo = document.createElement('div');
  bottomInfo.textContent = `📅 2025.01.09 ~ ${fmtYMD(END_DATE).replace(/-/g,'.')} · ⏱️ ${nowStr}`;
  bottomInfo.style.cssText='font-size:12px;color:#98a6d8;';
  bottomInfoWrap.appendChild(bottomInfo);

  const creator = document.createElement('div');
  creator.style.cssText='display:flex;align-items:center;justify-content:center;gap:6px;margin-top:6px;';
  const iconUrl = 'https://ddunin605.github.io/DNF/ddunin.png' + `?v=${encodeURIComponent(ASSET_VERSION)}`;
  function mkIcon(){ const i=new Image(); i.src=iconUrl; i.crossOrigin = 'anonymous'; i.style.width='18px'; i.style.height='18px'; i.style.display='block'; return i; }
  const makerText = document.createElement('span');
  makerText.textContent = decodeURIComponent("AI%EB%96%A0%EB%8B%9D%20%EC%A0%9C%EC%9E%91");
  makerText.style.cssText="font-family:'DNFBitBitv2','Malgun Gothic',sans-serif;font-size:13px;font-weight:400;color:#dbe7ff;letter-spacing:.3px;";
  creator.appendChild(mkIcon()); creator.appendChild(makerText); creator.appendChild(mkIcon());
  bottomInfoWrap.appendChild(creator);

  const wideChart = document.createElement('div');
  wideChart.style.cssText = 'position:relative;background:linear-gradient(180deg,#121733,#0d1228);border:1px solid #2a2e46;border-radius:14px;padding:12px;margin:14px 0 10px;box-shadow:0 6px 18px rgba(0,0,0,.35);overflow:hidden;';
  const chartTitle = document.createElement('div');
  chartTitle.textContent = '📈 주간 태초 분포';
  chartTitle.style.cssText="margin:0 0 6px;font-size:15px;font-family:'DNFBitBitv2',sans-serif;padding-left:12px;color:#e9f1ff;";
  const chartCanvas = document.createElement('canvas');
  chartCanvas.style.cssText = 'display:block;width:100%;height:200px;';
  wideChart.appendChild(chartTitle);
  wideChart.appendChild(chartCanvas);

  container.appendChild(topBrand);
  container.appendChild(mainGrid);
  mainGrid.appendChild(leftCol);
  mainGrid.appendChild(rightCol);
  container.appendChild(wideChart);
  container.appendChild(bottomInfoWrap);
  document.body.prepend(container);

    // === html-to-image 로더 ===
  async function ensureHtmlToImage(){
    if (window.htmlToImage) return;
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  
  // === 공통 옵션 ===
  const captureOpts = {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: '#0e111d',
  };
  
  // === PNG 저장 ===
  async function saveSummaryAsPNG(){
    await ensureHtmlToImage();
    // 렌더 안정화
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  
    const node = container; // #df-summary-box
    const filename = `떠닝_중천_모아보기_${fmtYMD(NOW)}.png`;
    const dataUrl = await window.htmlToImage.toPng(node, captureOpts);
    const a = document.createElement('a');
    a.href = dataUrl; a.download = filename; a.click();
  }
  
  // === PNG를 클립보드로 복사 ===
  async function copySummaryToClipboard(){
    await ensureHtmlToImage();
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  
    const node = container;
    const blob = await window.htmlToImage.toBlob(node, captureOpts);
    if (!blob) throw new Error('이미지 생성 실패');
    if (!navigator.clipboard || !window.ClipboardItem) throw new Error('클립보드 API 미지원');
  
    const item = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
    // 선택: 사용자 피드백
    // alert('이미지가 클립보드에 복사되었어요!');
  }
  
  // === 툴바(박스 외부) 만들기 ===
  // container 위(밖)에 표시
  const toolbar = document.createElement('div');
  toolbar.id = 'df-save-toolbar';
  toolbar.style.cssText = `
    display:flex; gap:8px; justify-content:flex-end;
    max-width:1160px; margin:0 auto 10px; padding:0 4px;
  `;
  function mkBtn(label, onClick){
    const b = document.createElement('button');
    b.textContent = label;
    b.onclick = onClick;
    b.style.cssText = `
      padding:6px 10px;border-radius:999px;
      background:linear-gradient(180deg,#1b2142,#141a34);
      border:1px solid #2a2f50;color:#cfe1ff;
      font-weight:700;font-size:11px;cursor:pointer;
    `;
    return b;
  }
  toolbar.appendChild(mkBtn('PNG 저장', saveSummaryAsPNG));
  toolbar.appendChild(mkBtn('클립보드 복사', copySummaryToClipboard));
  
  // body 최상단에 container가 이미 들어갔으니, 그 "앞"에 툴바를 삽입
  document.body.insertBefore(toolbar, container);

    // 기존 툴바가 있으면 지우고(중복 방지)
  document.getElementById('df-save-toolbar')?.remove();
  
  // 박스(#df-summary-box) "바로 앞"에 붙이기 — 가장 확실
  container.before(toolbar);
  
  // (참고) 구형 브라우저면 아래도 OK
  // (container.parentNode || document.body).insertBefore(toolbar, container);
  
  const script=document.createElement('script');
  script.src='https://cdn.jsdelivr.net/npm/chart.js';
  script.onload = () => {
    const seq = weeks.sort((a,b)=>a.start-b.start).map((w,i)=>({ ...w, idx:i+1 }));
    const labels = seq.map((w)=> `W${w.idx}`);
    const data = seq.map(w => w.taecho || 0);
    function mountChart() {
      const ctx = wideChart.querySelector('canvas').getContext('2d');
      const rect = wideChart.getBoundingClientRect();
      const canvas = ctx.canvas;
      canvas.width  = Math.max(520, Math.floor(rect.width - 24));
      canvas.height = 200;
      return new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label:'', data, borderColor:'rgba(255,215,0,1)', backgroundColor:'rgba(255,215,0,.12)', tension:.3, pointRadius:1.8, borderWidth:2 }]},
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: { legend:{ display:false }, tooltip:{ intersect:false, mode:'index' } },
          scales: {
            x: { ticks:{ color:'#b9c0ff', maxRotation:0, autoSkip:true }, grid:{ color:'rgba(42,46,70,.55)'} },
            y: { ticks:{ color:'#b9c0ff' }, grid:{ color:'rgba(42,46,70,.55)'}, beginAtZero:true }
          }
        }
      });
    }
    let chart = mountChart();
    let resizeId;
    function onResize() {
      clearTimeout(resizeId);
      resizeId = setTimeout(() => {
        chart.destroy();
        chart = mountChart();
      }, 120);
    }
    window.addEventListener('resize', onResize, { passive: true });
  };
  document.head.appendChild(script);
})();









