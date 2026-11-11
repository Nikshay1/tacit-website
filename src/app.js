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
  const referencePoint = 70;
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

// Keyboard-accessible industry tabs.
const tabs = $$('[data-industry]');
function showIndustry(index, focus = false) {
  tabs.forEach((tab, i) => {
    const active = i === index;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute('aria-controls'));
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });
  if (focus) { tabs[index].focus(); tabs[index].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' }); }
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => showIndustry(i));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); showIndustry(next, true); }
  });
});

// The reference's seven-step product story, with manual navigation.
const howSlides = [
  ['One shared understanding<br>of your data.', 'The trusted tables, metric definitions, join paths, and business rules your analyst uses—brought together in a versioned knowledge layer.'],
  ['Learn from the work<br>already happening.', 'Start with SQL history, saved questions, existing documentation, and the explanations your team gives every day.'],
  ['Your expert stays<br>the source of truth.', 'Tacit drafts definitions and answers. Your data person reviews and corrects them before they become trusted context.'],
  ['Every correction makes<br>the next answer better.', 'A fix becomes reusable knowledge, linked to the question and source that taught it. The same lesson should not need teaching twice.'],
  ['Answers where<br>your team already asks.', 'A Slack-first experience for business questions, with the SQL and source tables visible. Additional channels follow pilot needs.'],
  ['Your cloud.<br>Your control.', 'An own-cloud or dedicated India-region deployment is part of the pilot design, with read-only data access and a clear data flow.'],
  ['Prove value on<br>your real questions.', 'Agree on a baseline together, then measure answer accuracy and the share of repeat questions handled without the analyst.']
];
let currentSlide = 0;
function showSlide(index) {
  currentSlide = (index + howSlides.length) % howSlides.length;
  if (!$('#how-title')) return;
  $('#how-title').innerHTML = howSlides[currentSlide][0];
  $('#how-description').textContent = howSlides[currentSlide][1];
  $('#how-count').textContent = `${String(currentSlide + 1).padStart(2, '0')} / 07`;
  $$('[data-slide]').forEach((button, i) => {
    button.classList.toggle('active', i === currentSlide);
    button.setAttribute('aria-pressed', String(i === currentSlide));
  });
}
$$('[data-slide]').forEach(button => button.addEventListener('click', () => showSlide(Number(button.dataset.slide))));
$('[data-slide-prev]')?.addEventListener('click', () => showSlide(currentSlide - 1));
$('[data-slide-next]')?.addEventListener('click', () => showSlide(currentSlide + 1));

// Keep one context explanation open while leaving each native disclosure operable.
$$('.learning-detail').forEach(details => details.addEventListener('toggle', () => {
  if (!details.open) return;
  $$('.learning-detail').forEach(other => { if (other !== details) other.open = false; });
}));

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

let rotatingIndex = 0;
const rotatingWords = ['learns.', 'remembers.', 'answers.'];
const rotatingWord = $('#rotating-word');
setInterval(() => {
  if (!rotatingWord || motionPaused || document.hidden) return;
  rotatingWord.classList.add('exiting');
  setTimeout(() => {
    rotatingIndex = (rotatingIndex + 1) % rotatingWords.length;
    rotatingWord.textContent = rotatingWords[rotatingIndex];
    rotatingWord.classList.remove('exiting');
    rotatingWord.classList.add('entering');
    requestAnimationFrame(() => requestAnimationFrame(() => rotatingWord.classList.remove('entering')));
  }, 400);
}, 3600);
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
  const url = `mailto:nikshayyadav90@gmail.com?subject=${encodeURIComponent(`Tacit pilot enquiry — ${data.get('company')}`)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
  $('#form-status').textContent = 'Your email draft is ready in your email app. Please send it there to contact us. If it did not open, use the email link below.';
});
