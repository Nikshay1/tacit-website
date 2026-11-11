const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = reducedMotion.matches;
try { motionPaused = motionPaused || localStorage.getItem('tacit-motion') === 'paused'; } catch {}
const header = $('.site-header');
const scrim = $('.nav-scrim');
const announcement = $('#announce');
const triggers = $$('.nav-trigger');
const menuToggle = $('.menu-toggle');
const mobileMenu = $('#mobile-nav');

function closeMenus(restoreFocus = false) {
  let focused;
  for (const trigger of triggers) {
    if (trigger.getAttribute('aria-expanded') === 'true') focused = trigger;
    trigger.setAttribute('aria-expanded', 'false');
    document.getElementById(trigger.getAttribute('aria-controls')).hidden = true;
  }
  if (menuToggle.getAttribute('aria-expanded') === 'true') focused = menuToggle;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  mobileMenu.hidden = true;
  header.classList.remove('menu-open');
  scrim.hidden = true;
  document.body.style.overflow = '';
  if (restoreFocus) focused?.focus();
}
triggers.forEach(trigger => trigger.addEventListener('click', () => {
  const open = trigger.getAttribute('aria-expanded') === 'true';
  closeMenus();
  if (open) return;
  trigger.setAttribute('aria-expanded', 'true');
  document.getElementById(trigger.getAttribute('aria-controls')).hidden = false;
  scrim.hidden = false;
}));
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  closeMenus();
  if (open) return;
  mobileMenu.hidden = false;
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Close menu');
  header.classList.add('menu-open');
  scrim.hidden = false;
  document.body.style.overflow = 'hidden';
});
scrim.addEventListener('click', () => closeMenus());
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenus(true);
});
document.addEventListener('click', event => {
  if (!scrim.hidden && !header.contains(event.target)) closeMenus();
});
$$('a', header).forEach(a => a.addEventListener('click', () => closeMenus()));
header.addEventListener('focusout', () => {
  setTimeout(() => { if (!header.contains(document.activeElement)) closeMenus(); }, 0);
});
$('#dismiss-announcement').addEventListener('click', () => {
  announcement.hidden = true;
  document.documentElement.style.setProperty('--announce', '0px');
  updateHeader();
});
function updateHeader() {
  const announceHeight = announcement.hidden ? 0 : announcement.offsetHeight;
  document.documentElement.style.setProperty('--nav-offset', `${Math.max(0, announceHeight - scrollY)}px`);
  const navRect = $('.nav-bar').getBoundingClientRect();
  const referencePoint = navRect.top + navRect.height / 2;
  const darkSection = $$('.dark').some(section => {
    const r = section.getBoundingClientRect();
    return r.top <= referencePoint && r.bottom > referencePoint;
  });
  header.classList.toggle('on-dark', darkSection);
}
let scrollQueued = false;
addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => { updateHeader(); updateStatement(); scrollQueued = false; });
}, { passive: true });
addEventListener('resize', () => { closeMenus(); updateHeader(); updateStatement(); });
updateHeader();

// Scroll-fill statement and subtle section reveals.
const statement = $('[data-fill]');
if (statement) {
  const text = statement.textContent;
  statement.setAttribute('aria-label', text);
  statement.innerHTML = text.split(/\s+/).map(word => `<span class="statement-word" aria-hidden="true">${word}</span>`).join(' ');
}
function updateStatement() {
  if (!statement || motionPaused) return;
  const r = statement.getBoundingClientRect();
  const fraction = Math.min(1, Math.max(0, (innerHeight * .83 - r.top) / (innerHeight * .48)));
  const words = $$('.statement-word', statement);
  words.forEach((word, index) => word.classList.toggle('filled', index / words.length <= fraction));
}
if (!motionPaused && 'IntersectionObserver' in window) {
  document.body.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .1 });
  $$('[data-reveal]').forEach(el => observer.observe(el));
}
updateStatement();

const videos = $$('video');
function applyMotionPreference() {
  document.body.classList.toggle('motion-paused', motionPaused);
  $('.motion-toggle').textContent = motionPaused ? 'Resume motion' : 'Pause motion';
  $('.motion-toggle').setAttribute('aria-pressed', String(motionPaused));
  videos.forEach(video => { if (motionPaused) video.pause(); else video.play().catch(() => {}); });
  const videoButton = $('.video-toggle');
  if (videoButton) {
    videoButton.setAttribute('aria-label', motionPaused ? 'Resume background video' : 'Pause background video');
    videoButton.setAttribute('aria-pressed', String(motionPaused));
    videoButton.firstElementChild.textContent = motionPaused ? '▷' : 'Ⅱ';
  }
  if (motionPaused) $$('[data-reveal]').forEach(el => el.classList.add('visible'));
  window.dispatchEvent(new CustomEvent('tacit:motionchange', { detail: { paused: motionPaused } }));
}
function toggleMotion() {
  motionPaused = !motionPaused;
  try { localStorage.setItem('tacit-motion', motionPaused ? 'paused' : 'playing'); } catch {}
  applyMotionPreference();
}
$('.motion-toggle').addEventListener('click', toggleMotion);
$('.video-toggle')?.addEventListener('click', toggleMotion);
reducedMotion.addEventListener('change', event => { motionPaused = event.matches; applyMotionPreference(); });
applyMotionPreference();

// No fake submission: compose an email with the visitor's validated details.
$('#pilot-form')?.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const body = `Hi Tacit team,\n\nI’d like to discuss an eight-week pilot.\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nCompany: ${data.get('company')}\nData stack: ${data.get('stack')}\n\nWhat we’d like help with:\n${data.get('message')}\n`;
  const url = `mailto:nikshayyadav90@gmail.com,akshitarora.iitd.ep@gmail.com?subject=${encodeURIComponent(`Tacit pilot enquiry — ${data.get('company')}`)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
  $('#form-status').textContent = 'Your email draft is ready in your email app. Please send it there to contact us. If it did not open, use the email link below.';
});
