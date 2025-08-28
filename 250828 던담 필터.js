(() => {
  // ==== CONFIG / HELPERS =====================================================
  const ROOT = document.querySelector('#search_result .sr-result');
  if (!ROOT) { alert('검색 결과(.sr-result)를 찾을 수 없어요! 페이지에서 검색 결과가 보이는지 확인해주세요.'); return; }

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const uniq = arr => Array.from(new Set(arr));
  const parseIntSafe = s => {
    const n = String(s||'').replace(/[^\d\-]/g,'');
    const v = parseInt(n,10);
    return isNaN(v) ? null : v;
  };

  // 카드 단위
  const CARD_SEL = '.scon';
  const cards = $$(CARD_SEL, ROOT);
  if (!cards.length) { alert('카드(.scon)가 보이지 않아요. 검색 결과가 있는지 확인해주세요.'); return; }

  // 버퍼 직업 키워드(직업 텍스트 안에 포함되면 버퍼로 간주)
  const BUFFER_RE = /(뮤즈|크루세이더|인챈트리스|패러메딕)/;

  // 카드에서 데이터 추출
  const readCard = (el) => {
    const job = $('.seh_job .sev', el)?.textContent?.trim() ?? '';
    const fame = parseIntSafe($('.seh_name .level .val', el)?.textContent) ?? -1;
    const name = $('.seh_name .name', el)?.textContent?.trim() ?? '';
    const role = BUFFER_RE.test(job) ? '버퍼' : '딜러';
    return { el, job, fame, name, role };
  };
  const rows = cards.map(readCard);

  // 직업 목록
  const jobs = uniq(rows.map(r => r.job).filter(Boolean)).sort((a,b)=>a.localeCompare(b,'ko'));

  // 표시 토글 가능한 블록 맵
  const blockMap = {
    '아바타': '.seh_abata',
    '서버'  : '.seh_sever',
    '직업'  : '.seh_job',
    '추가정보': '.seh_addinfo',
    '이름·명성': '.seh_name',
    '통계'  : '.seh_stat'
  };

  // ==== UI BUILD =============================================================
  const PANEL_ID = 'ddunin-filter-panel';
  if (document.getElementById(PANEL_ID)) document.getElementById(PANEL_ID).remove();

  const style = document.createElement('style');
  style.textContent = `
    #${PANEL_ID} {
      position: fixed; z-index: 999999; top: 16px; right: 16px;
      width: 320px; max-height: 80vh; overflow: auto;
      background: rgba(20,22,28,.95); color: #fff; font: 13px/1.4 system-ui, -apple-system, Segoe UI, Roboto, 'Apple SD Gothic Neo','Malgun Gothic', sans-serif;
      border: 1px solid rgba(255,255,255,.1); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.35);
    }
    #${PANEL_ID} .h { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border-bottom:1px solid rgba(255,255,255,.08); position: sticky; top:0; background:inherit; }
    #${PANEL_ID} .h .ttl { font-weight: 700; font-size: 14px; }
    #${PANEL_ID} .h .btn { cursor:pointer; padding:4px 8px; border-radius:8px; border:1px solid rgba(255,255,255,.15); background:transparent; color:#fff; }
    #${PANEL_ID} .sec { padding: 10px 12px; border-bottom:1px solid rgba(255,255,255,.06); }
    #${PANEL_ID} .sec:last-child { border-bottom:0; }
    #${PANEL_ID} label { display:block; margin:6px 0 2px; opacity:.9; }
    #${PANEL_ID} select, #${PANEL_ID} input[type="text"] {
      width:100%; box-sizing:border-box; padding:8px 10px; border-radius:8px; border:1px solid rgba(255,255,255,.18);
      background:#111723; color:#fff; outline:none;
    }
    #${PANEL_ID} .row { display:flex; gap:8px; flex-wrap: wrap; margin-top:6px; }
    #${PANEL_ID} .chip, #${PANEL_ID} .radio {
      display:inline-flex; align-items:center; gap:6px; padding:6px 8px; border-radius:8px; border:1px solid rgba(255,255,255,.18); cursor:pointer; user-select:none;
    }
    #${PANEL_ID} .chip input, #${PANEL_ID} .radio input { margin:0; }
    #${PANEL_ID} .btns { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
    #${PANEL_ID} .btn2 { padding:7px 10px; border-radius:8px; border:1px solid rgba(255,255,255,.18); background:#0f1724; color:#fff; cursor:pointer; }
    #${PANEL_ID} .btn2.primary { background:#1f2d4a; border-color:#2f4370; }
    #${PANEL_ID} .btn2.warn { background:#3a1f1f; border-color:#6a2d2d; }
    #${PANEL_ID} .small { font-size: 12px; opacity:.8; margin-top:6px; }
    #${PANEL_ID} .muted { opacity:.75; }

    /* 카드 컴팩트 모드 (섹션을 많이 숨기면 자동 적용) */
    .scon.ddunin-compact { padding: 8px 10px !important; }
    .scon.ddunin-compact .seh_abata .imgt img { max-height: 72px; }
    .scon.ddunin-compact .seh_addinfo, 
    .scon.ddunin-compact .seh_stat { margin-top: 4px !important; }
  `;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
    <div class="h">
      <div class="ttl">필터 보기</div>
      <div>
        <button class="btn" data-act="minimize">접기</button>
        <button class="btn" data-act="close">닫기</button>
      </div>
    </div>

    <div class="sec">
      <label>직업</label>
      <select id="fp-job">
        <option value="">(전체)</option>
        ${jobs.map(j => `<option value="${j}">${j}</option>`).join('')}
      </select>
    </div>

    <div class="sec">
      <label>역할</label>
      <div class="row" id="fp-role">
        <label class="radio"><input type="radio" name="role" value="" checked> 전체</label>
        <label class="radio"><input type="radio" name="role" value="버퍼"> 버퍼</label>
        <label class="radio"><input type="radio" name="role" value="딜러"> 딜러</label>
      </div>
      <div class="small muted">버퍼 키워드: 뮤즈, 크루세이더, 인챈트리스, 미스트리스, 팔라딘, 패러메딕, 키메라</div>
    </div>

    <div class="sec">
      <label>명성</label>
      <input id="fp-fameexpr" type="text" placeholder="예: >50000 <60000 또는 50000-60000">
      <div class="small">지원: <code>&gt;N</code>, <code>&gt;=N</code>, <code>&lt;N</code>, <code>&lt;=N</code>, <code>N-M</code>, 숫자 한 개(최소값)</div>
    </div>

    <div class="sec">
      <label>항목</label>
      <div class="row" id="fp-blocks">
        ${Object.keys(blockMap).map(k => `
          <label class="chip"><input type="checkbox" data-block="${k}" checked> ${k}</label>
        `).join('')}
      </div>
      <div class="small muted">숨김이 많으면 카드가 자동으로 ‘컴팩트’하게 줄어듭니다.</div>
    </div>

    <div class="sec">
      <label>정렬</label>
      <div class="btns">
        <button class="btn2" data-sort="fame:asc">명성↑</button>
        <button class="btn2" data-sort="fame:desc">명성↓</button>
        <button class="btn2" data-sort="job:asc">직업ㄱ~ㅎ</button>
        <button class="btn2" data-sort="job:desc">직업ㅎ~ㄱ</button>
        <button class="btn2" data-sort="name:asc">이름A~Z</button>
        <button class="btn2" data-sort="name:desc">이름Z~A</button>
        <button class="btn2" data-sort="dom">원래순서</button>
      </div>
    </div>

    <div class="sec">
      <div class="btns">
        <button class="btn2 primary" id="fp-apply">필터 적용</button>
        <button class="btn2 warn" id="fp-reset">리셋</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  // ==== STATE / PERSIST ======================================================
  const SS_KEY = 'ddunin_filter_panel_state_v2'; // ← v2로 bump
  const loadState = () => {
    try { return JSON.parse(sessionStorage.getItem(SS_KEY) || '{}'); } catch { return {}; }
  };
  const saveState = (st) => {
    sessionStorage.setItem(SS_KEY, JSON.stringify(st));
  };

  const state = Object.assign({
    job: '',
    role: '',
    fameExpr: '',
    blocks: Object.keys(blockMap).reduce((m,k)=> (m[k]=true,m), {}),
    sort: 'dom'
  }, loadState());

  // set UI from state
  $('#fp-job').value = state.job || '';
  $('#fp-fameexpr').value = state.fameExpr || '';
  // 역할 라디오
  const roleInput = $(`#fp-role input[name="role"][value="${state.role||''}"]`) || $(`#fp-role input[name="role"][value=""]`);
  if (roleInput) roleInput.checked = true;

  $$('#fp-blocks input').forEach(ch => {
    ch.checked = state.blocks[ch.dataset.block] !== false;
  });

  // original order memory
  const originalOrder = $$(CARD_SEL, ROOT);

  // ==== FILTER / SORT LOGIC ==================================================
  const parseFameExpr = (expr) => {
    expr = String(expr||'').trim();
    if (!expr) return {min:null, max:null, ops:[]};
    const ops = [];
    const parts = expr.split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      for (const p of parts) {
        const m = p.match(/^(>=|<=|>|<)\s*(\d+)$/);
        if (m) ops.push({op:m[1], val:+m[2]});
      }
    } else {
      const m2 = expr.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m2) return {min:+m2[1], max:+m2[2], ops:[]};
      const m3 = expr.match(/^(>=|<=|>|<)\s*(\d+)$/);
      if (m3) return {min:null, max:null, ops:[{op:m3[1], val:+m3[2]}]};
      const m4 = expr.match(/^(\d+)$/);
      if (m4) return {min:+m4[1], max:null, ops:[]};
    }
    return {min:null, max:null, ops};
  };

  const famePass = (fame, exprObj) => {
    const {min, max, ops} = exprObj;
    if (min!=null && fame < min) return false;
    if (max!=null && fame > max) return false;
    for (const {op,val} of ops) {
      if (op==='>' && !(fame>val)) return false;
      if (op==='>='&& !(fame>=val)) return false;
      if (op==='<' && !(fame<val)) return false;
      if (op==='<='&& !(fame<=val)) return false;
    }
    return true;
  };

  const applyBlockToggles = () => {
    // hide/show internal sections
    const want = state.blocks;
    for (const r of rows) {
      for (const [label, sel] of Object.entries(blockMap)) {
        const sec = $(sel, r.el);
        if (!sec) continue;
        sec.style.display = want[label] ? '' : 'none';
      }
    }
    // 컴팩트 모드 토글: 보이는 섹션 개수가 적으면 카드 축소
    const wantCount = Object.values(state.blocks).filter(Boolean).length;
    const compact = wantCount <= 3; // 3개 이하만 보이면 컴팩트
    for (const r of rows) {
      r.el.classList.toggle('ddunin-compact', compact);
      // 혹시 고정 높이가 있으면 제거
      r.el.style.minHeight = compact ? 'unset' : '';
    }
  };

  const filterRows = () => {
    const exprObj = parseFameExpr(state.fameExpr);
    for (const r of rows) {
      const byJob = !state.job || r.job === state.job;
      const byRole = !state.role || r.role === state.role;
      const byFame = famePass(r.fame, exprObj);
      r.el.style.display = (byJob && byRole && byFame) ? '' : 'none';
    }
  };

  const sortRows = () => {
    const vis = rows.filter(r => r.el.style.display !== 'none');
    let ordered = vis.slice();
    const [key, dir] = (state.sort || 'dom').split(':');
    if (key === 'dom') {
      ordered = originalOrder
        .filter(el => el.style.display !== 'none')
        .map(el => rows.find(r=>r.el===el));
    } else {
      const cmp = (a,b) => {
        let va, vb;
        if (key==='fame') { va=a.fame; vb=b.fame; }
        else if (key==='job') { va=a.job; vb=b.job; }
        else if (key==='name') { va=a.name; vb=b.name; }
        if (typeof va==='string' && typeof vb==='string') {
          const c = va.localeCompare(vb,'ko');
          return dir==='desc'? -c : c;
        } else {
          const c = (va||0) - (vb||0);
          return dir==='desc'? -c : c;
        }
      };
      ordered.sort(cmp);
    }
    for (const r of ordered) ROOT.appendChild(r.el);
  };

  const applyAll = () => {
    saveState(state);
    applyBlockToggles();
    filterRows();
    sortRows();
  };

  // initial apply
  applyAll();

  // ==== EVENTS ===============================================================
  panel.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;

    const act = t.dataset.act;
    if (act === 'close') {
      panel.remove();
      style.remove();
      return;
    }
    if (act === 'minimize') {
      const collapsed = panel.getAttribute('data-collapsed') === '1';
      const secs = panel.querySelectorAll('.sec');
      secs.forEach(s => s.style.display = collapsed ? '' : 'none');
      panel.setAttribute('data-collapsed', collapsed ? '0' : '1');
      t.textContent = collapsed ? '접기' : '펼치기';
      return;
    }

    if (t.matches('[data-sort]')) {
      state.sort = t.getAttribute('data-sort');
      applyAll();
    }
  });

  $('#fp-job').addEventListener('change', (e) => {
    state.job = e.target.value;
  });

  // 역할 라디오
  $$('#fp-role input[name="role"]').forEach(r => {
    r.addEventListener('change', (e) => {
      if (e.target.checked) state.role = e.target.value;
    });
  });

  $('#fp-fameexpr').addEventListener('input', (e) => {
    state.fameExpr = e.target.value;
  });

  $$('#fp-blocks input').forEach(ch => {
    ch.addEventListener('change', (e) => {
      state.blocks[e.target.dataset.block] = e.target.checked;
    });
  });

  $('#fp-apply').addEventListener('click', applyAll);

  $('#fp-reset').addEventListener('click', () => {
    state.job = '';
    state.role = '';
    state.fameExpr = '';
    state.blocks = Object.keys(blockMap).reduce((m,k)=> (m[k]=true,m), {});
    state.sort = 'dom';
    // reset UI
    $('#fp-job').value = '';
    const rAll = $(`#fp-role input[name="role"][value=""]`); if (rAll) rAll.checked = true;
    $('#fp-fameexpr').value = '';
    $$('#fp-blocks input').forEach(ch => ch.checked = true);
    applyAll();
  });

  // Small UX: Enter in fame expr -> apply
  $('#fp-fameexpr').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { applyAll(); }
  });

  console.log('%c[필터 보기] 패널이 활성화되었습니다. (역할 필터 & 컴팩트 모드)', 'color:#7dd3fc');
})();
