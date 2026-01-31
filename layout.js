(() => {
  const loadFragment = async (id, url) => {
    const target = document.getElementById(id);
    if (!target) return;
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Failed to load ${url}`);
      target.innerHTML = await res.text();
    } catch (err) {
      console.error(err);
    }
  };

  const ensureNavScript = () => {
    if (document.querySelector('script[data-nav-script]')) return;
    const script = document.createElement('script');
    script.src = 'nav.js';
    script.defer = true;
    script.dataset.navScript = 'true';
    document.body.appendChild(script);
  };

  const init = async () => {
    await Promise.all([
      loadFragment('shared-nav', 'navigation.html'),
      loadFragment('shared-footer', 'footer.html'),
    ]);
    ensureNavScript();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
