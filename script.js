/* ============================================
   OPTIMIZED PORTFOLIO SCRIPT
   - Single initMatrixRain call
   - API response caching
   - Debounced scroll handler
   - Deferred non-critical work
   - Fixed variable bug in fallback API
   ============================================ */

// ===== CONFIG =====
const CONFIG = {
  GITHUB_USERNAME: "rudrakshbhardwaj1",
  LEETCODE_USERNAME: "rudrakshbhardwaj1",
  REPO_COUNT: 6,
  CACHE_DURATION: 30 * 60 * 1000 // 30 minutes in ms
};

// ===== LOADER - Hide ASAP =====
// Use requestAnimationFrame for smoother hide
function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hide');
    // Remove from DOM after transition to free memory
    setTimeout(() => loader.remove(), 500);
  }
}

if (document.readyState === 'complete') {
  hideLoader();
} else {
  window.addEventListener('load', hideLoader, { once: true });
}

// ===== UTILITY: Debounce =====
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ===== UTILITY: Simple Cache =====
const cache = {
  set(key, data) {
    try {
      sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    } catch(e) { /* ignore storage errors */ }
  },
  get(key) {
    try {
      const item = JSON.parse(sessionStorage.getItem(key));
      if (item && Date.now() - item.ts < CONFIG.CACHE_DURATION) {
        return item.data;
      }
    } catch(e) {}
    return null;
  }
};

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
let lastScroll = 0;
let ticking = false;

function onScroll() {
  lastScroll = window.scrollY;
  if (!ticking) {
    requestAnimationFrame(() => {
      navbar.classList.toggle('scrolled', lastScroll > 50);
      toggleBackToTop(lastScroll);
      highlightNav(lastScroll);
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('active') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)) {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
  }
});

// ===== ACTIVE NAV =====
const sections = Array.from(document.querySelectorAll('section[id]'));
const navLinkEls = document.querySelectorAll('.nav-links a');

function highlightNav(scrollPos) {
  const offset = scrollPos + 160;
  let currentId = '';
  sections.forEach(section => {
    if (offset >= section.offsetTop) {
      currentId = section.getAttribute('id');
    }
  });
  navLinkEls.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${currentId}`);
  });
}

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');

// Apply saved theme immediately (no flash)
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-mode');
  themeToggle.innerHTML = isDark
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// ===== TYPED TEXT =====
const typedEl = document.getElementById('typed');
const phrases = ["Frontend Developer", "DSA Enthusiast", "MERN Stack Developer", "Problem Solver"];
let phraseIndex = 0, charIndex = 0, isDeleting = false;

function typeEffect() {
  const current = phrases[phraseIndex];
  typedEl.textContent = isDeleting
    ? current.substring(0, charIndex - 1)
    : current.substring(0, charIndex + 1);

  if (isDeleting) charIndex--;
  else charIndex++;

  let speed = isDeleting ? 45 : 95;

  if (!isDeleting && charIndex === current.length) {
    speed = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    speed = 400;
  }
  setTimeout(typeEffect, speed);
}

// Start typed effect after a brief delay
setTimeout(typeEffect, 800);

// ===== BACK TO TOP =====
const backToTopBtn = document.getElementById('backToTop');

function toggleBackToTop(scrollY) {
  backToTopBtn.classList.toggle('show', scrollY > 400);
}

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== INTERSECTION OBSERVER - Scroll Reveal =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target); // Stop observing once visible
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

// Add fade-up to elements and observe
document.querySelectorAll(
  '.stat-box, .info-card, .skill-category, .project-card, .repo-card, .section-title'
).forEach(el => {
  el.classList.add('fade-up');
  revealObserver.observe(el);
});

// ===== COUNTER ANIMATION - Only when in view =====
let countersAnimated = false;

const counterObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !countersAnimated) {
    countersAnimated = true;
    counterObserver.disconnect();
    // Counters already display static values in HTML
    // Optionally animate them:
    animateCounters();
  }
}, { threshold: 0.3 });

const statsSection = document.querySelector('.about-stats');
if (statsSection) counterObserver.observe(statsSection);

function animateCounters() {
  const counters = [
    { id: 'stat-projects', target: 5 },
    { id: 'stat-experience', target: 1 },
    { id: 'stat-problems', target: 100 },
    { id: 'stat-repos', target: 8 }
  ];
  counters.forEach(({ id, target }) => {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const step = target / 60; // ~1 second at 60fps
    function update() {
      start = Math.min(start + step, target);
      el.textContent = Math.floor(start) + '+';
      if (start < target) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// ===== GITHUB REPOS =====
async function fetchGitHubRepos() {
  const container = document.getElementById('repoContainer');
  if (!container) return;

  // Check cache first
  const cached = cache.get('github_repos');
  if (cached) {
    renderRepos(cached, container);
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(
      `https://api.github.com/users/${CONFIG.GITHUB_USERNAME}/repos?sort=updated&per_page=${CONFIG.REPO_COUNT}`,
      { signal: controller.signal, headers: { Accept: 'application/vnd.github.v3+json' } }
    );
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
    const repos = await res.json();

    cache.set('github_repos', repos);
    renderRepos(repos, container);

  } catch (err) {
    if (err.name === 'AbortError') {
      container.innerHTML = '<div class="error-repos">Request timed out. Please refresh.</div>';
    } else {
      container.innerHTML = '<div class="error-repos">⚠️ Unable to load repos. <a href="https://github.com/' + CONFIG.GITHUB_USERNAME + '" target="_blank" rel="noopener">View on GitHub →</a></div>';
    }
    console.warn('GitHub fetch failed:', err.message);
  }
}

function renderRepos(repos, container) {
  if (!repos || repos.length === 0) {
    container.innerHTML = '<div class="error-repos">No repositories found.</div>';
    return;
  }

  // Use DocumentFragment for better performance
  const fragment = document.createDocumentFragment();

  repos.forEach(repo => {
    const card = document.createElement('div');
    card.className = 'repo-card fade-up';
    card.innerHTML = `
      <div class="repo-header">
        <h3>
          <a href="${repo.html_url}" target="_blank" rel="noopener">
            <i class="fa-solid fa-code-branch"></i> ${escapeHtml(repo.name)}
          </a>
        </h3>
      </div>
      <p class="repo-desc">${escapeHtml(repo.description || 'No description available.')}</p>
      <div class="repo-meta">
        <span><span class="lang-dot"></span> ${escapeHtml(repo.language || 'N/A')}</span>
        <span><i class="fa-regular fa-star"></i> ${repo.stargazers_count}</span>
        <span><i class="fa-solid fa-code-fork"></i> ${repo.forks_count}</span>
      </div>
    `;
    fragment.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(fragment);

  // Observe new cards for animation
  container.querySelectorAll('.repo-card').forEach(card => revealObserver.observe(card));
}

// ===== HTML ESCAPE (Security) =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ===== LEETCODE STATS =====
// ===== LEETCODE STATS - RELIABLE MULTI-SOURCE =====
const LC_USERNAME = "rudrakshbhardwaj1";

// All available free APIs to try in order
const LC_APIS = [
  {
    name: "leetcode-api-faisalshahbaz",
    url: `https://leetcode-api-faisalshahbaz.vercel.app/${LC_USERNAME}`,
    parse: (data) => ({
      solved:  data.totalSolved,
      easy:    data.easySolved,
      medium:  data.mediumSolved,
      hard:    data.hardSolved,
      totalEasy:   data.totalEasy   || 850,
      totalMedium: data.totalMedium || 1800,
      totalHard:   data.totalHard   || 750,
      ranking: data.ranking ? `#${Number(data.ranking).toLocaleString()}` : "N/A",
      rate:    data.acceptanceRate  ? `${parseFloat(data.acceptanceRate).toFixed(1)}%` : "N/A"
    }),
    validate: (d) => d && d.totalSolved !== undefined
  },
  {
    name: "leetcode-stats-api",
    url: `https://leetcode-stats-api.herokuapp.com/${LC_USERNAME}`,
    parse: (data) => ({
      solved:  data.totalSolved,
      easy:    data.easySolved,
      medium:  data.mediumSolved,
      hard:    data.hardSolved,
      totalEasy:   data.totalEasy   || 850,
      totalMedium: data.totalMedium || 1800,
      totalHard:   data.totalHard   || 750,
      ranking: data.ranking ? `#${Number(data.ranking).toLocaleString()}` : "N/A",
      rate:    data.acceptanceRate  ? `${parseFloat(data.acceptanceRate).toFixed(1)}%` : "N/A"
    }),
    validate: (d) => d && d.status !== "error" && d.totalSolved !== undefined
  },
  {
    name: "alfa-leetcode-api",
    url: `https://alfa-leetcode-api.onrender.com/${LC_USERNAME}/solved`,
    parse: (data) => ({
      solved:  data.solvedProblem,
      easy:    data.easySolved,
      medium:  data.mediumSolved,
      hard:    data.hardSolved,
      totalEasy:   data.totalEasy   || 850,
      totalMedium: data.totalMedium || 1800,
      totalHard:   data.totalHard   || 750,
      ranking: "N/A",
      rate:    data.acceptanceRate  ? `${parseFloat(data.acceptanceRate).toFixed(1)}%` : "N/A"
    }),
    validate: (d) => d && d.solvedProblem !== undefined
  }
];

// Cached static fallback data - UPDATE THESE WITH YOUR REAL NUMBERS
const LC_STATIC_FALLBACK = {
  solved:      70,   // <- your total solved
  easy:         44,   // <- your easy solved
  medium:       25,   // <- your medium solved
  hard:          1,   // <- your hard solved
  totalEasy:   850,
  totalMedium: 1800,
  totalHard:   750,
  ranking:     "N/A",
  rate:        "N/A",
  isStatic:    true   // flag so we can show a note
};

async function fetchWithTimeout(url, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "Accept": "application/json" }
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function fetchLeetCodeStats() {
  // Show loading state
  setLCLoading(true);

  // 1. Check session cache first (avoid repeated API calls)
  const cached = sessionStorage.getItem("lc_stats");
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      const age = Date.now() - parsed.timestamp;
      if (age < 30 * 60 * 1000) { // 30 minutes
        console.log("LeetCode: Using cached data");
        renderLeetCodeStats(parsed.data);
        setLCLoading(false);
        return;
      }
    } catch(e) {
      sessionStorage.removeItem("lc_stats");
    }
  }

  // 2. Try each API in order
  for (const api of LC_APIS) {
    try {
      console.log(`LeetCode: Trying ${api.name}...`);
      const raw = await fetchWithTimeout(api.url, 7000);

      if (!api.validate(raw)) {
        console.warn(`LeetCode: ${api.name} returned invalid data`, raw);
        continue;
      }

      const stats = api.parse(raw);
      console.log(`LeetCode: Success from ${api.name}`, stats);

      // Cache successful response
      sessionStorage.setItem("lc_stats", JSON.stringify({
        data: stats,
        timestamp: Date.now()
      }));

      renderLeetCodeStats(stats);
      setLCLoading(false);
      return; // Stop trying after first success

    } catch (err) {
      console.warn(`LeetCode: ${api.name} failed -`, err.message);
      // Continue to next API
    }
  }

  // 3. All APIs failed - use static fallback
  console.warn("LeetCode: All APIs failed, using static fallback");
  renderLeetCodeStats(LC_STATIC_FALLBACK);
  setLCLoading(false);
}

function setLCLoading(isLoading) {
  const ids = ["lcSolved", "lcRanking", "lcStreak"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el && isLoading) {
      el.innerHTML = '<span class="lc-loading">...</span>';
    }
  });
}

function renderLeetCodeStats(stats) {
  // Update main numbers
  const solvedEl  = document.getElementById("lcSolved");
  const rankEl    = document.getElementById("lcRanking");
  const rateEl    = document.getElementById("lcStreak");
  const easyEl    = document.getElementById("easyCount");
  const mediumEl  = document.getElementById("mediumCount");
  const hardEl    = document.getElementById("hardCount");
  const easyBar   = document.getElementById("easyBar");
  const mediumBar = document.getElementById("mediumBar");
  const hardBar   = document.getElementById("hardBar");

  if (solvedEl)  solvedEl.textContent  = stats.solved  ?? "--";
  if (rankEl)    rankEl.textContent    = stats.ranking ?? "--";
  if (rateEl)    rateEl.textContent    = stats.rate    ?? "--";
  if (easyEl)    easyEl.textContent    = stats.easy    ?? 0;
  if (mediumEl)  mediumEl.textContent  = stats.medium  ?? 0;
  if (hardEl)    hardEl.textContent    = stats.hard    ?? 0;

  // Animate progress bars
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (easyBar) {
        easyBar.style.width = `${Math.min(
          ((stats.easy ?? 0) / stats.totalEasy) * 100, 100
        )}%`;
      }
      if (mediumBar) {
        mediumBar.style.width = `${Math.min(
          ((stats.medium ?? 0) / stats.totalMedium) * 100, 100
        )}%`;
      }
      if (hardBar) {
        hardBar.style.width = `${Math.min(
          ((stats.hard ?? 0) / stats.totalHard) * 100, 100
        )}%`;
      }
    }, 300);
  });

  // If using static fallback, show a note
  if (stats.isStatic) {
    const card = document.querySelector(".leetcode-card");
    if (card && !card.querySelector(".lc-static-note")) {
      const note = document.createElement("p");
      note.className = "lc-static-note";
      note.style.cssText = `
        color: var(--text-gray);
        font-size: 0.82rem;
        margin: -20px 0 20px;
        opacity: 0.8;
      `;
      note.innerHTML = `
        ⚠️ Live data temporarily unavailable. Stats shown may not be current.
        <a href="https://leetcode.com/${LC_USERNAME}" target="_blank" 
           rel="noopener" style="color:var(--primary);margin-left:5px;">
          View live profile →
        </a>
      `;
      const btn = card.querySelector(".btn");
      if (btn) card.insertBefore(note, btn);
    }
  }
}

// Add loading spinner CSS dynamically
const lcStyle = document.createElement("style");
lcStyle.textContent = `
  .lc-loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(108,92,231,0.2);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    vertical-align: middle;
  }
`;
document.head.appendChild(lcStyle);

// Fetch when LeetCode section enters viewport (lazy load)
const lcSection = document.getElementById("leetcode");
if (lcSection) {
  const lcObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      lcObserver.disconnect();
      fetchLeetCodeStats();
    }
  }, { threshold: 0.1 });
  lcObserver.observe(lcSection);
} else {
  // Fallback: fetch after delay
  setTimeout(fetchLeetCodeStats, 1000);
}

function renderLeetCodeStats(stats) {
  document.getElementById('lcSolved').textContent = stats.solved;
  document.getElementById('lcRanking').textContent = stats.ranking;
  document.getElementById('lcStreak').textContent = stats.acceptanceRate;
  document.getElementById('easyCount').textContent = stats.easy;
  document.getElementById('mediumCount').textContent = stats.medium;
  document.getElementById('hardCount').textContent = stats.hard;

  // Animate bars after a short delay
  requestAnimationFrame(() => {
    setTimeout(() => {
      const eBar = document.getElementById('easyBar');
      const mBar = document.getElementById('mediumBar');
      const hBar = document.getElementById('hardBar');
      if (eBar) eBar.style.width = `${Math.min((stats.easy / stats.totalEasy) * 100, 100)}%`;
      if (mBar) mBar.style.width = `${Math.min((stats.medium / stats.totalMedium) * 100, 100)}%`;
      if (hBar) hBar.style.width = `${Math.min((stats.hard / stats.totalHard) * 100, 100)}%`;
    }, 400);
  });
}

function showLeetCodeError() {
  ['lcSolved', 'lcRanking', 'lcStreak'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = 'N/A';
  });
  const card = document.querySelector('.leetcode-card');
  if (card) {
    const msg = document.createElement('p');
    msg.style.cssText = 'color:var(--text-gray);margin:15px 0;font-size:0.88rem;';
    msg.textContent = '⚠️ Live stats temporarily unavailable. Visit profile directly.';
    const btn = card.querySelector('.btn');
    if (btn) card.insertBefore(msg, btn);
  }
}

// ===== MATRIX RAIN - Optimized =====
function initMatrixRain() {
  // Only run on desktop and only if canvas exists
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;

  // Skip on mobile for performance
  if (window.innerWidth < 768) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let animId;
  let lastTime = 0;
  const FPS = 20; // Reduced from 20fps (was effectively 20fps at 50ms interval)
  const INTERVAL = 1000 / FPS;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  const fontSize = 14;
  const chars = "01{}<>/;=+アイウエカキク".split('');
  let columns = Math.floor(canvas.width / fontSize);
  let drops = Array(columns).fill(1);

  const isDarkMode = () => document.body.classList.contains('dark-mode');

  function draw(timestamp) {
    animId = requestAnimationFrame(draw);
    if (timestamp - lastTime < INTERVAL) return;
    lastTime = timestamp;

    ctx.fillStyle = isDarkMode()
      ? 'rgba(18, 18, 32, 0.08)'
      : 'rgba(248, 249, 252, 0.12)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = isDarkMode() ? '#6c5ce7' : '#6c5ce7';
    ctx.font = fontSize + 'px monospace';
    ctx.globalAlpha = 0.5;

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    ctx.globalAlpha = 1;
  }

  animId = requestAnimationFrame(draw);

  // Handle resize with debounce
  const handleResize = debounce(() => {
    resize();
    columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns).fill(1);
  }, 300);

  window.addEventListener('resize', handleResize, { passive: true });

  // Pause matrix when tab not visible (performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(draw);
    }
  });
}

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
    btn.disabled = true;
    btn.style.opacity = '0.8';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      btn.style.opacity = '1';
      contactForm.reset();
    }, 3000);

    // TODO: Integrate with EmailJS or Formspree for real submissions
  });
}

// ===== INIT - Deferred non-critical tasks =====
function init() {
  // Critical: fetch data
  fetchGitHubRepos();

  // Defer LeetCode fetch slightly (not above fold)
  setTimeout(() => fetchLeetCodeStats(), 500);

  // Defer matrix rain (not critical for UX)
  if (window.innerWidth >= 768) {
    requestIdleCallback
      ? requestIdleCallback(initMatrixRain, { timeout: 2000 })
      : setTimeout(initMatrixRain, 1000);
  }
}

// Run init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}