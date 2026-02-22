// Shared navigation controls for hamburger toggle, submenus, and hover behavior
if (window.__navInitDone) {
  // Prevent duplicate initialization if script is loaded twice
} else {
  window.__navInitDone = true;

// Toggle slide-in menu and hamburger → X
// Key elements for the toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = navLinks ? navLinks.querySelectorAll('a') : [];
const plusButtons = navLinks ? navLinks.querySelectorAll('.nav-plus') : [];
const innerPlusButtons = navLinks ? navLinks.querySelectorAll('.nav-sub .nav-plus') : [];
const hoverSubs = navLinks ? navLinks.querySelectorAll('.has-sub') : [];
const hoverTimers = new WeakMap();
const desktopMedia = window.matchMedia('(min-width: 1025px)');
const mobileMedia = window.matchMedia('(max-width: 1024px)');

// Mobile submenu height controller to avoid lingering open panels
const setMobileSubState = (item, isOpen) => {
  if (!item) return;
  const sub = item.querySelector(':scope > .nav-sub');
  if (!sub) return;
  sub.style.maxHeight = isOpen ? `${sub.scrollHeight}px` : '0px';
  sub.style.opacity = isOpen ? '1' : '0';
  sub.style.visibility = isOpen ? 'visible' : 'hidden';
  sub.style.pointerEvents = isOpen ? 'auto' : 'none';
};

// Prevent link handler firing on the same tap as open
let menuOpenedAt = 0;

// Explicit close helper (used on resize)
const closeMenu = () => {
  if (!navLinks || !hamburger) return;
  const wasActive = navLinks.classList.contains('active');
  if (wasActive) {
    navLinks.classList.add('closing');
  } else {
    navLinks.classList.remove('closing');
  }
  navLinks.classList.remove('active');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  // Reset any expanded mobile submenus
  document.querySelectorAll('.has-sub.open').forEach((item) => {
    item.classList.remove('open');
  });
  document.querySelectorAll('.has-sub.mobile-open').forEach((item) => {
    item.classList.remove('mobile-open');
    setMobileSubState(item, false);
  });
  // Clear any inline states on submenus when the menu closes
  document.querySelectorAll('.nav-sub').forEach((sub) => {
    sub.style.maxHeight = '';
    sub.style.opacity = '';
    sub.style.visibility = '';
    sub.style.pointerEvents = '';
  });
  // Let the closing animation play, then fully reset if we were open
  if (wasActive) {
    setTimeout(() => navLinks.classList.remove('closing'), 320);
  }
};

// Underline the link for the current section/hash
const setActiveLink = () => {
  const currentHash = window.location.hash || '#home';
  links.forEach((link) => {
    const href = link.getAttribute('href');
    const isActive = href === currentHash || (!window.location.hash && href === '#home');
    link.classList.toggle('active', isActive);
  });
};

const toggleMenu = () => {
  if (!navLinks || !hamburger) return;
  const isOpen = navLinks.classList.contains('active');
  if (isOpen) {
    closeMenu();
    return;
  }
  navLinks.classList.add('active');
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  menuOpenedAt = Date.now();
  setActiveLink();
};

if (hamburger) {
  hamburger.addEventListener('click', toggleMenu);
}
links.forEach((link) => {
  link.addEventListener('click', () => {
    const justOpened = Date.now() - menuOpenedAt < 350;
    if (navLinks && navLinks.classList.contains('active') && !justOpened) {
      toggleMenu();
    }
    setActiveLink();
  });
});

// Close the menu whenever the viewport is resized (prevents flicker on breakpoint changes)
window.addEventListener('resize', () => {
  closeMenu();
  // Clear any open mobile submenus on resize to avoid sticky states
  document.querySelectorAll('.has-sub.open').forEach((item) => {
    item.classList.remove('open');
  });
});

desktopMedia.addEventListener('change', (e) => {
  if (e.matches) {
    // Ensure mobile-only open states are cleared when entering desktop
    closeMenu();
  }
});
mobileMedia.addEventListener('change', (e) => {
  if (!e.matches) {
    // Clear mobile submenu states when leaving mobile
    document.querySelectorAll('.has-sub.mobile-open, .has-sub.open').forEach((item) => {
      item.classList.remove('mobile-open', 'open');
      setMobileSubState(item, false);
    });
  }
});

// Keep active state in sync when hash changes (e.g., back/forward buttons)
window.addEventListener('hashchange', setActiveLink);

// Initial active state on load
setActiveLink();

// HC - Menu circle buttons (+ → x) logic for mobile submenu toggles
// Toggle mobile submenus when plus icons are clicked
plusButtons.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!mobileMedia.matches || !navLinks || !navLinks.classList.contains('active')) return;
    const parent = btn.closest('.has-sub');
    if (parent) {
      const willOpen = !parent.classList.contains('mobile-open');
      parent.classList.toggle('mobile-open', willOpen);
      setMobileSubState(parent, willOpen);
    }
  });
});

// HC - Menu circle buttons (+ → x) logic for nested submenu toggles
// Toggle inner submenus when plus icons are clicked (e.g., Official #1 evidence)
innerPlusButtons.forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!mobileMedia.matches || !navLinks || !navLinks.classList.contains('active')) return;
    const parent = btn.closest('.has-sub');
    if (parent) {
      const willOpen = !parent.classList.contains('mobile-open');
      parent.classList.toggle('mobile-open', willOpen);
      setMobileSubState(parent, willOpen);
    }
  });
});

// Close the mobile menu when clicking outside it or the hamburger
document.addEventListener('click', (e) => {
  const isClickInside = (navLinks && navLinks.contains(e.target)) || (hamburger && hamburger.contains(e.target));
  if (!isClickInside && navLinks && navLinks.classList.contains('active')) {
    closeMenu();
  }
});

// Desktop hover: open on parent hover, close when leaving parent and submenu; close others immediately
hoverSubs.forEach((item) => {
  const sub = item.querySelector(':scope > .nav-sub');

  const clearHoverTimer = () => {
    const t = hoverTimers.get(item);
    if (t) clearTimeout(t);
  };
  const closeHover = () => {
    clearHoverTimer();
    item.classList.remove('hover-open');
  };
  const closeHoverDelayed = () => {
    clearHoverTimer();
    const t = setTimeout(() => closeHover(), 1000);
    hoverTimers.set(item, t);
  };

  item.addEventListener('mouseenter', () => {
    clearHoverTimer();
    hoverSubs.forEach((other) => {
      if (other !== item) other.classList.remove('hover-open');
    });
    item.classList.add('hover-open');
  });

  item.addEventListener('mouseleave', (e) => {
    if (sub && sub.contains(e.relatedTarget)) return;
    closeHoverDelayed();
  });

  if (sub) {
    sub.addEventListener('mouseenter', () => {
      clearHoverTimer();
    });
    sub.addEventListener('mouseleave', (e) => {
      if (item.contains(e.relatedTarget)) return;
      closeHoverDelayed();
    });
  }
});
}
