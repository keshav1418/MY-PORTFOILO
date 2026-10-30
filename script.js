/* ===== Helpers ===== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ===== Toast notifications ===== */
function showToast(message, type = 'success') {
  const container = $('#toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    // Clear animation fill-mode so inline opacity transition works smoothly
    toast.style.animation = 'none';
    toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

/* ===== Copy to clipboard (used by inline onclick & copy buttons) ===== */
async function copyToClipboard(text, message = 'Copied!') {
  if (!text) return;

  // Use modern Clipboard API if supported and in a secure context (HTTPS/localhost)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(message, 'success');
      return;
    } catch {
      // Fallback below if writeText fails or permission is denied
    }
  }

  // Fallback for older browsers, HTTP environments, or restricted iframes
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '-9999px';
    ta.style.opacity = '0';
    ta.setAttribute('readonly', '');
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, 99999); // Mobile iOS compatibility
    const success = document.execCommand('copy');
    document.body.removeChild(ta);

    if (success) {
      showToast(message, 'success');
    } else {
      showToast('Unable to copy text.', 'error');
    }
  } catch (err) {
    showToast('Failed to copy. Please copy manually.', 'error');
  }
}
window.copyToClipboard = copyToClipboard;

/* ===== Main Initialization ===== */
function initApp() {
  /* ===== Dynamic Footer Year ===== */
  const yearEl = $('#current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ===== Theme Toggle (Local Storage + System Preference) ===== */
  const root = document.documentElement;
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      root.setAttribute('data-theme', savedTheme);
    }
  } catch (e) {
    // LocalStorage not available or restricted
  }

  $('#theme-toggle')?.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', nextTheme);
    try {
      localStorage.setItem('theme', nextTheme);
    } catch (e) {}
  });

  /* ===== Mobile Navigation Menu ===== */
  const menu = $('#nav-menu');
  const toggle = $('#mobile-toggle');

  const closeMenu = () => {
    menu?.classList.remove('open');
    toggle?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  };

  toggle?.addEventListener('click', () => {
    const isOpen = menu?.classList.toggle('open');
    toggle.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close menu when clicking any nav link
  $$('.nav-link').forEach(link => link.addEventListener('click', closeMenu));

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (menu?.classList.contains('open') && !menu.contains(e.target) && !toggle?.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu?.classList.contains('open')) {
      closeMenu();
    }
  });

  /* ===== Navbar Scroll State, Back-To-Top & Active Nav Links ===== */
  const navbar = $('#navbar');
  const backToTop = $('#back-to-top');
  const sections = $$('main section[id]');
  const navLinks = $$('.nav-link');

  function onScroll() {
    const y = window.scrollY;
    navbar?.classList.toggle('scrolled', y > 40);
    backToTop?.classList.toggle('show', y > 500);

    let current = '';
    const scrollPos = y + 160;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = sec.id;
      }
    });

    // Ensure the last section highlights when scrolled to bottom of the document
    const isAtBottom = (window.innerHeight + Math.ceil(y)) >= (document.documentElement.scrollHeight - 60);
    if (isAtBottom && sections.length > 0) {
      current = sections[sections.length - 1].id;
    }

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ===== Typewriter Effect ===== */
  const typedEl = $('#typed-text');
  if (typedEl) {
    const roles = [
      'Python Full Stack Developer',
      'Django & React Developer',
      'REST API Builder',
      'Problem Solver'
    ];
    let r = 0, c = 0, deleting = false;

    function type() {
      const word = roles[r];
      typedEl.textContent = word.slice(0, c);

      if (!deleting && c < word.length) {
        c++;
        setTimeout(type, 80);
      } else if (!deleting) {
        deleting = true;
        setTimeout(type, 1600); // Pause on completed word
      } else if (c > 0) {
        c--;
        setTimeout(type, 40);
      } else {
        deleting = false;
        r = (r + 1) % roles.length;
        setTimeout(type, 350); // Pause before next word
      }
    }
    type();
  }

  /* ===== Copy Python Code Snippet ===== */
  $('#copy-code-btn')?.addEventListener('click', () => {
    const code = $('.python-snippet')?.innerText || '';
    copyToClipboard(code, 'Code snippet copied!');
  });

  /* ===== Animate Skill Bars on View ===== */
  const bars = $$('.skill-progress');
  bars.forEach(bar => {
    bar.dataset.width = bar.style.width || '100%';
    bar.style.width = '0%';
  });

  if ('IntersectionObserver' in window) {
    const barObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width;
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    bars.forEach(bar => barObserver.observe(bar));
  } else {
    // Fallback for older browsers without IntersectionObserver
    bars.forEach(bar => { bar.style.width = bar.dataset.width; });
  }

  /* ===== Scroll Reveal Animations ===== */
  const revealTargets = $$(
    '.about-card, .highlight-card, .skill-category-card, .timeline-card, ' +
    '.project-card, .credential-card, .resume-card, .contact-card, .contact-form-card'
  );

  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('visible'));
  }

  /* ===== Project Filter System ===== */
  const filterBtns = $$('.filter-btn');
  const cards = $$('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = (btn.dataset.filter || 'all').toLowerCase();

      cards.forEach(card => {
        const categories = (card.dataset.category || '').toLowerCase().trim().split(/\s+/);
        const match = filter === 'all' || categories.includes(filter);

        card.classList.toggle('hide', !match);

        if (match) {
          card.classList.add('visible');
          card.classList.remove('fade-in');
          void card.offsetWidth; // Trigger reflow to restart CSS animation
          card.classList.add('fade-in');
        }
      });
    });
  });

  /* ===== Interactive Contact Form ===== */
  const form = $('#contact-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = $('#form-name')?.value.trim();
    const email = $('#form-email')?.value.trim();
    const subject = $('#form-subject')?.value.trim() || 'Python Developer Opportunity / Inquiry';
    const message = $('#form-message')?.value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    const body = `${message}\r\n\r\n—\r\nFrom: ${name}\r\nEmail: ${email}`;
    const mailtoUrl = `mailto:keshavmanchikanti@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    showToast('Opening your default email client…', 'success');
    form.reset();
  });
}

/* Ensure DOM is loaded before running */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}