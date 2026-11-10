import { loadData } from './data.js';

const HANDOFF_KEY = 'metube:nav-start';
let started = false;

export function startNavProgress() {
  if (started) return;
  started = true;

  // 로딩 바 하나 만듦 (기다리는 사람 위로용)
  const bar = document.createElement('div');
  bar.className = 'nav-progress nav-progress-no-transition';
  bar.setAttribute('aria-hidden', 'true');
  bar.style.setProperty('--nav-progress', '0');
  // 바 붙이고 출근 ㄱㄱ
  document.body.append(bar);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let finishTimer;

  const setProgress = (value) => bar.style.setProperty('--nav-progress', String(value));
  const show = (value, transition = 'nav-progress-creep') => {
    clearTimeout(finishTimer);
    bar.classList.remove('nav-progress-no-transition', 'nav-progress-fast', 'nav-progress-creep');
    bar.classList.add(transition);
    bar.classList.add('nav-progress-visible');
    setProgress(reducedMotion.matches ? 1 : value);
  };
  const reset = () => {
    clearTimeout(finishTimer);
    bar.classList.remove('nav-progress-fast', 'nav-progress-creep');
    bar.classList.add('nav-progress-no-transition');
    bar.classList.remove('nav-progress-visible', 'nav-progress-fade');
    setProgress(0);
  };
  const markNavigationStart = () => {
    // 시크릿 모드에선 여기서 throw함 (바는 뜨고 handoff만 날아감)
    try {
      sessionStorage.setItem(HANDOFF_KEY, String(Date.now()));
    } catch { }
    show(0.3, 'nav-progress-fast');
    if (!reducedMotion.matches) {
      finishTimer = setTimeout(() => {
        bar.classList.remove('nav-progress-fast');
        bar.classList.add('nav-progress-creep');
        setProgress(0.9);
      }, 200);
    }
  };

  // 페이지 핸들러가 먼저 취소할 수 있게 defaultPrevented부터 봄
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.target.toLowerCase() === '_blank' || link.hasAttribute('download')) return;
    let destination;
    try {
      destination = new URL(link.href, location.href);
    } catch {
      return;
    }
    if (destination.origin !== location.origin) return;
    if (destination.pathname === location.pathname && destination.search === location.search && destination.hash) return;
    markNavigationStart();
  });

  // 검색 폼도 같은 origin submit으로 이동함, 여기서 잡음
  document.addEventListener('submit', (event) => {
    if (event.defaultPrevented) return;
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.target.toLowerCase() === '_blank' || form.method.toLowerCase() === 'dialog') return;
    try {
      if (new URL(form.action, location.href).origin === location.origin) markNavigationStart();
    } catch { }
  });

  // sessionStorage로 로딩 상태를 다음 풀 페이지에 넘김 (바통 터치 ㅇㅇ)
  let handoffTime = null;
  try {
    handoffTime = Number(sessionStorage.getItem(HANDOFF_KEY));
    sessionStorage.removeItem(HANDOFF_KEY);
  } catch { }
  // 10초 넘은 handoff는 늙크크 거라 무시
  // (옛날 이동 때문에 바가 60%로 시작하면 안 됨)
  const handedOff = Number.isFinite(handoffTime) && handoffTime > 0 && Date.now() - handoffTime < 10_000;
  show(handedOff ? 0.6 : 0.15, 'nav-progress-no-transition');
  if (!reducedMotion.matches) {
    requestAnimationFrame(() => {
      bar.classList.remove('nav-progress-no-transition');
      bar.classList.add('nav-progress-creep');
      setProgress(0.9);
    });
  }

  // loadData promise가 모든 라우트 공통 준비 신호
  const dataReady = loadData().then(() => { }, () => { });
  const documentReady = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
  Promise.all([dataReady, documentReady]).then(() => {
    if (reducedMotion.matches) {
      reset();
      return;
    }
    show(1, 'nav-progress-fast');
    finishTimer = setTimeout(() => {
      bar.classList.remove('nav-progress-fast');
      bar.classList.add('nav-progress-fade');
      bar.classList.remove('nav-progress-visible');
      finishTimer = setTimeout(reset, 300);
    }, 200);
  });

  // bfcache가 바 반쯤 간 채로 복원함 -> pageshow에서 reset
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) reset();
  });
}
