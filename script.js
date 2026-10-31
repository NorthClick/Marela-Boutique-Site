const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
}

document.querySelectorAll('.look').forEach(card => {
  const canToggleOff = !!card.closest('.swap-grid');
  const activate = () => {
    canToggleOff ? card.classList.toggle('active') : card.classList.add('active');
  };
  card.addEventListener('click', activate);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  });
});

document.querySelectorAll('.carousel').forEach(carousel => {
  const viewport = carousel.querySelector('.carousel-viewport');
  const track = carousel.querySelector('.carousel-grid');
  const prevBtn = carousel.querySelector('.car-prev');
  const nextBtn = carousel.querySelector('.car-next');
  if (!track || !viewport) return;

  const MIN_GAP = 20;
  let unitWidth = 0, gap = MIN_GAP, visibleCount = 1, animating = false;

  // A "card" is the background shape + photo together, measured as one unit
  // (the .look flex-basis already equals that combined width). Cards are laid
  // out like justify-content:space-evenly: equal gap between cards AND between
  // the outer cards and the viewport edge, with a 20px floor. We always show
  // the max number of cards that keeps the gap at or above that floor.
  const measure = () => {
    const cards = [...track.children];
    if (!cards.length) return;
    unitWidth = cards[0].getBoundingClientRect().width;

    const arrowReserve = (prevBtn ? prevBtn.offsetWidth : 0) + 16;
    const available = carousel.clientWidth - arrowReserve * 2;

    let n = 1, g = MIN_GAP;
    for (let candidate = cards.length; candidate >= 1; candidate--) {
      const candidateGap = (available - candidate * unitWidth) / (candidate + 1);
      if (candidateGap >= MIN_GAP) { n = candidate; g = candidateGap; break; }
      if (candidate === 1) { n = 1; g = Math.max(MIN_GAP, candidateGap); }
    }

    visibleCount = n;
    gap = g;

    track.style.columnGap = gap + 'px';
    viewport.style.paddingLeft = gap + 'px';
    viewport.style.paddingRight = gap + 'px';
    // Normally n*unitWidth + (n+1)*gap === available exactly. But once the
    // 20px floor kicks in on very narrow screens, gap can be forced above
    // what "available" allows — the viewport must grow to match, or the
    // photo (which fully fills its own card unit) would get clipped.
    viewport.style.width = Math.max(available, n * unitWidth + (n + 1) * gap) + 'px';

    const canNavigate = cards.length > visibleCount;
    if (prevBtn) prevBtn.style.visibility = canNavigate ? 'visible' : 'hidden';
    if (nextBtn) nextBtn.style.visibility = canNavigate ? 'visible' : 'hidden';

    updateActiveCards();
  };

  // The visible window is always the first `visibleCount` children (next/prev
  // keep that invariant by reordering the DOM once each slide settles), so we
  // don't need scroll-position math — just pick the middle of that window.
  // Odd count → the single center card. Even count → both middle cards.
  // `orderedCards` lets a caller pass the *predicted* post-slide order before
  // the DOM itself has been reordered, so the pop can start as the card
  // slides in instead of waiting for it to arrive.
  const updateActiveCards = (orderedCards) => {
    const cards = orderedCards || [...track.children];
    const centerIndices = visibleCount % 2 === 1
      ? [(visibleCount - 1) / 2]
      : [visibleCount / 2 - 1, visibleCount / 2];
    const nextActive = centerIndices.map(i => cards[i]).filter(Boolean);

    cards.forEach(c => c.classList.remove('active'));
    // A forced reflow alone isn't enough: if a card stays active across the
    // slide, its class list is unchanged start-to-end within this same task,
    // so the browser never paints the "removed" state and skips the
    // transition — the pop looks frozen instead of replaying. Waiting two
    // frames lets that reset state actually render before we reapply
    // "active", so every center card — carried over or brand new — restarts
    // the pop in sync (same double-rAF pattern prev() already uses below).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        nextActive.forEach(c => c.classList.add('active'));
      });
    });
  };

  measure();
  window.addEventListener('resize', measure);

  const step = () => unitWidth + gap;

  const settle = () => {
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    void track.offsetHeight;
    track.style.transition = '';
  };

  const next = () => {
    const cards = [...track.children];
    if (animating || cards.length <= visibleCount) return;
    animating = true;
    track.style.transform = `translateX(-${step()}px)`;
    // Card 0 is the one sliding out; appendChild happens later, once the
    // slide settles, but we can predict that final order right now so the
    // new center card's pop starts as it enters instead of after it stops.
    updateActiveCards([...cards.slice(1), cards[0]]);
    // transitionend bubbles up from any descendant (e.g. a look-model's own
    // pop transition), so ignore anything that isn't the track's own slide.
    const onEnd = e => {
      if (e.target !== track) return;
      track.removeEventListener('transitionend', onEnd);
      track.appendChild(cards[0]);
      settle();
      animating = false;
    };
    track.addEventListener('transitionend', onEnd);
  };

  const prev = () => {
    const cards = [...track.children];
    if (animating || cards.length <= visibleCount) return;
    animating = true;
    const last = cards[cards.length - 1];
    track.insertBefore(last, track.firstChild);
    // The DOM is already in its final order at this point, so the new center
    // card's pop can start right away instead of waiting for the slide-back
    // animation below to finish.
    updateActiveCards();
    track.style.transition = 'none';
    track.style.transform = `translateX(-${step()}px)`;
    void track.offsetHeight;
    track.style.transition = '';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        track.style.transform = 'translateX(0)';
      });
    });
    const onEnd = e => {
      if (e.target !== track) return;
      track.removeEventListener('transitionend', onEnd);
      animating = false;
    };
    track.addEventListener('transitionend', onEnd);
  };

  prevBtn && prevBtn.addEventListener('click', prev);
  nextBtn && nextBtn.addEventListener('click', next);

  let timer = setInterval(next, 5000);
  const restart = () => {
    clearInterval(timer);
    timer = setInterval(next, 5000);
  };
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', restart);
  carousel.addEventListener('touchstart', () => clearInterval(timer), { passive: true });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
