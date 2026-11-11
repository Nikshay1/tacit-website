const one = (selector, root = document) => root.querySelector(selector);
const all = (selector, root = document) => [...root.querySelectorAll(selector)];
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const motionStopped = () => motionPreference.matches || document.body.classList.contains('motion-paused');
const sequences = [];

// One small clock per visible sequence. No clock runs while it is off screen,
// hidden, paused, hovered, or being used with the keyboard.
function sequence({ root, count, period, render, progress = () => {}, frame = () => {}, hold = root, observe = root }) {
  let current = 0;
  let elapsed = 0;
  let last = 0;
  let timer;
  let visible = false;
  let hovered = false;
  let focused = false;
  let paused = false;
  const pauseButton = one('[data-sequence-toggle]', root);
  const pauseNoun = pauseButton?.textContent.replace(/^Pause /, '') || 'animation';
  const blocked = () => !visible || hovered || focused || paused || document.hidden || motionStopped();
  const draw = () => {
    const frozen = motionStopped();
    progress(current, frozen ? 1 : Math.min(elapsed / period, 1));
    frame(current, frozen ? period : elapsed);
    if (pauseButton) {
      pauseButton.disabled = frozen;
      pauseButton.textContent = frozen ? 'Motion paused' : `${paused ? 'Resume' : 'Pause'} ${pauseNoun}`;
      pauseButton.setAttribute('aria-pressed', String(paused || frozen));
    }
  };
  const stop = () => { clearTimeout(timer); timer = undefined; };
  const tick = () => {
    timer = undefined;
    if (blocked()) { draw(); return; }
    const now = performance.now();
    elapsed += Math.min(Math.max(now - last, 0), 160);
    last = now;
    if (elapsed >= period) {
      current = (current + 1) % count;
      elapsed = 0;
      render(current, false);
    }
    draw();
    timer = setTimeout(tick, 40);
  };
  const resume = () => {
    stop();
    draw();
    if (!blocked()) { last = performance.now(); timer = setTimeout(tick, 40); }
  };
  const select = (index, user = true) => {
    current = (index + count) % count;
    elapsed = 0;
    render(current, user);
    resume();
  };
  const api = { select, refresh: resume, get current() { return current; } };
  const pointerEnter = event => { if (event.pointerType !== 'touch') { hovered = true; resume(); } };
  hold.addEventListener('pointerenter', pointerEnter);
  hold.addEventListener('pointerleave', () => { hovered = false; resume(); });
  hold.addEventListener('focusin', () => { focused = true; resume(); });
  hold.addEventListener('focusout', event => { if (!hold.contains(event.relatedTarget)) { focused = false; resume(); } });
  pauseButton?.addEventListener('click', () => { paused = !paused; resume(); });
  document.addEventListener('visibilitychange', resume);
  new IntersectionObserver(([entry]) => {
    const entered = entry.isIntersecting && !visible;
    visible = entry.isIntersecting;
    if (entered) elapsed = 0;
    root.classList.toggle('sequence-visible', visible);
    resume();
  }, { threshold: .18 }).observe(observe);
  render(current, false);
  draw();
  sequences.push(api);
  return api;
}

function arrowKeys(items, select) {
  items.forEach((item, index) => item.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % items.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    select(next);
    items[next].focus({ preventScroll: true });
  }));
}

const industryRoot = one('[data-sequence="industries"]');
if (industryRoot) {
  const tabs = all('[data-industry]', industryRoot);
  const panels = all('.industry-panel', industryRoot);
  const track = one('.industry-track', industryRoot);
  const list = one('.industry-tabs', industryRoot);
  let selected = 0;
  const place = () => { track.style.transform = `translate3d(${-panels[selected].offsetLeft}px,0,0)`; };
  const revealTab = index => {
    const tab = tabs[index];
    const left = tab.offsetLeft - list.offsetLeft;
    const right = left + tab.offsetWidth;
    let target = list.scrollLeft;
    if (left < target) target = left;
    else if (right > target + list.clientWidth) target = right - list.clientWidth;
    list.scrollTo({ left: target, behavior: motionStopped() ? 'instant' : 'smooth' });
  };
  const player = sequence({
    root: industryRoot, count: tabs.length, period: 6000, observe: one('.industry-panels', industryRoot),
    render(index) {
      selected = index;
      tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
      panels.forEach((panel, i) => { panel.classList.toggle('active', i === index); panel.setAttribute('aria-hidden', String(i !== index)); panel.tabIndex = i === index ? 0 : -1; });
      revealTab(index);
      place();
    },
    progress(index, amount) { tabs.forEach((tab, i) => tab.style.setProperty('--progress', i === index ? amount : 0)); }
  });
  tabs.forEach((tab, index) => tab.addEventListener('click', () => player.select(index)));
  panels.forEach((panel, index) => panel.addEventListener('click', event => {
    if (index !== player.current) { event.preventDefault(); player.select(index); }
  }));
  arrowKeys(tabs, index => player.select(index));
  new ResizeObserver(place).observe(one('.industry-panels', industryRoot));
  let drag;
  let dragged = false;
  list.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button === 0 && list.scrollWidth > list.clientWidth) {
      drag = { x: event.clientX, scroll: list.scrollLeft, id: event.pointerId };
      dragged = false;
    }
  });
  list.addEventListener('pointermove', event => {
    if (!drag) return;
    const delta = event.clientX - drag.x;
    if (Math.abs(delta) > 5) {
      dragged = true;
      list.classList.add('dragging');
      list.setPointerCapture(drag.id);
      list.scrollLeft = drag.scroll - delta;
    }
  });
  const release = () => { drag = undefined; list.classList.remove('dragging'); };
  list.addEventListener('pointerup', release);
  list.addEventListener('pointercancel', release);
  list.addEventListener('click', event => { if (dragged) { event.preventDefault(); event.stopImmediatePropagation(); dragged = false; } }, true);
  let swipe;
  let swiped = false;
  const swipeArea = one('.industry-panels', industryRoot);
  swipeArea.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') { swipe = { x: event.clientX, y: event.clientY }; swiped = false; } });
  swipeArea.addEventListener('pointerup', event => {
    if (!swipe) return;
    const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) { player.select(player.current + (dx < 0 ? 1 : -1)); swiped = true; }
    swipe = undefined;
  });
  swipeArea.addEventListener('click', event => { if (swiped) { event.preventDefault(); event.stopImmediatePropagation(); swiped = false; } }, true);
}

const exampleRoot = one('[data-sequence="expertise"]');
if (exampleRoot) {
  const stage = one('.expertise-stage', exampleRoot);
  const cards = all('[data-example]', exampleRoot);
  const sizeCards = () => {
    const style = getComputedStyle(stage);
    const folded = parseFloat(style.getPropertyValue('--fold')) || 120;
    const gap = parseFloat(style.columnGap) || 20;
    const width = style.flexDirection === 'column' ? stage.clientWidth : stage.clientWidth - (cards.length - 1) * (folded + gap);
    stage.style.setProperty('--open-width', `${Math.max(200, width)}px`);
  };
  new ResizeObserver(sizeCards).observe(stage);
  sizeCards();
  const player = sequence({
    root: exampleRoot, hold: stage, observe: stage, count: cards.length, period: 8000,
    render(index) { cards.forEach((card, i) => { card.classList.toggle('active', i === index); card.classList.remove('marked'); card.setAttribute('aria-expanded', String(i === index)); }); },
    frame(index, elapsed) { cards[index].classList.toggle('marked', elapsed >= 1100 || motionStopped()); }
  });
  cards.forEach((card, index) => card.addEventListener('click', () => player.select(index)));
  one('[data-example-prev]', exampleRoot).addEventListener('click', () => player.select(player.current - 1));
  one('[data-example-next]', exampleRoot).addEventListener('click', () => player.select(player.current + 1));
  arrowKeys(cards, index => player.select(index));
}

const howRoot = one('[data-sequence="how"]');
if (howRoot) {
  const slides = all('[data-how-panel]', howRoot);
  const dashes = all('[data-slide]', howRoot);
  const player = sequence({
    root: howRoot, observe: one('.how-frame', howRoot), count: slides.length, period: 6000,
    render(index) {
      slides.forEach((slide, i) => { slide.classList.toggle('active', i === index); slide.setAttribute('aria-hidden', String(i !== index)); });
      dashes.forEach((dash, i) => { dash.classList.toggle('active', i === index); dash.classList.toggle('done', i < index); dash.setAttribute('aria-pressed', String(i === index)); });
      one('#how-count', howRoot).textContent = `${String(index + 1).padStart(2, '0')} / 07`;
    },
    progress(index, amount) { dashes.forEach((dash, i) => dash.style.setProperty('--progress', i === index ? amount : 0)); }
  });
  dashes.forEach((dash, index) => dash.addEventListener('click', () => player.select(index)));
  one('[data-slide-prev]', howRoot).addEventListener('click', () => player.select(player.current - 1));
  one('[data-slide-next]', howRoot).addEventListener('click', () => player.select(player.current + 1));
  arrowKeys(dashes, index => player.select(index));
  const grow = () => {
    const top = howRoot.getBoundingClientRect().top;
    const fraction = motionStopped() ? 1 : Math.min(1, Math.max(0, 1 - top / (innerHeight * .85)));
    howRoot.style.setProperty('--grow', (fraction * fraction * (3 - 2 * fraction)).toFixed(4));
  };
  let pending = false;
  addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { grow(); pending = false; });
  }, { passive: true });
  addEventListener('resize', grow);
  addEventListener('tacit:motionchange', grow);
  grow();
  new IntersectionObserver(([entry]) => { howRoot.classList.toggle('story-visible', entry.isIntersecting); }, { threshold: .2 }).observe(one('.how-example', howRoot));
}

const learningRoot = one('[data-sequence="learning"]');
if (learningRoot) {
  const stage = one('.context-stage', learningRoot);
  const buttons = all('[data-learning]', learningRoot);
  const panels = all('.learning-panel', learningRoot);
  const results = all('[data-result]', stage);
  const cells = all('.source-cell', stage);
  const sourceGroups = [[0, 1, 5], [1, 2], [3, 4], [0, 2, 4]];
  const wordLists = results.map(result => {
    const paragraph = one('.context-result-text', result);
    const words = paragraph.textContent.split(/\s+/);
    paragraph.replaceChildren(...words.flatMap((word, i) => {
      const span = document.createElement('span');
      span.className = 'context-word';
      span.textContent = word;
      return i ? [document.createTextNode(' '), span] : [span];
    }));
    return all('.context-word', paragraph);
  });
  let lastPhase = -1;
  let lastWordCount = -1;
  function renderScene(index, elapsed) {
    const frozen = motionStopped();
    const phase = frozen || elapsed >= 1900 ? 3 : elapsed >= 1100 ? 2 : elapsed >= 300 ? 1 : 0;
    if (phase !== lastPhase) {
      stage.dataset.phase = phase;
      cells.forEach(cell => cell.classList.toggle('lit', phase > 0 && sourceGroups[index].includes(Number(cell.dataset.source))));
      lastPhase = phase;
    }
    stage.classList.toggle('thinking', !frozen && elapsed >= 1900 && elapsed < 2650);
    const wordCount = frozen ? Infinity : Math.max(0, Math.floor((elapsed - 2650) / 45));
    if (wordCount !== lastWordCount) { wordLists[index].forEach((word, i) => word.classList.toggle('waiting', i >= wordCount)); lastWordCount = wordCount; }
  }
  let sceneIndex = 0, sceneElapsed = 0, sceneLast = 0, sceneVisible = false, sceneTimer;
  function sceneTick() {
    clearTimeout(sceneTimer);
    if (!sceneVisible || document.hidden || motionStopped()) return;
    const now = performance.now();
    sceneElapsed += Math.min(now - sceneLast, 160);
    sceneLast = now;
    renderScene(sceneIndex, sceneElapsed);
    if (sceneElapsed < 5000) sceneTimer = setTimeout(sceneTick, 40);
  }
  function startScene(index) {
    clearTimeout(sceneTimer);
    sceneIndex = index;
    sceneElapsed = 0;
    sceneLast = performance.now();
    lastPhase = -1; lastWordCount = -1;
    renderScene(index, motionStopped() ? 7000 : 0);
    if (sceneVisible && !motionStopped() && !document.hidden) sceneTimer = setTimeout(sceneTick, 40);
  }
  const player = sequence({
    root: learningRoot, hold: one('.learning-content', learningRoot), observe: one('.learning-grid', learningRoot), count: buttons.length, period: 7000,
    render(index) {
      stage.dataset.step = index;
      buttons.forEach((button, i) => button.setAttribute('aria-expanded', String(i === index)));
      panels.forEach((panel, i) => { panel.classList.toggle('active', i === index); panel.inert = i !== index; });
      results.forEach((result, i) => { result.hidden = i !== index; });
      // The chosen scene finishes even when hover holds the accordion's cycle.
      startScene(index);
    },
    progress(index, amount) { buttons.forEach((button, i) => button.style.setProperty('--progress', i === index ? amount : 0)); },
    frame(index) { if (motionStopped()) renderScene(index, 7000); }
  });
  new IntersectionObserver(([entry]) => {
    sceneVisible = entry.isIntersecting;
    if (sceneVisible) startScene(player.current);
    else clearTimeout(sceneTimer);
  }, { threshold: .1 }).observe(stage);
  const resumeScene = () => {
    clearTimeout(sceneTimer);
    if (motionStopped()) renderScene(player.current, 7000);
    else if (!document.hidden && sceneVisible) startScene(player.current);
  };
  addEventListener('tacit:motionchange', resumeScene);
  document.addEventListener('visibilitychange', resumeScene);
  buttons.forEach((button, index) => button.addEventListener('click', () => player.select(index)));
  arrowKeys(buttons, index => player.select(index));

  // Rotate the T in its source plane, then project each face. Its depth stays
  // vertical instead of rotating a flat, already projected picture.
  const outline = [[-100,-80],[100,-80],[100,-25],[32,-25],[32,100],[-32,100],[-32,-25],[-100,-25]];
  const sideGroup = one('.knowledge-mark-sides', stage);
  const sidePaths = outline.map(() => { const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); sideGroup.append(path); return path; });
  const pathData = points => `M${points.map(([x,y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join('L')}Z`;
  const drawMark = degrees => {
    const radians = degrees * Math.PI / 180;
    const points = outline.map(([x,y]) => {
      const u = x * Math.cos(radians) - y * Math.sin(radians);
      const v = x * Math.sin(radians) + y * Math.cos(radians);
      return [360 + (u - v) * .98, 378 + (u + v) * .44];
    });
    one('.knowledge-mark-base', stage).setAttribute('d', pathData(points.map(([x,y]) => [x,y+15])));
    sidePaths.forEach((path, i) => { const a = points[i], b = points[(i + 1) % points.length]; path.setAttribute('d', pathData([a,b,[b[0],b[1]+15],[a[0],a[1]+15]])); });
    one('.knowledge-mark-top', stage).setAttribute('d', pathData(points));
  };
  drawMark(12);
  let rotationVisible = false;
  let rotationTimer;
  let angle = 12;
  let previousTime = 0;
  function spin() {
    clearTimeout(rotationTimer);
    if (!rotationVisible || document.hidden || motionStopped()) return;
    const now = performance.now();
    angle = (angle + Math.min(now - previousTime, 100) * .006) % 360;
    previousTime = now;
    drawMark(angle);
    rotationTimer = setTimeout(spin, 40);
  }
  const resumeSpin = () => { previousTime = performance.now(); spin(); };
  new IntersectionObserver(([entry]) => { rotationVisible = entry.isIntersecting; resumeSpin(); }, { threshold: .1 }).observe(stage);
  addEventListener('tacit:motionchange', resumeSpin);
  document.addEventListener('visibilitychange', resumeSpin);
}

const rotator = one('.rotator');
if (rotator) {
  const words = all('.rotator-word', rotator);
  let cleanup;
  sequence({ root: one('.hero'), hold: rotator, observe: one('.hero'), count: words.length, period: 3600,
    render(index) {
      clearTimeout(cleanup);
      words.forEach((word, i) => { word.classList.toggle('previous', word.classList.contains('active') && i !== index); word.classList.toggle('active', i === index); });
      cleanup = setTimeout(() => words.forEach(word => word.classList.remove('previous')), 900);
    }
  });
}

// Background video decoding also follows visibility, including the shared clip
// used in the hero, expanding story, and masked knowledge scene.
const videoStates = new Map();
const updateVideos = () => videoStates.forEach((visible, video) => {
  if (visible && !motionStopped() && !document.hidden) video.play().catch(() => {});
  else video.pause();
});
const videoObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => videoStates.set(entry.target, entry.isIntersecting));
  updateVideos();
}, { rootMargin: '120px 0px' });
all('video').forEach(video => { video.muted = true; videoStates.set(video, false); videoObserver.observe(video); });
const refreshMotion = () => { sequences.forEach(player => player.refresh()); updateVideos(); };
addEventListener('tacit:motionchange', refreshMotion);
motionPreference.addEventListener('change', refreshMotion);
document.addEventListener('visibilitychange', updateVideos);
document.body.classList.add('motion-ready');
refreshMotion();
