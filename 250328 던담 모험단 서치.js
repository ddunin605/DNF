// === 던담 모험단 검색 결과 파서 (모험단명 무시 + 작은 이동식 팝업) ===

// 날짜와 시간을 YYMMDD HH:mm 형식으로 포맷
function getFormattedDate() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const HH = String(d.getHours()).padStart(2, '0');
  const MM = String(d.getMinutes()).padStart(2, '0');
  return `${yy}${mm}${dd} ${HH}:${MM}`;
}

// 숫자 단위 포맷팅 (딜러용)
function formatText(value) {
  value = String(value || '').replace(/,/g, '').trim();
  if (!value) return '0';
  if (value.includes('억')) {
    const parts = value.split('억');
    const eok = parseFloat(parts[0].trim()) || 0;
    const remainder = parts[1] ? parseFloat(parts[1].replace('만', '').trim()) || 0 : 0;
    return ((eok * 10000 + remainder) / 10000).toFixed(2);
  } else if (value.includes('만')) {
    const man = parseFloat(value.replace('만', '').trim()) || 0;
    return (man / 10000).toFixed(2);
  } else {
    const n = parseFloat(value) || 0;
    return (n / 100000000).toFixed(2);
  }
}

// 버프력 포맷팅 (버퍼용)
function formatBuffValue(value) {
  const num = parseInt(String(value || '').replace(/,/g, ''), 10) || 0;
  return (num / 10000).toFixed(1);
}

// 닉네임만 추출 (모험단/서버 span 제거)
function getPureName(scon) {
  const nameEl = scon.querySelector('.seh_name .name');
  if (!nameEl) return '';
  const clone = nameEl.cloneNode(true);
  clone.querySelectorAll('.adventure, .introd, .badge, .tag').forEach(el => el.remove());
  return clone.textContent.replace(/\s+/g, '').trim();
}

// 떠다니는 작은 팝업 (드래그 가능)
function showFloatingPopup(text, alreadyCopied=false) {
  // 기존 패널 제거
  const OLD = document.getElementById('ddunin-float');
  if (OLD) OLD.remove();

  const box = document.createElement('div');
  box.id = 'ddunin-float';
  Object.assign(box.style, {
    position: 'fixed',
    right: '24px',
    bottom: '24px',
    width: 'min(350px, 92vw)',
    maxWidth: '92vw',
    height: 'min(360px, 70vh)',
    maxHeight: '70vh',
    background: '#0e1117',
    color: '#e6edf3',
    border: '1px solid #30363d',
    borderRadius: '12px',
    boxShadow: '0 10px 28px rgba(0,0,0,.45)',
    zIndex: '2147483647',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,'Apple SD Gothic Neo','Malgun Gothic',sans-serif",
  });

  // saved position
  try {
    const saved = JSON.parse(localStorage.getItem('ddunin-float-pos') || 'null');
    if (saved && typeof saved.x==='number' && typeof saved.y==='number') {
      Object.assign(box.style, { left: saved.x+'px', top: saved.y+'px', right: 'auto', bottom: 'auto' });
    }
  } catch {}

  const header = document.createElement('div');
  header.textContent = '복사 미리보기';
  Object.assign(header.style, {
    cursor: 'move',
    userSelect: 'none',
    padding: '8px 12px',
    fontWeight: '700',
    fontSize: '13px',
    background: '#11161d',
    borderBottom: '1px solid #30363d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px'
  });

  const right = document.createElement('div');
  Object.assign(right.style, { display: 'flex', alignItems: 'center', gap: '6px' });

  const status = document.createElement('span');
  status.textContent = alreadyCopied ? '✅ 자동 복사됨' : '📋 복사 가능';
  Object.assign(status.style, { fontSize: '11px', opacity: '.85' });

  const minBtn = document.createElement('button');
  minBtn.textContent = '—';
  Object.assign(minBtn.style, {
    width: '28px', height: '24px', lineHeight: '22px',
    borderRadius: '8px', border: '1px solid #3d444d',
    background: '#161b22', color: '#e6edf3', cursor: 'pointer'
  });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  Object.assign(closeBtn.style, {
    width: '28px', height: '24px', lineHeight: '22px',
    borderRadius: '8px', border: '1px solid #3d444d',
    background: '#161b22', color: '#e6edf3', cursor: 'pointer'
  });

  right.appendChild(status);
  right.appendChild(minBtn);
  right.appendChild(closeBtn);
  header.appendChild(right);

  const main = document.createElement('div');
  Object.assign(main.style, { padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 auto' });

  const ta = document.createElement('textarea');
  ta.value = text;
  ta.readOnly = true;
  Object.assign(ta.style, {
    width: '100%',
    height: '220px',
    flex: '1 1 auto',
    resize: 'vertical',
    minHeight: '120px',
    boxSizing: 'border-box',
    background: '#0b0f14',
    color: '#e6edf3',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '10px',
    fontFamily: 'ui-monospace,Menlo,Consolas,monospace',
    fontSize: '12px',
    lineHeight: '1.45',
    outline: 'none'
  });

  const footer = document.createElement('div');
  Object.assign(footer.style, {
    display: 'flex', gap: '6px', padding: '8px', borderTop: '1px solid #30363d', justifyContent: 'flex-end'
  });

  const selectBtn = document.createElement('button');
  selectBtn.textContent = '전체 선택';
  Object.assign(selectBtn.style, {
    padding: '8px 12px', borderRadius: '8px',
    border: '1px solid #3d444d', background: '#161b22', color: '#e6edf3', cursor: 'pointer'
  });
  selectBtn.onclick = () => { ta.focus(); ta.select(); };

  const copyBtn = document.createElement('button');
  copyBtn.textContent = '복사';
  Object.assign(copyBtn.style, {
    padding: '8px 12px', borderRadius: '8px',
    border: '1px solid #1f6feb', background: '#1f6feb', color: '#fff', fontWeight: '700', cursor: 'pointer'
  });
  copyBtn.onclick = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else { ta.focus(); ta.select(); document.execCommand('copy'); }
      status.textContent = '✅ 복사 완료!';
    } catch(e) {
      status.textContent = '⚠️ 복사 실패… (Ctrl+C)';
      console.error(e);
    }
  };

  footer.appendChild(selectBtn);
  footer.appendChild(copyBtn);

  // 최소화 토글
  let minimized = false;
  function setMin(v) {
    minimized = v;
    if (v) {
      main.style.display = 'none';
      footer.style.display = 'none';
      box.style.height = 'auto';
    } else {
      main.style.display = 'flex';
      footer.style.display = 'flex';
      box.style.height = 'min(360px, 70vh)';
    }
  }
  header.ondblclick = () => setMin(!minimized);
  minBtn.onclick = () => setMin(!minimized);
  closeBtn.onclick = () => box.remove();

  // 드래그 이동
  (function makeDraggable(handle, target) {
    let sx=0, sy=0, ox=0, oy=0, dragging=false;

    function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
    function start(ev){
      // 텍스트 드래그/더블클릭 방지
      ev.preventDefault();
      dragging = true;
      const rect = target.getBoundingClientRect();
      ox = rect.left; oy = rect.top;
      const p = (ev.touches ? ev.touches[0] : ev);
      sx = p.clientX; sy = p.clientY;
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', end);
      window.addEventListener('touchmove', move, {passive:false});
      window.addEventListener('touchend', end);
    }
    function move(ev){
      if (!dragging) return;
      const p = (ev.touches ? ev.touches[0] : ev);
      if (!p) return;
      ev.preventDefault();
      const nx = ox + (p.clientX - sx);
      const ny = oy + (p.clientY - sy);
      const vw = window.innerWidth, vh = window.innerHeight;
      const w = target.offsetWidth, h = target.offsetHeight;
      const clampedX = clamp(nx, 4 - w*0.2, vw - 4); // 살짝 벗어나도 OK
      const clampedY = clamp(ny, 4, vh - 4);
      Object.assign(target.style, { left: clampedX+'px', top: clampedY+'px', right: 'auto', bottom: 'auto' });
    }
    function end(){
      if (!dragging) return;
      dragging = false;
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
      // 저장
      try {
        const rect = target.getBoundingClientRect();
        localStorage.setItem('ddunin-float-pos', JSON.stringify({x: rect.left, y: rect.top}));
      } catch {}
    }
    handle.addEventListener('mousedown', start);
    handle.addEventListener('touchstart', start, {passive:false});
  })(header, box);

  box.appendChild(header);
  box.appendChild(main);
  main.appendChild(ta);
  box.appendChild(footer);
  document.body.appendChild(box);
}

// 메인 실행
(function run() {
  const cards = document.querySelectorAll('.scon');
  if (!cards.length) {
    alert('검색 결과 카드(.scon)를 찾지 못했어요.');
    return;
  }

  const dealers = [];
  const buffers = [];

  cards.forEach((scon) => {
    const name = getPureName(scon);
    const jobElement = scon.querySelector('.seh_job .sev');
    const job = jobElement ? jobElement.textContent.replace('眞 ', '').trim() : '직업 없음';
    const dealElement = scon.querySelector('.stat_a .val');
    const buffElement = scon.querySelector('.stat_b .val');
    const specialBuffElement = scon.querySelector('.stat_b > li:nth-child(3) > div > span.val');

    let value = '';
    if (dealElement) {
      value = formatText(dealElement.textContent.trim());
      dealers.push({ name, job, value });
    } else if (job.includes('인챈트리스') && specialBuffElement) {
      value = formatBuffValue(specialBuffElement.textContent.trim());
      buffers.push({ name, job, value });
    } else if (buffElement) {
      value = formatBuffValue(buffElement.textContent.trim());
      buffers.push({ name, job, value });
    } else {
      value = '0';
      dealers.push({ name, job, value });
    }
  });

  // 내림차순 정렬
  dealers.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
  buffers.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

  // 결과 문자열
  const dealerResult = dealers.map(c => `${c.name} ${Math.round(parseFloat(c.value) || 0)}`).join('\n');
  const bufferResult = buffers.map(c => `${c.name} ${Math.round(parseFloat(c.value) || 0)}`).join('\n');

  const dateTime = getFormattedDate();
  const result = `${dateTime}\n${dealerResult}\n\n${bufferResult}`;

  // 콘솔 출력
  console.log(result);

  // 자동 복사 시도
  let autoCopied = false;
  try {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(result).then(()=>{}).catch(()=>{});
      autoCopied = true;
    } else {
      const ta = document.createElement('textarea');
      ta.value = result;
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      autoCopied = true;
    }
  } catch { autoCopied = false; }

  // 작은 이동식 팝업 표시
  showFloatingPopup(result, autoCopied);
})();
