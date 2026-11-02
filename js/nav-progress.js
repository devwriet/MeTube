import { loadData } from './data.js';

const HANDOFF_KEY = 'metube:nav-start';
let started = false;

export function startNavProgress() {
  if (started) return;
  started = true;

  const bar = document.createElement('div');
  bar.className = 'nav-progress nav-progress-no-transition';
  bar.setAttribute('aria-hidden', 'true');
  bar.style.setProperty('--nav-progress', '0');
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
    try {
      sessionStorage.setItem(HANDOFF_KEY, String(Date.now()));
    } catch {}
    show(0.3, 'nav-progress-fast');
    if (!reducedMotion.matches) {
      finishTimer = setTimeout(() => {
        bar.classList.remove('nav-progress-fast');
        bar.classList.add('nav-progress-creep');
        setProgress(0.9);
      }, 200);
    }
  };

  // Document clicks catch real page navigations while allowing page handlers to cancel first.
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

  // The header search form navigates through a normal same-origin submit.
  document.addEventListener('submit', (event) => {
    if (event.defaultPrevented) return;
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.target.toLowerCase() === '_blank' || form.method.toLowerCase() === 'dialog') return;
    try {
      if (new URL(form.action, location.href).origin === location.origin) markNavigationStart();
    } catch {}
  });

  // sessionStorage hands the loading state to the next full page.
  let handoffTime = null;
  try {
    handoffTime = Number(sessionStorage.getItem(HANDOFF_KEY));
    sessionStorage.removeItem(HANDOFF_KEY);
  } catch {}
  const handedOff = Number.isFinite(handoffTime) && handoffTime > 0 && Date.now() - handoffTime < 10_000;
  show(handedOff ? 0.6 : 0.15, 'nav-progress-no-transition');
  if (!reducedMotion.matches) {
    requestAnimationFrame(() => {
      bar.classList.remove('nav-progress-no-transition');
      bar.classList.add('nav-progress-creep');
      setProgress(0.9);
    });
  }

  // The shared cached data promise is the page-ready signal for every route.
  const dataReady = loadData().then(() => {}, () => {});
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

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) reset();
  });
}
