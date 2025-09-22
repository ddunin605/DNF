/*
 * ddunin Toolbar Loader (for 던담 검색 결과 페이지)
 * -------------------------------------------------
 * - Places a toolbar right above `.sr-result` with buttons:
 *   [모험단서치] [이내전용] [던담필터] [8칸그리드]
 * - Loads each feature script from configurable RAW URLs below.
 * - Safe, compact, and resilient to copy/paste issues vs huge bookmarklets.
 *
 * How to use:
 * 1) Fill in RAW_URLs below (GitHub raw, or any publicly reachable JS URLs).
 * 2) Inject this file via the browser console, a userscript manager, or <script src="...">.
 *
 * Notes:
 * - This script doesn't assume any globals from the feature files; it simply evals them.
 * - "8칸그리드" is a local toggle and doesn't need external files.
 */

(function dduninToolbarLoader() {
  "use strict";

  /* =====================[ CONFIG ]===================== */
  const RAW_URL_CLAN   = "https://raw.githubusercontent.com/ddunin605/DNF/main/250328%20%EB%8D%98%EB%8B%B4%20%EB%AA%A8%ED%97%98%EB%8B%A8%20%EC%84%9C%EC%B9%98.js";  
  const RAW_URL_INNAE  = "https://raw.githubusercontent.com/ddunin605/DNF/0af4055395facf5e4791294e06d0d54bf5f079f9/250826%20%EC%9D%B4%EB%82%B4%EC%A0%84%EC%9A%A9%EB%8D%98%EB%8B%B4.js";  
  const RAW_URL_FILTER = "https://raw.githubusercontent.com/ddunin605/DNF/main/250828%20%EB%8D%98%EB%8B%B4%20%ED%95%84%ED%84%B0.js";

  /* ===============[ tiny util helpers ]================ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function ensureRoot() {
    const root = $("#search_result .sr-result");
    if (!root) throw new Error("검색 결과(.sr-result)를 찾지 못했습니다. 페이지에서 검색 결과가 보이는지 확인하세요.");
    return root;
  }

  /* ==================[ toolbar mount ]================= */
  function mountToolbar(root) {
    const mountTarget = $('#search_result .container') || root.parentElement;
    const BAR_ID = "ddunin-toolbar";
    const exist = document.getElementById(BAR_ID);
    if (exist) exist.remove();

    const bar = document.createElement("div");
    bar.id = BAR_ID;
    bar.style.cssText = [
      "margin:8px auto 14px",
      "max-width:2000px",
      "display:flex",
      "flex-wrap:wrap",
      "gap:8px",
      "align-items:center",
      "justify-content:flex-start",
      "padding:10px 12px",
      "border-radius:12px",
      "background:rgba(20,22,28,.92)",
      "color:#e6edf3",
      "border:1px solid rgba(255,255,255,.08)",
      "box-shadow:0 8px 22px rgba(0,0,0,.35)",
      "font:13px/1.4 system-ui,-apple-system,Segoe UI,Roboto,'Apple SD Gothic Neo','Malgun Gothic',sans-serif"
    ].join(";");

    const title = document.createElement("div");
    title.textContent = "떠닝 도구모음";
    title.style.cssText = "font-weight:800;margin-right:8px;opacity:.9";
    bar.appendChild(title);

    function mkBtn(label, act) {
      const b = document.createElement("button");
      b.textContent = label;
      b.dataset.act = act;
      b.style.cssText = [
        "cursor:pointer",
        "padding:8px 12px",
        "border-radius:10px",
        "border:1px solid rgba(255,255,255,.18)",
        "background:#0f1724",
        "color:#fff",
        "transition:background .15s ease"
      ].join(";");
      b.addEventListener("mouseenter", () => (b.style.background = "#182440"));
      b.addEventListener("mouseleave", () => (b.style.background = "#0f1724"));
      return b;
    }

    const btns = [
      ["모험단서치", "clan"],
      ["이내전용", "innae"],
      ["던담필터", "filter"],
      ["8칸그리드", "grid"]
    ];

    for (const [label, act] of btns) {
      bar.appendChild(mkBtn(label, act));
    }

    mountTarget.insertBefore(bar, root);
    return bar;
  }

  /* ==================[ 8-col grid ]==================== */
  function toggleGrid() {
    const ID = "dd-8col-style";
    let s = document.getElementById(ID);
    if (!s) {
      s = document.createElement("style");
      s.id = ID;
      s.appendChild(document.createTextNode([
        "#search_result .container,#search_result .sr-result{max-width:2000px!important;width:2000px!important;margin:0 auto!important}",
        "#search_result .sr-result{display:grid!important;grid-template-columns:repeat(8,1fr)!important;gap:12px!important}",
        "#search_result .sr-result>.scon{width:auto!important;margin:0!important}"
      ].join("")));
      document.head.appendChild(s);
      alert("8칸 고정 ON");
    } else {
      s.remove();
      alert("스타일 OFF");
    }
  }

  /* ===================[ loader ]======================= */
  function loadAndRun(url) {
    if (!url) {
      alert("URL이 설정되지 않았어요. 설정에서 RAW_URL 을 채워주세요.");
      return;
    }
    fetch(url, { cache: "no-store" })
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then(code => {
        // Eval in indirect mode to avoid local scope capture
        (0, eval)(code);
      })
      .catch(err => {
        console.error("[ddunin loader] load error:", err);
        alert("로드 실패: " + err);
      });
  }

  /* ===================[ bootstrap ]==================== */
  try {
    const root = ensureRoot();
    const bar = mountToolbar(root);

    bar.addEventListener("click", (e) => {
      const t = e.target.closest("button[data-act]");
      if (!t) return;
      const act = t.dataset.act;
      if (act === "grid") return void toggleGrid();
      if (act === "clan") return void loadAndRun(RAW_URL_CLAN);
      if (act === "innae") return void loadAndRun(RAW_URL_INNAE);
      if (act === "filter") return void loadAndRun(RAW_URL_FILTER);
    });

    // Expose minimal API for debugging
    window.dduninToolbar = {
      version: "1.0.0",
      toggleGrid,
      loadClan:   () => loadAndRun(RAW_URL_CLAN),
      loadInnae:  () => loadAndRun(RAW_URL_INNAE),
      loadFilter: () => loadAndRun(RAW_URL_FILTER)
    };

    console.log("%c[dduninToolbar] ready", "color:#4aa8ff");
  } catch (e) {
    console.error(e);
    alert("초기화 오류: " + e.message);
  }
})();