// Profile tabs: show one panel, hide the rest. Panels are matched by aria-controls.
const tabs = document.querySelectorAll('.tabs [role="tab"]');

function select(tab) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.classList.toggle('tab-active', on);
    t.setAttribute('aria-selected', on);
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
  });
}

tabs.forEach((t, i) => {
  t.addEventListener('click', () => select(t));
  t.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    const next = tabs[(i + step + tabs.length) % tabs.length];
    next.focus();
    select(next);
  });
});
