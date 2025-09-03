// === 던담 모험단 검색 결과 파서 (모험단명 무시하고 닉네임만 추출) ===

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
  // 모험단, 서버, 불필요한 태그 제거
  clone.querySelectorAll('.adventure, .introd, .badge, .tag').forEach(el => el.remove());
  return clone.textContent.replace(/\s+/g, '').trim();
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
    let name = getPureName(scon);

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

  // 출력 + 복사
  console.log(result);
  const ta = document.createElement('textarea');
  ta.value = result;
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    console.log('Data copied to clipboard');
  } catch (e) {
    console.error('Failed to copy:', e);
  } finally {
    document.body.removeChild(ta);
  }
})();
